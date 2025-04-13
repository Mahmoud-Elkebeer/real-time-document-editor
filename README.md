# 📄 Real-Time Collaborative Document Editor (Laravel + Vue 3 + Vuex)

A real-time collaborative document editing platform similar to Google Docs, built with **Laravel 10**, **Vue 3**, **Vuex**, and **Laravel Echo**.

---

## 🚀 Features

- **User Authentication**
    - User registration, login, logout
    - Secure authenticated sessions

- **Document Management**
    - Create, edit, and manage documents
    - Each document has a title, content, and active collaborators
    - Document version history

- **Real-Time Collaboration**
    - Real-time document updates via WebSockets (Laravel Echo)
    - Live active collaborators list while editing

---

## 📦 Tech Stack

- **Backend:** Laravel 10, Laravel Sanctum/JWT, Laravel Echo
- **Frontend:** Vue 3, Vuex, Axios
- **WebSockets:** Laravel Echo with Pusher or Laravel WebSockets
- **Database:** MySQL

---

## 🖥️ Installation & Setup

### 📌 Requirements

- PHP >= 8.1
- Composer
- Node.js >= 18
- MySQL
- Pusher account

---

## Installation
1. Clone the repository:
   ```bash
   git clone git@github.com:Mahmoud-Elkebeer/orders-management.git
   cd real-time-document-editor
   ```
2. Install dependencies:
   ```bash
   composer install
   npm install
   ```
3. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
4. Set up the database connection and pusher in the `.env` file:
    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=your_database_name
    DB_USERNAME=your_database_user
    DB_PASSWORD=your_database_password
   
   BROADCAST_DRIVER=pusher
   PUSHER_APP_ID=your_pusher_id
   PUSHER_APP_KEY=your_pusher_key
   PUSHER_APP_SECRET=your_pusher_secret

   VITE_PUSHER_APP_KEY="your_app_key"
   VITE_PUSHER_APP_CLUSTER="your_app_cluster"
    ```
5.  Generate application key:
   ```bash
   php artisan key:generate
   ```
6. Migrate tables:
   ```bash
   php artisan migrate
   ```
7. Run the application:
   ```bash
   php artisan serve
   npm run dev
   ```
   Access: http://localhost:8000
