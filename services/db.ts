import type { MenuItem, Order, User, Discount, OrderItem } from '../types';
import { INITIAL_MENU_ITEMS, INITIAL_USERS } from '../constants';

// Declare SQL global from sql.js CDN
declare var initSqlJs: any;
declare var SQL: any;

let db: any = null; // SQLite database instance

const DB_NAME = 'kopiKioskDB';
const DB_STORE_NAME = 'sqliteStore';
const DB_VERSION = 1;

// --- IndexedDB Persistence Helpers ---
const openIndexedDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(DB_STORE_NAME)) {
        db.createObjectStore(DB_STORE_NAME);
      }
    };
    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };
    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

const saveDbToIndexedDB = async (data: Uint8Array): Promise<void> => {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = idb.transaction(DB_STORE_NAME, 'readwrite');
    const store = transaction.objectStore(DB_STORE_NAME);
    const request = store.put(data, 'db');
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const loadDbFromIndexedDB = async (): Promise<Uint8Array | undefined> => {
  const idb = await openIndexedDB();
  return new Promise((resolve, reject) => {
    const transaction = idb.transaction(DB_STORE_NAME, 'readonly');
    const store = transaction.objectStore(DB_STORE_NAME);
    const request = store.get('db');
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject((event.target as IDBRequest).error);
  });
};

// --- SQLite Initialization ---
export const initializeDb = async (): Promise<void> => {
  if (db) return; // DB already initialized

  try {
    const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}` });
    const savedDbData = await loadDbFromIndexedDB();

    if (savedDbData) {
      db = new SQL.Database(savedDbData);
      console.log('SQLite database loaded successfully from IndexedDB.');
      // Ensure schema and users are up to date on every load
      await createSchemaAndSeedData();
    } else {
      db = new SQL.Database();
      console.log('New SQLite database created. Seeding initial data...');
      await createSchemaAndSeedData();
      await saveCurrentDb(); // Save initial seeded data
      console.log('Initial data seeded and saved to IndexedDB.');
    }
  } catch (error) {
    console.error("Failed to initialize or load SQLite database:", error);
    throw error;
  }
};

const createSchemaAndSeedData = async (): Promise<void> => {
  const queries = `
    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      imageUrl TEXT NOT NULL,
      stock INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tableNumber TEXT NOT NULL,
      guestName TEXT,
      items TEXT NOT NULL, -- JSON string of OrderItem[]
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL, -- ISO string
      subtotal REAL NOT NULL,
      tax REAL NOT NULL,
      total REAL NOT NULL,
      appliedDiscount TEXT -- JSON string of Discount | null
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    );
  `;
  db.exec(queries);

  // Seed menu items if table is empty
  if (db.exec("SELECT COUNT(*) FROM menu_items")[0].values[0][0] === 0) {
    const stmt = db.prepare("INSERT INTO menu_items (name, price, category, imageUrl, stock) VALUES (?, ?, ?, ?, ?)");
    INITIAL_MENU_ITEMS.forEach(item => stmt.run([item.name, item.price, item.category, item.imageUrl, item.stock]));
    stmt.free();
    console.log('Menu items seeded.');
  }

  // Idempotent user seeding: check for each user and add if they don't exist.
  const userCheckStmt = db.prepare("SELECT COUNT(*) FROM users WHERE username = ?");
  const userInsertStmt = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
  
  INITIAL_USERS.forEach(user => {
      userCheckStmt.bind([user.username]);
      userCheckStmt.step();
      const userExists = userCheckStmt.get()[0] > 0;
      userCheckStmt.reset();

      if (!userExists) {
          userInsertStmt.run([user.username, user.password, user.role]);
          console.log(`User '${user.username}' seeded.`);
      }
  });

  userCheckStmt.free();
  userInsertStmt.free();
};

const saveCurrentDb = async (): Promise<void> => {
  if (db) {
    const data = db.export();
    await saveDbToIndexedDB(data);
  }
};

// Helper to run a query and get results
const runQuery = <T>(query: string, params: any[] = []): T[] => {
  const stmt = db.prepare(query);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
};

const runExec = (query: string, params: any[] = []): void => {
  db.run(query, params);
};


// --- Menu Item DB Operations ---
export const getAllMenuItems = async (): Promise<MenuItem[]> => {
  await initializeDb();
  return runQuery<MenuItem>("SELECT * FROM menu_items ORDER BY name ASC");
};

export const addMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  await initializeDb();
  runExec("INSERT INTO menu_items (name, price, category, imageUrl, stock) VALUES (?, ?, ?, ?, ?)",
    [item.name, item.price, item.category, item.imageUrl, item.stock]);
  const newId = db.exec("SELECT last_insert_rowid()")[0].values[0][0] as number;
  await saveCurrentDb();
  return { ...item, id: newId };
};

export const updateMenuItem = async (updatedItem: MenuItem): Promise<MenuItem> => {
  await initializeDb();
  runExec("UPDATE menu_items SET name = ?, price = ?, category = ?, imageUrl = ?, stock = ? WHERE id = ?",
    [updatedItem.name, updatedItem.price, updatedItem.category, updatedItem.imageUrl, updatedItem.stock, updatedItem.id]);
  await saveCurrentDb();
  return updatedItem;
};

export const deleteMenuItem = async (id: number): Promise<void> => {
  await initializeDb();
  runExec("DELETE FROM menu_items WHERE id = ?", [id]);
  await saveCurrentDb();
};

// --- Order DB Operations ---
export const getAllOrders = async (): Promise<Order[]> => {
  await initializeDb();
  const rawOrders = runQuery<any>("SELECT * FROM orders ORDER BY createdAt DESC");
  return rawOrders.map(rawOrder => ({
    ...rawOrder,
    createdAt: new Date(rawOrder.createdAt),
    items: JSON.parse(rawOrder.items),
    appliedDiscount: rawOrder.appliedDiscount ? JSON.parse(rawOrder.appliedDiscount) : null,
  }));
};

export const getOrderById = async (id: number): Promise<Order | undefined> => {
  await initializeDb();
  const rawOrder = runQuery<any>("SELECT * FROM orders WHERE id = ?", [id])[0];
  if (rawOrder) {
    return {
      ...rawOrder,
      createdAt: new Date(rawOrder.createdAt),
      items: JSON.parse(rawOrder.items),
      appliedDiscount: rawOrder.appliedDiscount ? JSON.parse(rawOrder.appliedDiscount) : null,
    };
  }
  return undefined;
};

export const addOrder = async (order: Omit<Order, 'id'>): Promise<Order> => {
  await initializeDb();
  runExec(
    "INSERT INTO orders (tableNumber, guestName, items, status, createdAt, subtotal, tax, total, appliedDiscount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      order.tableNumber,
      order.guestName,
      JSON.stringify(order.items),
      order.status,
      order.createdAt.toISOString(),
      order.subtotal,
      order.tax,
      order.total,
      order.appliedDiscount ? JSON.stringify(order.appliedDiscount) : null,
    ]
  );
  const newId = db.exec("SELECT last_insert_rowid()")[0].values[0][0] as number;
  await saveCurrentDb();
  return { ...order, id: newId };
};

export const updateOrder = async (updatedOrder: Order): Promise<Order> => {
  await initializeDb();
  runExec(
    "UPDATE orders SET tableNumber = ?, guestName = ?, items = ?, status = ?, createdAt = ?, subtotal = ?, tax = ?, total = ?, appliedDiscount = ? WHERE id = ?",
    [
      updatedOrder.tableNumber,
      updatedOrder.guestName,
      JSON.stringify(updatedOrder.items),
      updatedOrder.status,
      updatedOrder.createdAt.toISOString(),
      updatedOrder.subtotal,
      updatedOrder.tax,
      updatedOrder.total,
      updatedOrder.appliedDiscount ? JSON.stringify(updatedOrder.appliedDiscount) : null,
      updatedOrder.id,
    ]
  );
  await saveCurrentDb();
  return updatedOrder;
};

export const deleteOrder = async (id: number): Promise<void> => {
  await initializeDb();
  runExec("DELETE FROM orders WHERE id = ?", [id]);
  await saveCurrentDb();
};


// --- User DB Operations ---
export const getAllUsers = async (): Promise<User[]> => {
  await initializeDb();
  return runQuery<User>("SELECT * FROM users ORDER BY username ASC");
};

export const addUser = async (user: Omit<User, 'id'>): Promise<User> => {
  await initializeDb();
  runExec("INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [user.username, user.password, user.role]);
  const newId = db.exec("SELECT last_insert_rowid()")[0].values[0][0] as number;
  await saveCurrentDb();
  return { ...user, id: newId };
};

export const updateUser = async (updatedUser: User): Promise<User> => {
  await initializeDb();
  runExec("UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?",
    [updatedUser.username, updatedUser.password, updatedUser.role, updatedUser.id]);
  await saveCurrentDb();
  return updatedUser;
};

export const deleteUser = async (id: number): Promise<void> => {
  await initializeDb();
  runExec("DELETE FROM users WHERE id = ?", [id]);
  await saveCurrentDb();
};