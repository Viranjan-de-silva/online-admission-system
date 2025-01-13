# Online Admission System

This project is an **Online Admission System** built with a **Python Flask** backend and a **React.js** frontend. It allows users to manage student admission records efficiently.

---

## Prerequisites

Before setting up the project, ensure you have the following installed on your system:
- Python 3.10.x
- Node.js and npm
- MySQL Server

---

## Setting Up and Running the Application

Follow the steps below to set up and run the project:

### 1. Clone the Repository

Clone the project repository into your local machine:

```bash
git clone https://github.com/your-username/online-admission-system.git
```

### 2. Set Up the MySQL Database

Log in to your MySQL server and create a new database named `student_admission`:

```sql
CREATE DATABASE student_admission;
```

### 3. Navigate to the Server Folder and Activate Virtual Environment

Move into the `server` directory and activate the virtual environment:

```bash
cd server
```

Activate the virtual environment:
* On **Windows**:
```bash
server_venv\Scripts\activate
```

* On **macOS/Linux**:
```bash
source server_venv/bin/activate
```

### 4. Install Backend Dependencies

With the virtual environment activated, install the required Python packages:

```bash
pip install flask flask-sqlalchemy flask-cors mysqlclient python-dotenv Werkzeug
```

### 5. Initialize Database Tables

Run the `init_db.py` script to create the necessary tables in the database:

```bash
python init_db.py
```

### 6. Run the Flask Backend

Start the Flask application to serve the backend:

```bash
python run.py
```

The Flask backend will be accessible at `http://localhost:5000`.

### 7. Set Up and Run the Frontend

In a new terminal window:

1. Go back to the root directory:
```bash
cd ..
```

2. Navigate to the `client` folder:
```bash
cd client
```

3. Install the required npm package:
```bash
npm install axios
```

4. Start the React development server:
```bash
npm start
```

The React frontend will run on `http://localhost:3000`.
