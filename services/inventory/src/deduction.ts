import db from '@kitchenos/db';
import { TransactionReason } from '@kitchenos/types';
import { publishEvent } from './events';

export async function deductInventory(orderId: string) {
  const client = await db.getClient();

  try {
    await client.query('BEGIN');

    // Get order items
    const orderItemsResult = await client.query(`
      SELECT oi.*, d.name as dish_name
      FROM order_items oi
      JOIN dishes d ON oi.dish_id = d.id
      WHERE oi.order_id = $1
    `, [orderId]);

    if (orderItemsResult.rows.length === 0) {
      console.warn(`No items found for order ${orderId}`);
      await client.query('ROLLBACK');
      return;
    }

    console.log(`Processing ${orderItemsResult.rows.length} items for order ${orderId}`);

    // For each order item, get recipe and deduct ingredients
    for (const orderItem of orderItemsResult.rows) {
      const recipeResult = await client.query(`
        SELECT 
          ri.*,
          i.name as ingredient_name,
          i.stock_quantity,
          i.alert_threshold
        FROM recipe_items ri
        JOIN ingredients i ON ri.ingredient_id = i.id
        WHERE ri.dish_id = $1
      `, [orderItem.dish_id]);

      if (recipeResult.rows.length === 0) {
        console.warn(`No recipe found for dish ${orderItem.dish_name}`);
        continue;
      }

      // Deduct each ingredient
      for (const recipeItem of recipeResult.rows) {
        const totalDeduction = recipeItem.quantity * orderItem.quantity;

        // Update stock
        const updateResult = await client.query(`
          UPDATE ingredients
          SET stock_quantity = stock_quantity - $1
          WHERE id = $2
          RETURNING stock_quantity, alert_threshold, name
        `, [totalDeduction, recipeItem.ingredient_id]);

        const updatedIngredient = updateResult.rows[0];

        // Log transaction
        await client.query(`
          INSERT INTO inventory_transactions
          (ingredient_id, order_id, quantity_changed, reason)
          VALUES ($1, $2, $3, $4)
        `, [
          recipeItem.ingredient_id,
          orderId,
          -totalDeduction,
          TransactionReason.ORDER_READY,
        ]);

        console.log(`✅ Deducted ${totalDeduction}${recipeItem.unit} of ${recipeItem.ingredient_name}`);

        // Check if stock is low
        if (updatedIngredient.stock_quantity <= updatedIngredient.alert_threshold) {
          console.warn(`⚠️  Low stock alert: ${updatedIngredient.name}`);
          
          // Publish low stock event
          await publishEvent({
            type: 'inventory.low',
            payload: {
              ingredientId: recipeItem.ingredient_id,
              ingredientName: updatedIngredient.name,
              currentStock: updatedIngredient.stock_quantity,
              alertThreshold: updatedIngredient.alert_threshold,
            },
          });
        }
      }
    }

    await client.query('COMMIT');
    console.log(`🎉 Inventory deducted for order ${orderId}`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deducting inventory:', error);
    throw error;
  } finally {
    client.release();
  }
}
