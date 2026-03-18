# Restaurant POS System

A full-stack Restaurant Point of Sale system built with Laravel 12 (Backend) and React.js + Material UI (Frontend).

## Prerequisites

Before setting up the project, ensure you have the following installed:
- PHP 8.2 or higher
- Composer
- Node.js (v18+) & npm
- PostgreSQL

---

## Backend Setup (Laravel)

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```

2.  **Install dependencies:**
    ```bash
    composer install
    ```

3.  **Configure environment variables:**
    - Copy `.env.example` to `.env`:
      ```bash
      cp .env.example .env
      ```
    - Open `.env` and configure your database settings. Default is PostgreSQL:
      ```env
      DB_CONNECTION=pgsql
      DB_HOST=127.0.0.1
      DB_PORT=5432
      DB_DATABASE=restaurant_pos
      DB_USERNAME=postgres
      DB_PASSWORD=root
      ```

4.  **Generate application key:**
    ```bash
    php artisan key:generate
    ```

5.  **Run migrations and seed the database:**
    ```bash
    php artisan migrate --seed
    ```
    *This will create tables and populate initial data (users, foods, tables).*

6.  **Start the development server:**
    ```bash
    php artisan serve
    ```
    The backend will be available at `http://127.0.0.1:8000`.

---

## Frontend Setup (React)

1.  **Navigate to the client directory:**
    ```bash
    cd client
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5173`.

---

## Default User Accounts

After seeding, you can log in with the following accounts:

- **Pelayan (Waiter):**
  - Email: `pelayan@gmail.com`
  - Password: `password`
- **Kasir (Cashier):**
  - Email: `kasir@gmail.com`
  - Password: `password`