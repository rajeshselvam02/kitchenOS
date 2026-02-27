import db from './index';

async function seed() {
  console.log('Seeding database...');

  try {
    // Seed dishes
    const dishResult = await db.query(`
      INSERT INTO dishes (name, description, price, active)
      VALUES
        ('Double Chicken Burger', 'Juicy double chicken patty with cheese', 199.00, true),
        ('Veg Pizza', 'Fresh vegetables on crispy base', 149.00, true),
        ('Paneer Tikka', 'Grilled paneer with spices', 179.00, true)
      RETURNING id, name
    `);
    console.log(`✅ Seeded ${dishResult.rowCount} dishes`);

    // Seed ingredients
    const ingredientResult = await db.query(`
      INSERT INTO ingredients (name, unit, stock_quantity, alert_threshold, cost_per_unit)
      VALUES
        ('Chicken Breast', 'g', 5000.0, 500.0, 0.25),
        ('Buns', 'pcs', 100, 10, 5.00),
        ('Cheese Slices', 'pcs', 50, 5, 8.00),
        ('Tomatoes', 'g', 2000.0, 200.0, 0.05),
        ('Onions', 'g', 3000.0, 300.0, 0.03),
        ('Paneer', 'g', 2000.0, 200.0, 0.35)
      RETURNING id, name
    `);
    console.log(`✅ Seeded ${ingredientResult.rowCount} ingredients`);

    // Get IDs for recipe creation
    const dishes = dishResult.rows;
    const ingredients = ingredientResult.rows;

    const burgerDish = dishes.find(d => d.name === 'Double Chicken Burger');
    const chickenIngredient = ingredients.find(i => i.name === 'Chicken Breast');
    const bunIngredient = ingredients.find(i => i.name === 'Buns');
    const cheeseIngredient = ingredients.find(i => i.name === 'Cheese Slices');

    // Seed recipe for Double Chicken Burger
    if (burgerDish && chickenIngredient && bunIngredient && cheeseIngredient) {
      await db.query(`
        INSERT INTO recipe_items (dish_id, ingredient_id, quantity, unit)
        VALUES
          ($1, $2, 180.0, 'g'),
          ($1, $3, 1, 'pcs'),
          ($1, $4, 2, 'pcs')
      `, [burgerDish.id, chickenIngredient.id, bunIngredient.id, cheeseIngredient.id]);
      console.log('✅ Seeded recipe for Double Chicken Burger');
    }

    // Seed a test user (password: 'test123', hashed with bcrypt)
    // In production, hash this properly
    await db.query(`
      INSERT INTO users (email, password_hash, role, name)
      VALUES
        ('owner@example.com', '$2b$10$abcdefghijklmnopqrstuv', 'owner', 'Test Owner'),
        ('chef@example.com', '$2b$10$abcdefghijklmnopqrstuv', 'chef', 'Test Chef')
    `);
    console.log('✅ Seeded test users');

    console.log('🎉 Seed complete');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

seed();
