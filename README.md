# Blog App

A blog application with Go backend and AngularJS frontend.

## Requirements

- Go 1.19+
-  npm
- Web browser

## How to Run

## How to Run

### Backend (Go Server)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kinyuasamie/blogapp.git
   cd blogapp
   ```

2. **Install Go dependencies**
   ```bash
   cd backend
   go mod download
   ```

3. **Run the Go server**
4. cd backend/cmd/server
   ```bash
   go run main.go
   ```
   Server starts at `http://localhost:8080`

### Frontend (AngularJS)

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install npm dependencies**
   ```bash
   npm install
   ```

3. **Start the frontend**
   ```bash
   npm start
   ```
   Frontend runs at `http://localhost:3000`

**Note:** Run both backend and frontend servers simultaneously in separate terminals.

### Project Structure
```
blogapp/
├── backend/main.go          # Go API server
└── frontend/
    ├── index.html           # Main HTML file
    ├── src/app/app.js       # AngularJS application
    └── package.json         # npm dependencies
```

The app will run with sample blog posts.

## Optional Database Setup

Create `.env` file in backend directory:
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=blog_db
```

Without database setup, the app uses mock data automatically.
