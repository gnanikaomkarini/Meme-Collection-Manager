# Book Library Manager - Full Stack Development Experiments (Part 3)

**Roll No:** 23WH1A0532  
**Date:** April 11, 2026  
**Project:** Book Library Manager - Digital Library Management System

---

## Experiment 11: Develop the Book Library Manager web application to manage book and user information using Express and React

### AIM
Develop the Book Library Manager web application to manage book and user information using Express and React.

### Description
This experiment develops a web application for managing book-related information using Express and a frontend framework. Book Library Manager supports registration, login, dashboard access, and book data retrieval through connected backend and frontend modules. The Express server handles routes and APIs, while React provides the interactive user interface. It demonstrates a complete full-stack application structure for library management.

### Source Code

**File: `backend/server.js`**

```javascript
const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reading-list", readingListRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Book Library Manager Backend Running");
});
```

**File: `backend/src/routes/categoryRoutes.js`**

```javascript
const express = require("express");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require("../controllers/categoryController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", protect, authorize("admin"), createCategory);
router.put("/:id", protect, authorize("admin"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
```

**File: `backend/src/routes/userRoutes.js`**

```javascript
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

**File: `frontend/src/pages/Signup.js`**

```javascript
const handleSignup = async (e) => {
  e.preventDefault();
  setMessage("");
  setError("");

  const { name, email, password, confirmPassword } = formData;

  if (!name || !email || !password) {
    setError("Please fill in all required fields.");
    return;
  }

  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }

  await API.post("/auth/register", {
    name,
    email,
    password
  });

  setMessage("Account created successfully. You can log in now.");
};
```

**File: `frontend/src/pages/Dashboard.js`**

```javascript
const loadStats = async () => {
  try {
    const booksRes = await API.get("/books");
    const categoriesRes = await API.get("/categories");
    const readingListRes = await API.get("/reading-list");

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
```

### OUTPUT
User registration successful:
```json
{
  "message": "Account created successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

Dashboard displays book statistics and user information.

---

## Experiment 12: Implement an approval decision workflow in React for reviewing Book Library Manager reading list requests

### AIM
Implement an approval decision workflow in React for reviewing Book Library Manager reading list requests.

### Description
This experiment presents a React-based decision workflow similar to a voting application. In Book Library Manager, users can add or remove books from their reading list from the book details page. Each decision updates the status of the reading list in the database and interface. It shows how action-based state changes can be implemented in a React application.

### Source Code

**File: `frontend/src/pages/BookDetails.js`**

```javascript
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { getStoredUser } from "../services/auth";

function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [inReadingList, setInReadingList] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();

  useEffect(() => {
    fetchBook();
    if (user) {
      checkReadingList();
    }
  }, [id]);

  const fetchBook = async () => {
    try {
      const res = await API.get(`/books/${id}`);
      setBook(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const checkReadingList = async () => {
    try {
      const res = await API.get("/reading-list");
      setInReadingList(res.data.some((item) => item.book._id === id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddToList = async () => {
    try {
      await API.post("/reading-list", { bookId: id });
      setInReadingList(true);
      alert("Added to reading list");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add to reading list");
    }
  };

  const handleRemoveFromList = async () => {
    try {
      await API.delete(`/reading-list/${id}`);
      setInReadingList(false);
      alert("Removed from reading list");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to remove from reading list");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!book) return <div>Book not found</div>;

  return (
    <div className="book-details-page">
      <button onClick={() => navigate(-1)}>Back</button>
      
      <h1>{book.title}</h1>
      <h2>by {book.author}</h2>
      <p><strong>Category:</strong> {book.category?.name}</p>
      <p><strong>Published:</strong> {book.publishedYear}</p>
      <p><strong>ISBN:</strong> {book.isbn}</p>
      <p>{book.description}</p>

      {user && user.role === "user" && (
        <div className="action-row">
          {inReadingList ? (
            <button onClick={handleRemoveFromList}>
              Remove from Reading List
            </button>
          ) : (
            <button onClick={handleAddToList}>
              Add to Reading List
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default BookDetails;
```

**File: `backend/src/controllers/readingListController.js`**

```javascript
const ReadingList = require("../models/ReadingList");

exports.addToReadingList = async (req, res) => {
  try {
    const { bookId } = req.body;

    const existing = await ReadingList.findOne({
      user: req.user._id,
      book: bookId
    });

    if (existing) {
      return res.status(400).json({ message: "Book already in reading list" });
    }

    const readingListItem = new ReadingList({
      user: req.user._id,
      book: bookId
    });

    await readingListItem.save();

    const populated = await ReadingList.findById(readingListItem._id)
      .populate({
        path: "book",
        populate: { path: "category", select: "name" }
      });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFromReadingList = async (req, res) => {
  try {
    const result = await ReadingList.findOneAndDelete({
      user: req.user._id,
      book: req.params.bookId
    });

    if (!result) {
      return res.status(404).json({ message: "Book not found in reading list" });
    }

    res.json({ message: "Book removed from reading list" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

### OUTPUT
User adds book to reading list:
```json
{
  "_id": "507f1f77bcf86cd799439015",
  "user": "507f1f77bcf86cd799439011",
  "book": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "category": {
      "name": "Fiction"
    }
  },
  "addedAt": "2026-04-11T10:00:00.000Z"
}
```

Alert message: "Added to reading list"

User removes book:
```json
{
  "message": "Book removed from reading list"
}
```

Alert message: "Removed from reading list"

---

## Experiment 13: Develop the Book Library Manager reading list management system using React and Node.js

### AIM
Develop the Book Library Manager reading list management system using React and Node.js.

### Description
This experiment develops a reading list management system using React, which directly matches the Book Library Manager project. Users can add books to their personal reading list, view their saved books, and remove books from the list. The backend stores each reading list entry in MongoDB with user and book references. It represents the core functionality and main objective of the entire project.

### Source Code

**File: `backend/src/models/ReadingList.js`**

```javascript
const mongoose = require("mongoose");

const readingListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

readingListSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model("ReadingList", readingListSchema);
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

exports.addToReadingList = async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    const existing = await ReadingList.findOne({
      user: req.user._id,
      book: bookId
    });

    if (existing) {
      return res.status(400).json({ message: "Book already in reading list" });
    }

    const readingListItem = new ReadingList({
      user: req.user._id,
      book: bookId
    });

    await readingListItem.save();

    const populated = await ReadingList.findById(readingListItem._id)
      .populate({
        path: "book",
        populate: { path: "category", select: "name" }
      });

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
```

**File: `frontend/src/pages/ReadingList.js`**

```javascript
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { getStoredUser } from "../services/auth";

function ReadingList() {
  const [readingList, setReadingList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = getStoredUser();
    if (!user || user.role === "admin") {
      navigate("/");
      return;
    }

    const loadReadingList = async () => {
      try {
        const res = await API.get("/reading-list");
        setReadingList(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not load reading list.");
      } finally {
        setLoading(false);
      }
    };

    loadReadingList();
  }, [navigate]);

  const handleRemove = async (bookId) => {
    try {
      await API.delete(`/reading-list/${bookId}`);
      setReadingList(readingList.filter((item) => item.book._id !== bookId));
    } catch (err) {
      alert("Failed to remove book from reading list");
    }
  };

  return (
    <div className="reading-list-page">
      <section className="dashboard-header">
        <div>
          <p className="auth-eyebrow">My Reading List</p>
          <h1>Your Saved Books</h1>
          <p className="dashboard-subtitle">
            Review your saved books and manage your personal library.
          </p>
        </div>
        <div className="top-actions">
          <Link className="button-link secondary-button-link" to="/dashboard">
            Dashboard
          </Link>
          <Link className="button-link" to="/books">
            Browse Books
          </Link>
        </div>
      </section>

      {loading ? <div className="panel-card">Loading reading list...</div> : null}
      {error ? <div className="panel-card error-box">{error}</div> : null}

      {!loading && !error ? (
        <div className="list-grid">
          {readingList.length === 0 ? (
            <div className="panel-card">
              No books in your reading list yet. Start browsing to add books!
            </div>
          ) : (
            readingList.map((item) => (
              <div className="panel-card" key={item._id}>
                <div className="card-header">
                  <h3>{item.book.title}</h3>
                  <span className="category-badge">{item.book.category?.name}</span>
                </div>
                <p><strong>Author:</strong> {item.book.author}</p>
                <p><strong>Published:</strong> {item.book.publishedYear}</p>
                <p>{item.book.description}</p>
                <p><strong>Added:</strong> {new Date(item.addedAt).toLocaleDateString()}</p>
                <div className="action-row">
                  <Link to={`/books/${item.book._id}`}>View Details</Link>
                  <button onClick={() => handleRemove(item.book._id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}

export default ReadingList;
```

### OUTPUT
Reading list displayed with books:
```json
[
  {
    "_id": "507f1f77bcf86cd799439015",
    "user": "507f1f77bcf86cd799439011",
    "book": {
      "_id": "507f1f77bcf86cd799439013",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "category": {
        "name": "Fiction"
      },
      "publishedYear": 1925,
      "description": "A classic American novel"
    },
    "addedAt": "2026-04-11T10:00:00.000Z"
  }
]
```

User interface shows:
- Book title and author
- Category badge
- Published year
- Description
- Date added to list
- View Details and Remove buttons

---

## Experiment 14: Build the Book Library Manager React application using reusable components and routing between pages

### AIM
Build the Book Library Manager React application using reusable components and routing between pages.

### Description
This experiment demonstrates the use of React components and routing across multiple web pages. Book Library Manager includes separate pages for login, signup, dashboard, book browsing, book details, reading list, and admin management. React Router is used to navigate between pages, and protected routes restrict access to authorized users. It explains how component-based design and routing improve the structure of a multi-page frontend application.

### Source Code

**File: `frontend/src/App.js`**

```javascript
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import BookDetails from "./pages/BookDetails";
import BrowseBooks from "./pages/BrowseBooks";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ManageBooks from "./pages/ManageBooks";
import ReadingList from "./pages/ReadingList";
import ResetPassword from "./pages/ResetPassword";
import Signup from "./pages/Signup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/signup" element={<AdminSignup />} />

        <Route element={<ProtectedRoute allowedRoles={["user", "admin"]} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/books" element={<BrowseBooks />} />
          <Route path="/books/:id" element={<BookDetails />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
          <Route path="/reading-list" element={<ReadingList />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/books" element={<ManageBooks />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

**File: `frontend/src/components/ProtectedRoute.js`**

```javascript
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getStoredUser } from "../services/auth";

function ProtectedRoute({ allowedRoles }) {
  const user = getStoredUser();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
```

**File: `frontend/src/pages/Login.js`**

```javascript
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { saveSession } from "../services/auth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email, password });
      saveSession(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="hero-panel">
          <p className="auth-eyebrow">Book Library Manager</p>
          <h1>Simplify book management for readers and admins</h1>
        </div>

        <form className="auth-card" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? <p className="form-message error">{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
```

**File: `frontend/src/services/auth.js`**

```javascript
export const saveSession = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
```

### OUTPUT
Application routes configured:
- `/` - Login page
- `/signup` - User signup
- `/admin/login` - Admin login
- `/admin/signup` - Admin signup
- `/dashboard` - User/Admin dashboard (protected)
- `/books` - Browse books (protected)
- `/books/:id` - Book details (protected)
- `/reading-list` - User reading list (user only)
- `/admin/books` - Manage books (admin only)

Protected routes redirect unauthorized users to login page.

---

## 🎓 Project Summary

### Complete Technology Stack
**Backend:**
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- bcrypt for password hashing

**Frontend:**
- React & React Router
- Axios for API calls
- localStorage for session management
- CSS for styling

### All Features Implemented
✅ User authentication and authorization
✅ Role-based access control (User/Admin)
✅ Complete CRUD operations for books
✅ Category management
✅ Search and filter functionality
✅ Personalized reading lists
✅ Dashboard with statistics
✅ Protected routes
✅ Form validation

### Key Learning Outcomes
1. Full-stack application architecture
2. RESTful API design principles
3. Database schema design and relationships
4. Authentication and authorization patterns
5. React component-based development
6. State management in React
7. Routing and navigation
8. Form handling and validation

### Future Enhancement Ideas
- Book ratings and reviews
- Book borrowing system
- Email notifications
- Advanced search filters
- Book recommendations
- Social features
- Mobile responsive design
- Admin analytics dashboard

---

**🎉 Congratulations! You have completed all 14 experiments for the Book Library Manager Full Stack Development project.**

---

**End of Part 3 - Complete Experiments Documentation**
