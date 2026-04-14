# Book Library Manager - Full Stack Development Experiments (Part 2)

**Roll No:** 23WH1A0532  
**Date:** April 11, 2026  
**Project:** Book Library Manager - Digital Library Management System

---

## Experiment 6: Implement CRUD operations for Book Library Manager users and book records using MongoDB

### AIM
Implement CRUD operations for Book Library Manager users and book records using MongoDB.

### Description
This experiment implements CRUD operations using MongoDB in the Book Library Manager system. Users can be registered, book records can be created, records can be viewed, and book information can be updated. Administrative actions and reset scripts also support deletion or clearing of stored data. It clearly demonstrates the complete lifecycle of data management in a real project.

### Source Code

**File: `backend/src/controllers/authController.js`**

```javascript
const createUser = async ({ name, email, password, role }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return { error: { status: 409, message: "User already exists" } };
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role
  });

  return { user };
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const role = req.body.role || "user";

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be user or admin" });
    }

    const result = await createUser({ name, email, password, role });

    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    res.status(201).json({
      message: "Registration successful",
      user: sanitizeUser(result.user)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
```

**File: `backend/src/controllers/bookController.js`**

```javascript
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("category", "name description");
    
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const { title, author, category, description, publishedYear, isbn } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.category = category || book.category;
    book.description = description || book.description;
    book.publishedYear = publishedYear || book.publishedYear;
    book.isbn = isbn || book.isbn;

    await book.save();

    const populatedBook = await Book.findById(book._id)
      .populate("category", "name");

    res.json(populatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

**File: `backend/src/routes/userRoutes.js`**

```javascript
const express = require("express");
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
```

### OUTPUT
```json
{
  "message": "Registration successful",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

Book updated successfully:
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "title": "1984 (Updated Edition)",
  "author": "George Orwell",
  "category": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Fiction"
  }
}
```

---

## Experiment 7: Perform count and sorting operations on Book Library Manager book records using MongoDB queries

### AIM
Perform count and sorting operations on Book Library Manager book records using MongoDB queries.

### Description
This experiment explores MongoDB operations such as count and sort on application data. In Book Library Manager, book records are sorted by creation date and counted to generate dashboard summaries. These operations help organize records and present useful statistics to the user. The project shows practical query handling for library management.

### Source Code

**File: `backend/src/controllers/bookController.js`**

```javascript
exports.getAllBooks = async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } }
      ];
    }

    if (category) {
      query.category = category;
    }

    const books = await Book.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookStats = async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const booksByCategory = await Book.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo"
        }
      },
      {
        $unwind: "$categoryInfo"
      },
      {
        $project: {
          category: "$categoryInfo.name",
          count: 1
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      totalBooks,
      booksByCategory
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

**File: `backend/src/controllers/readingListController.js`**

```javascript
exports.getMyReadingList = async (req, res) => {
  try {
    const readingList = await ReadingList.find({ user: req.user._id })
      .populate({
        path: "book",
        populate: { path: "category", select: "name" }
      })
      .sort({ addedAt: -1 });

    res.json(readingList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### OUTPUT
```
Total books count = 25
Book records are sorted in descending order of created time.
Latest book appears first.
```

```json
{
  "totalBooks": 25,
  "booksByCategory": [
    { "category": "Fiction", "count": 10 },
    { "category": "Science", "count": 8 },
    { "category": "History", "count": 7 }
  ]
}
```

---

## Experiment 8: Develop a styled Book Library Manager signup form and handle user input events in the frontend

### AIM
Develop a styled Book Library Manager signup form and handle user input events in the frontend.

### Description
This experiment demonstrates a styled form with event handling in the frontend. Book Library Manager uses a React signup form where CSS is applied for layout and appearance. User interactions such as typing and submitting are managed through `onChange` and `onSubmit` events. It shows how frontend forms respond dynamically to user input in a web application.

### Source Code

**File: `frontend/src/pages/Signup.js`**

```javascript
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../App.css";

function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/register", {
        name,
        email,
        password
      });
      setMessage("Account created successfully. You can log in now.");
      setTimeout(() => navigate("/"), 700);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="hero-panel">
          <p className="auth-eyebrow">User Registration</p>
          <h1>Create your Book Library Manager account</h1>
          <p>Join our library community and start building your reading list.</p>
        </div>

        <form className="auth-card" onSubmit={handleSignup}>
          <div className="auth-copy">
            <p className="auth-eyebrow">Sign Up</p>
            <h2>Create your account</h2>
          </div>

          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          {error ? <p className="form-message error">{error}</p> : null}
          {message ? <p className="form-message success">{message}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Signup;
```

**File: `frontend/src/App.css`**

```css
:root {
  --bg: linear-gradient(135deg, #f6efe3 0%, #e3eef7 100%);
  --panel: rgba(255, 255, 255, 0.92);
  --text: #18324a;
  --accent: #0f7b6c;
  --border: #d4deea;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  color: var(--text);
  background: var(--bg);
}

input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px 16px;
  background: white;
}

input:focus {
  outline: 2px solid rgba(15, 123, 108, 0.16);
  border-color: var(--accent);
}

button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 12px 18px;
  border: none;
  border-radius: 14px;
  background: var(--accent);
  color: #fff;
  cursor: pointer;
  font-weight: 700;
}

button:hover {
  background: #0a5f54;
}
```

### OUTPUT
Styled signup form with:
- Name input field
- Email input field
- Password input field
- Confirm password field
- Submit button
- Validation messages
- Link to login page

---

## Experiment 9: Develop and validate the Book Library Manager user registration form for users and admins

### AIM
Develop and validate the Book Library Manager user registration form for users and admins.

### Description
This experiment focuses on form validation in a registration system. The Book Library Manager signup and admin signup pages check required fields, password rules, and input matching. The backend also validates data to prevent invalid or duplicate registration requests. It demonstrates both client-side and server-side validation for reliable data entry.

### Source Code

**File: `frontend/src/pages/AdminSignup.js`**

```javascript
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "../App.css";

function AdminSignup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminSecret: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const { name, email, password, confirmPassword, adminSecret } = formData;

    if (!name || !email || !password || !confirmPassword || !adminSecret) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/register-admin", {
        name,
        email,
        password,
        adminSecret
      });
      setMessage("Admin account created successfully. You can log in now.");
      setTimeout(() => navigate("/admin/login"), 700);
    } catch (err) {
      setError(err.response?.data?.message || "Admin signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <form className="auth-card" onSubmit={handleSignup}>
          <h2>Admin Registration</h2>
          
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <input
            name="adminSecret"
            type="password"
            placeholder="Admin Secret Key"
            value={formData.adminSecret}
            onChange={handleChange}
          />

          {error ? <p className="form-message error">{error}</p> : null}
          {message ? <p className="form-message success">{message}</p> : null}

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up as Admin"}
          </button>

          <p className="auth-switch">
            Already have an account? <Link to="/admin/login">Admin Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default AdminSignup;
```

**File: `backend/src/controllers/authController.js`**

```javascript
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (!name || !email || !password || !adminSecret) {
      return res.status(400).json({
        message: "Name, email, password, and admin secret are required"
      });
    }

    if (adminSecret !== (process.env.ADMIN_SECRET || "LIBRARY_ADMIN_2026")) {
      return res.status(403).json({ message: "Invalid admin secret" });
    }

    const result = await createUser({
      name,
      email,
      password,
      role: "admin"
    });

    if (result.error) {
      return res.status(result.error.status).json({ message: result.error.message });
    }

    res.status(201).json({
      message: "Admin account created successfully",
      user: sanitizeUser(result.user)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
```

### OUTPUT
Validation messages displayed:
- "Please fill in all required fields."
- "Password must be at least 6 characters long."
- "Passwords do not match."
- "Invalid admin secret"
- "Account created successfully. You can log in now."

---

## Experiment 10: Fetch and display Book Library Manager JSON data from the backend using frontend service calls

### AIM
Fetch and display Book Library Manager JSON data from the backend using frontend service calls.

### Description
This experiment shows how a frontend application fetches JSON data from a server. In Book Library Manager, React components use Axios services to request dashboard and book data from backend APIs. The received JSON response is processed and displayed in the user interface. It explains how frontend and backend communicate to build a data-driven application.

### Source Code

**File: `frontend/src/services/api.js`**

```javascript
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
```

**File: `frontend/src/pages/Dashboard.js`**

```javascript
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { clearSession, getStoredUser } from "../services/auth";
import "../App.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalCategories: 0,
    myReadingList: 0
  });

  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      navigate("/");
      return;
    }
    setUser(storedUser);
  }, [navigate]);

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadStats = async () => {
      try {
        const [booksRes, categoriesRes, readingListRes] = await Promise.all([
          API.get("/books"),
          API.get("/categories"),
          API.get("/reading-list")
        ]);

        setStats({
          totalBooks: booksRes.data.length,
          totalCategories: categoriesRes.data.length,
          myReadingList: readingListRes.data.length
        });
      } catch (error) {
        if (error.response?.status === 401) {
          clearSession();
          navigate("/");
        }
      }
    };

    loadStats();
  }, [navigate, user]);

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <section className="dashboard-header">
        <div>
          <p className="auth-eyebrow">Dashboard</p>
          <h1>Welcome, {user.name}</h1>
          <p className="dashboard-subtitle">
            {user.role === "admin"
              ? "Manage books, categories, and users from your admin workspace."
              : "Browse books, build your reading list, and discover new titles."}
          </p>
        </div>
        <div className="top-actions">
          {user.role === "admin" ? (
            <Link className="button-link" to="/admin/books">
              Manage Books
            </Link>
          ) : (
            <>
              <Link className="button-link" to="/books">
                Browse Books
              </Link>
              <Link className="button-link secondary-button-link" to="/reading-list">
                My Reading List
              </Link>
            </>
          )}
          <button className="secondary-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </section>

      <section className="summary-grid">
        <div className="summary-card">
          <span>Total Books</span>
          <strong>{stats.totalBooks}</strong>
        </div>
        <div className="summary-card">
          <span>Categories</span>
          <strong>{stats.totalCategories}</strong>
        </div>
        <div className="summary-card">
          <span>My Reading List</span>
          <strong>{stats.myReadingList}</strong>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
```

### OUTPUT
```json
{
  "totalBooks": 25,
  "totalCategories": 5,
  "myReadingList": 3
}
```

Dashboard displays:
- Welcome message with user name
- Total books count: 25
- Total categories: 5
- My reading list: 3 books

---

**End of Part 2**

*Continue to Part 3 for Experiments 11-14*
