# Kopi Kiosk - Coffee Shop POS

Kopi Kiosk is a sleek, modern, and feature-rich Point of Sale (POS) application designed specifically for coffee shops. Built with React, TypeScript, and Tailwind CSS, it offers a complete solution for managing orders, staff, and sales. It features offline capabilities via in-browser SQLite and an AI-powered "Daily Special" generator using the Google Gemini API.

This application is designed as a Progressive Web App (PWA), meaning it can be "installed" on any device for a fast, reliable, and engaging native app-like experience.

## ✨ Key Features

-   **Role-Based Access Control:** Separate, tailored interfaces and permissions for four distinct user roles:
    -   **Manager:** Full access to dashboards, settings, and all other roles.
    -   **Cashier:** Main POS interface for taking and managing orders.
    -   **Kitchen Staff:** A real-time Kitchen Display System (KDS) to track and prepare orders.
    -   **Customer:** A self-service ordering interface.
-   **Intuitive POS Interface:** The cashier screen is optimized for speed, allowing staff to quickly add items, manage pending customer orders, apply discounts, and process payments.
-   **Kitchen Display System (KDS):** A dedicated screen for the kitchen that shows a real-time queue of approved and paid orders, helping to streamline the preparation process.
-   **Customer Self-Ordering:** Customers can log in from their own devices, browse the menu, and submit an order directly to the cashier for approval.
-   **Comprehensive Manager Dashboard:** Provides managers with an at-a-glance overview of key metrics, including:
    -   Sales recaps (today, this week, this month).
    -   Real-time stock status (low stock, out of stock).
    -   Quick-access navigation to all management functions.
-   **Dynamic Menu & Settings Management:** Managers have a dedicated interface to:
    -   Add, edit, and delete menu items, including images and stock counts.
    -   Manage product categories.
    -   Create, update, and remove custom discounts.
    -   Set the global tax rate.
-   **AI-Powered Daily Special:** Leverages the **Google Gemini API** to creatively generate a "Special of the Day" based on the available menu items, adding a unique touch to the customer experience.
-   **Offline First Architecture:** Utilizes `sql.js` (SQLite compiled to WebAssembly) with IndexedDB persistence. This allows the application to be fully functional even without an internet connection. All data is stored locally in the browser and synchronized when possible.
-   **Transaction Log & Receipt Printing:** Features a complete, filterable log of all transactions and the ability to generate a clean, printable receipt after a successful payment.
-   **Staff & Security Management:** Managers can easily add or remove staff accounts (Cashier, Kitchen) and change their own account password.

## 🚀 Tech Stack

-   **Frontend:** React, TypeScript
-   **Styling:** Tailwind CSS
-   **AI Model:** Google Gemini API (`@google/genai`)
-   **In-Browser Database:** `sql.js` (SQLite compiled to WebAssembly)
-   **Offline Persistence:** IndexedDB API
-   **PWA:** Service Workers, Web App Manifest

## 🔐 User Roles & Default Credentials

You can log in and explore the different functionalities using these default accounts:

| Role      | Username    | Password |
| :-------- | :---------- | :------- |
| **Manager** | `manager`   | `admin`  |
| **Cashier** | `kasir`     | `123`    |
| **Kitchen** | `dapur`     | `masak`  |
| **Customer**| `pelanggan` | `pesan`  |

## ⚙️ How It Works

Kopi Kiosk is a fully client-side application. There is no traditional backend server.

1.  **Database Initialization:** On first load, `sql.js` initializes an in-browser SQLite database.
2.  **Data Seeding:** The database is seeded with initial users, menu items, and default settings.
3.  **Offline Persistence:** The entire SQLite database file is saved as a blob in the browser's **IndexedDB**. On subsequent visits, the app loads the database from IndexedDB, ensuring all data persists between sessions.
4.  **State Management:** All application state (orders, menu items, etc.) is managed through React, with database operations handled by the `db.ts` service.
5.  **API Integration:** The Gemini API is called from the `geminiService.ts` to generate the daily special. This is the only feature that requires an active internet connection.

## 🏃‍♀️ Getting Started

To run this application, you need to serve the project files from a local or remote web server.

1.  **API Key:** Ensure you have a Google Gemini API key. This key must be available as an environment variable named `API_KEY` in the environment where the application is served.
2.  **Serve Files:** Use any simple web server to serve the contents of the project's root directory.
3.  **Access:** Open your browser and navigate to the server's address (e.g., `http://localhost:3000`).
