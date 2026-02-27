// Core domain types

export enum OrderStatus {
  PENDING = 'pending',
  COOKING = 'cooking',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum Aggregator {
  SWIGGY = 'swiggy',
  ZOMATO = 'zomato',
  DIRECT = 'direct', // Direct orders (phone, website)
}

export interface Order {
  id: string;
  aggregator: Aggregator;
  aggregatorOrderId: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: Date;
  readyAt?: Date;
  deliveredAt?: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  dishId: string;
  dish?: Dish;
  quantity: number;
  price: number;
}

export interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  active: boolean;
  recipe?: RecipeItem[];
}

export interface RecipeItem {
  id: string;
  dishId: string;
  ingredientId: string;
  ingredient?: Ingredient;
  quantity: number; // e.g., 180.0
  unit: Unit;
}

export enum Unit {
  GRAMS = 'g',
  MILLILITERS = 'ml',
  PIECES = 'pcs',
  KILOGRAMS = 'kg',
  LITERS = 'l',
}

export interface Ingredient {
  id: string;
  name: string;
  unit: Unit;
  stockQuantity: number;
  alertThreshold: number; // trigger alert below this
  costPerUnit: number; // for P&L calculation
}

export interface InventoryTransaction {
  id: string;
  ingredientId: string;
  orderId?: string;
  quantityChanged: number; // negative for deduction
  reason: TransactionReason;
  createdAt: Date;
  createdBy?: string; // user ID
}

export enum TransactionReason {
  ORDER_READY = 'order_ready',
  MANUAL_ADJUSTMENT = 'manual_adjustment',
  RESTOCK = 'restock',
  WASTAGE = 'wastage',
}

// Event types for the event bus

export interface OrderCreatedEvent {
  type: 'order.created';
  payload: Order;
}

export interface OrderReadyEvent {
  type: 'order.ready';
  payload: {
    orderId: string;
    readyAt: Date;
  };
}

export interface InventoryLowEvent {
  type: 'inventory.low';
  payload: {
    ingredientId: string;
    ingredientName: string;
    currentStock: number;
    alertThreshold: number;
  };
}

export interface InventoryDiscrepancyEvent {
  type: 'inventory.discrepancy';
  payload: {
    ingredientId: string;
    ingredientName: string;
    expectedStock: number;
    actualStock: number;
    orderId?: string;
  };
}

export type KitchenOSEvent =
  | OrderCreatedEvent
  | OrderReadyEvent
  | InventoryLowEvent
  | InventoryDiscrepancyEvent;
