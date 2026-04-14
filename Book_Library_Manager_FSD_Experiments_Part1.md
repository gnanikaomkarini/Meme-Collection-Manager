# Book Library Manager - Full Stack Development Experiments (Part 1)

**Roll No:** 23WH1A0532  
**Date:** April 11, 2026  
**Project:** Book Library Manager - Digital Library Management System

---

## Experiment 1: Set up the Node.js environment for the Book Library Manager backend and display a basic server response

### AIM
Set up the Node.js environment for the Book Library Manager backend and display a basic server response.

### Description
This experiment demonstrates the basic setup of a Node.js environment using the Book Library Manager backend application. The Express server is initialized and a simple root route is created to verify successful configuration. When the server runs, it returns a basic text response confirming that the backend environment is installed, connected, and ready for further development.

### Source Code

**File: `backend/server.js`**

```javascript
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const userRoutes = require("./src/routes/userRoutes");
const bookRoutes = require("./src/routes/bookRoutes");
const authRoutes = require("./src/routes/authRoutes");

const app = express();

// Connect Database
connectDB();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Book Library Manager Backend Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### OUTPUT
```
Server running on port 5000
MongoDB Connected
```

Browser at `http://localhost:5000/` displays:
```
Book Library Manager Backend Running
```

---

## Experiment 2: Develop a Node.js based user login system for the Book Library Manager application

### AIM
Develop a Node.js based user login system for the Book Library Manager application.

### Description
This experiment implements a user login system using Node.js, Express, and MongoDB. It validates user credentials, checks encrypted passwords with bcrypt, and generates a JWT token after successful login. The Book Library Manager project uses this module for secure authentication of users and admins. It shows how backend login logic can be used to control access to protected application features.

### Source Code

**File: `backend/src/routes/authRoutes.js`**

```javascript
const express = require("express");
const {
  register,
  registerAdmin,
  login,
  resetPassword,
  me
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/register-admin", registerAdmin);
router.post("/login", login);
router.post("/reset-password", resetPassword);
router.get("/me", protect, me);

module.exports = router;
```

**File: `backend/src/controllers/authController.js`**

```javascript
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const buildToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || "secretkey",
    { expiresIn: "1d" }
  );

const sanitizeUser = (user) => {
  const { password, ...userData } = user._doc;
  return userData;
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      token: buildToken(user),
      user: sanitizeUser(user)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

**File: `backend/src/models/User.js`**

```javascript
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      required: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
```

### OUTPUT
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## Experiment 3: Write a Node.js program to insert and remove Book Library Manager project data using backend scripts

### AIM
Write a Node.js program to insert and remove Book Library Manager project data using backend scripts.

### Description
This experiment focuses on performing data operations similar to read, write, and delete actions in Node.js. In Book Library Manager, these actions are handled through MongoDB scripts rather than traditional file system operations. The seed and reset scripts insert sample records and remove existing records from the database. It demonstrates programmatic data management for application setup and testing.

### Source Code

**File: `backend/src/seed.js`**

```javascript
require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const User = require("./models/User");
const Category = require("./models/Category");
const Book = require("./models/Book");

connectDB();

const seed = async () => {
  await User.deleteMany();
  await Category.deleteMany();
  await Book.deleteMany();

  const password = await bcrypt.hash("Password123", 10);

  await User.create([
    {
      name: "Admin User",
      email: "admin@library.com",
      role: "admin",
      password
    },
    {
      name: "Regular User",
      email: "user@library.com",
      role: "user",
      password
    }
  ]);

  const categories = await Category.create([
    { name: "Fiction", description: "Fictional literature" },
    { name: "Science", description: "Scientific books" },
    { name: "History", description: "Historical books" }
  ]);

  await Book.create([
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      category: categories[0]._id,
      description: "A classic American novel",
      publishedYear: 1925,
      isbn: "9780743273565"
    }
  ]);

  console.log("Seed data inserted");
  console.log("Default password for all seeded users: Password123");
  process.exit();
};

seed();
```

**File: `backend/src/resetData.js`**

```javascript
require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Book = require("./models/Book");
const Category = require("./models/Category");
const ReadingList = require("./models/ReadingList");

connectDB();

const resetData = async () => {
  await ReadingList.deleteMany();
  await Book.deleteMany();
  await Category.deleteMany();
  await User.deleteMany();
  
  console.log("All users, books, categories and reading lists have been removed.");
  process.exit();
};

resetData();
```

### OUTPUT
```
MongoDB Connected
Seed data inserted
Default password for all seeded users: Password123
```

---

## Experiment 4: Implement HTTP request and response handling for the Book Library Manager book management API

### AIM
Implement HTTP request and response handling for the Book Library Manager book management API.

### Description
This experiment shows how Node.js handles HTTP requests and responses through backend routes. In Book Library Manager, book operations are submitted through API endpoints created with Express. The server receives request data, validates it, processes it, and returns a JSON response. It highlights the request-response cycle used in modern web application backends.

### Source Code

**File: `backend/src/routes/bookRoutes.js`**

```javascript
const express = require("express");
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require("../controllers/bookController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getAllBooks);
router.get("/:id", getBookById);
router.post("/", protect, authorize("admin"), createBook);
router.put("/:id", protect, authorize("admin"), updateBook);
router.delete("/:id", protect, authorize("admin"), deleteBook);

module.exports = router;
```

**File: `backend/src/controllers/bookController.js`**

```javascript
const Book = require("../models/Book");

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

exports.createBook = async (req, res) => {
  try {
    const { title, author, category, description, publishedYear, isbn } = req.body;

    if (!title || !author || !category) {
      return res.status(400).json({ message: "Title, author and category are required" });
    }

    const book = await Book.create({
      title: title.trim(),
      author: author.trim(),
      category,
      description: description?.trim() || "",
      publishedYear,
      isbn: isbn?.trim() || ""
    });

    const populatedBook = await Book.findById(book._id).populate("category", "name");
    res.status(201).json(populatedBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
```

### OUTPUT
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "category": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Fiction"
  },
  "description": "A classic American novel",
  "publishedYear": 1925
}
```

---

## Experiment 5: Connect the Book Library Manager project to MongoDB and define the required database collections

### AIM
Connect the Book Library Manager project to MongoDB and define the required database collections.

### Description
This experiment demonstrates the use of MongoDB databases and collections in the Book Library Manager project. The application connects to MongoDB and defines schemas for users, books, categories, and reading lists using Mongoose. These schemas represent structured collections that store authentication and library information. It explains how database connection and collection design support the project's data layer.

### Source Code

**File: `backend/src/config/db.js`**

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("DB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

**File: `backend/src/models/Book.js`**

```javascript
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    publishedYear: {
      type: Number
    },
    isbn: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
```

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

### OUTPUT
```
MongoDB Connected
```

Database collections created:
- users
- categories
- books
- readinglists

---

**End of Part 1**

*Continue to Part 2 for Experiments 6-10*
