# Meme Collection Manager: A Step-by-Step Development Plan

This document provides a detailed, step-by-step plan for building the Meme Collection Manager application using the MEAN (MongoDB, Express, Angular, Node.js) stack.

---

## Phase 0: Project Setup

This phase covers the initial setup of your project structure and the initialization of the frontend and backend applications.

### Step 0.1: Create Project Folders

First, create two main folders for the backend and frontend code.

```bash
# In your project's root directory
mkdir backend
mkdir frontend
```

### Step 0.2: Initialize the Backend (Node.js & Express)

1.  **Navigate into the `backend` directory:**
    ```bash
    cd backend
    ```

2.  **Initialize a new Node.js project:**
    This creates a `package.json` file.
    ```bash
    npm init -y
    ```

3.  **Install necessary npm packages:**
    *   `express`: The web server framework.
    *   `mongoose`: The Object Data Modeling (ODM) library for MongoDB.
    *   `cors`: To enable Cross-Origin Resource Sharing (so your frontend can talk to your backend).
    *   `dotenv`: To manage environment variables (like your database connection string).
    *   `nodemon`: A tool that automatically restarts your server on file changes (for development).

    ```bash
    npm install express mongoose cors dotenv
    npm install --save-dev nodemon
    ```

4.  **Add a `start` script to `package.json`:**
    Open `backend/package.json` and add the following to the `scripts` section. This allows you to run `npm start` to launch the server with `nodemon`.

    ```json
    "scripts": {
      "start": "nodemon server.js"
    }
    ```

### Step 0.3: Initialize the Frontend (Angular)

1.  **Navigate into the `frontend` directory:**
    ```bash
    cd ../frontend  # Or 'cd frontend' from the root
    ```

2.  **Create a new Angular application:**
    The Angular CLI will generate the entire project structure for you.
    *   `--routing`: Sets up a routing module for navigation.
    *   `--style=css`: Sets the stylesheet format to standard CSS.
    *   `--minimal=true`: Creates a minimal project without testing frameworks to keep it simple.

    ```bash
    ng new meme-app --routing --style=css --minimal=true
    ```
    This will create a new folder `meme-app` inside `frontend`. All your frontend work will happen inside `frontend/meme-app`.

---

## Phase 1: Backend Development (The API)

In this phase, you will build the API that handles all CRUD (Create, Read, Update, Delete) operations for memes.

### Step 1.1: Create the Express Server and Connect to MongoDB

1.  **Create a `server.js` file** inside the `backend` folder. This is the entry point for your backend.

2.  **Create a `.env` file** in the `backend` folder to store your MongoDB connection string.
    ```
    MONGO_URI=mongodb://localhost:27017/memesDB
    ```

3.  **Write the initial server code in `server.js`:**
    This code sets up a basic Express server and connects to your local MongoDB database using Mongoose.

    ```javascript
    // backend/server.js
    require('dotenv').config();
    const express = require('express');
    const mongoose = require('mongoose');
    const cors = require('cors');

    const app = express();
    const PORT = process.env.PORT || 3000;

    // Middleware
    app.use(cors());
    app.use(express.json()); // To parse JSON request bodies

    // Connect to MongoDB
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log('Successfully connected to MongoDB'))
      .catch(err => console.error('Connection error', err));

    // Basic route
    app.get('/', (req, res) => {
      res.send('Welcome to the Meme API!');
    });

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    ```

### Step 1.2: Define the Meme Schema and Model

For modularity, we'll create separate folders for models, routes, and controllers.

1.  **Create the folders:**
    In the `backend` directory, create `models`, `routes`, and `controllers`.

2.  **Create the Meme Model:**
    Inside `backend/models`, create a file named `meme.model.js`. This file defines the structure (schema) of a meme document in your database.

    ```javascript
    // backend/models/meme.model.js
    const mongoose = require('mongoose');

    const memeSchema = new mongoose.Schema({
      caption: {
        type: String,
        required: true,
      },
      imageUrl: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        enum: ['Funny', 'Relatable', 'Dark', 'Wholesome'],
        required: true
      },
      likes: {
        type: Number,
        default: 0
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    });

    module.exports = mongoose.model('Meme', memeSchema);
    ```

### Step 1.3: Create the Controller Functions

The controller contains the logic for handling requests.

1.  **Create the Meme Controller file:**
    Inside `backend/controllers`, create a file named `meme.controller.js`.

2.  **Add the CRUD functions:**
    Each function handles a specific API operation.

    ```javascript
    // backend/controllers/meme.controller.js
    const Meme = require('../models/meme.model');

    // CREATE a new meme
    exports.createMeme = async (req, res) => {
      try {
        const newMeme = new Meme(req.body);
        const savedMeme = await newMeme.save();
        res.status(201).json(savedMeme);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    };

    // READ all memes
    exports.getMemes = async (req, res) => {
      try {
        const memes = await Meme.find();
        res.status(200).json(memes);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };

    // READ a single meme by ID
    exports.getMemeById = async (req, res) => {
        try {
            const meme = await Meme.findById(req.params.id);
            if (!meme) return res.status(404).json({ message: 'Meme not found' });
            res.status(200).json(meme);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };

    // UPDATE a meme by ID
    exports.updateMeme = async (req, res) => {
      try {
        const updatedMeme = await Meme.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedMeme) return res.status(404).json({ message: 'Meme not found' });
        res.status(200).json(updatedMeme);
      } catch (error) {
        res.status(400).json({ message: error.message });
      }
    };

    // DELETE a meme by ID
    exports.deleteMeme = async (req, res) => {
      try {
        const deletedMeme = await Meme.findByIdAndDelete(req.params.id);
        if (!deletedMeme) return res.status(404).json({ message: 'Meme not found' });
        res.status(200).json({ message: 'Meme successfully deleted' });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    };
    ```

### Step 1.4: Define the API Routes

The routes file maps API endpoints to controller functions.

1.  **Create the Meme Routes file:**
    Inside `backend/routes`, create `meme.routes.js`.

2.  **Define the endpoints:**
    This sets up the URL paths for your API.

    ```javascript
    // backend/routes/meme.routes.js
    const express = require('express');
    const router = express.Router();
    const memeController = require('../controllers/meme.controller');

    // Route for creating a new meme
    router.post('/memes', memeController.createMeme);

    // Route for getting all memes
    router.get('/memes', memeController.getMemes);

    // Route for getting a single meme by ID
    router.get('/memes/:id', memeController.getMemeById);

    // Route for updating a meme
    router.put('/memes/:id', memeController.updateMeme);

    // Route for deleting a meme
    router.delete('/memes/:id', memeController.deleteMeme);

    module.exports = router;
    ```

### Step 1.5: Wire up the Routes in `server.js`

Finally, tell your Express app to use the routes you just created.

1.  **Update `server.js`:**
    Add these lines to `backend/server.js` before `app.listen()`.

    ```javascript
    // backend/server.js

    // ... (rest of the code from Step 1.1) ...

    // API Routes
    const memeRoutes = require('./routes/meme.routes');
    app.use('/api', memeRoutes); // All meme routes will be prefixed with /api

    // ... (app.listen) ...
    ```

**You now have a complete backend API!** You can test it using a tool like Postman or Insomnia. Start your server from the `backend` directory:

```bash
npm start
```

---

## Phase 2: Frontend Development (The Angular App)

Navigate to `frontend/meme-app` for all these steps.

### Step 2.1: Create a Meme Model Interface

Create a TypeScript interface to define the data structure for a meme on the frontend.

1.  **Create an interface file:**
    ```bash
    ng generate interface models/meme
    ```
2.  **Define the interface in `src/app/models/meme.ts`:**
    ```typescript
    export interface Meme {
      _id: string;
      caption: string;
      imageUrl: string;
      category: 'Funny' | 'Relatable' | 'Dark' | 'Wholesome';
      likes?: number;
      createdAt?: Date;
    }
    ```

### Step 2.2: Create a Service to Communicate with the API

The service will handle all HTTP requests to your backend.

1.  **Generate a service:**
    ```bash
    ng generate service services/meme
    ```

2.  **Import `HttpClient`:**
    Open `src/app/app.module.ts` and add `HttpClientModule`.
    ```typescript
    import { HttpClientModule } from '@angular/common/http';

    @NgModule({
      // ...
      imports: [
        // ...
        HttpClientModule
      ],
      // ...
    })
    ```

3.  **Implement the service methods in `src/app/services/meme.service.ts`:**
    ```typescript
    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';
    import { Observable } from 'rxjs';
    import { Meme } from '../models/meme';

    @Injectable({
      providedIn: 'root'
    })
    export class MemeService {
      private apiUrl = 'http://localhost:3000/api/memes'; // Your backend URL

      constructor(private http: HttpClient) { }

      getMemes(): Observable<Meme[]> {
        return this.http.get<Meme[]>(this.apiUrl);
      }

      createMeme(memeData: Partial<Meme>): Observable<Meme> {
        return this.http.post<Meme>(this.apiUrl, memeData);
      }

      deleteMeme(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
      }
    }
    ```

### Step 2.3: Create Components for Displaying Memes

1.  **Generate a `meme-list` component:** This will display the gallery.
    ```bash
    ng generate component components/meme-list
    ```

2.  **Code the `meme-list` component:**
    *   **`meme-list.component.ts`:** Fetch the memes from the service.
        ```typescript
        import { Component, OnInit } from '@angular/core';
        import { MemeService } from '../../services/meme.service';
        import { Meme } from '../../models/meme';

        @Component({
          selector: 'app-meme-list',
          templateUrl: './meme-list.component.html',
          styleUrls: ['./meme-list.component.css']
        })
        export class MemeListComponent implements OnInit {
          memes: Meme[] = [];

          constructor(private memeService: MemeService) { }

          ngOnInit(): void {
            this.loadMemes();
          }

          loadMemes(): void {
            this.memeService.getMemes().subscribe(data => {
              this.memes = data;
            });
          }
        }
        ```
    *   **`meme-list.component.html`:** Display the memes in a simple list.
        ```html
        <h2>Meme Gallery</h2>
        <div *ngIf="memes.length === 0">No memes yet!</div>
        <ul>
          <li *ngFor="let meme of memes">
            <img [src]="meme.imageUrl" alt="{{ meme.caption }}" width="200">
            <p>{{ meme.caption }} - [{{ meme.category }}]</p>
          </li>
        </ul>
        ```

3.  **Add the list to the main app component:**
    Open `src/app/app.component.html` and replace its content with:
    ```html
    <h1>Meme Collection Manager</h1>
    <router-outlet></router-outlet>
    ```
4.  **Set up routing in `src/app/app-routing.module.ts`:**
    ```typescript
    import { NgModule } from '@angular/core';
    import { RouterModule, Routes } from '@angular/router';
    import { MemeListComponent } from './components/meme-list/meme-list.component';

    const routes: Routes = [
      { path: '', redirectTo: '/memes', pathMatch: 'full' },
      { path: 'memes', component: MemeListComponent }
    ];

    @NgModule({
      imports: [RouterModule.forRoot(routes)],
      exports: [RouterModule]
    })
    export class AppRoutingModule { }
    ```

### Step 2.4: Create a Component for Adding a New Meme

1.  **Generate a `meme-form` component:**
    ```bash
    ng generate component components/meme-form
    ```
2.  **Import `FormsModule` in `app.module.ts`** to use `ngModel`.
    ```typescript
    import { FormsModule } from '@angular/forms'; // Add this

    @NgModule({
      //...
      imports: [
        //...
        FormsModule
      ],
      //...
    })
    ```
3.  **Code the `meme-form` component:**
    *   **`meme-form.component.html`:**
        ```html
        <h3>Add a New Meme</h3>
        <form (ngSubmit)="onSubmit()">
          <div>
            <label for="caption">Caption:</label>
            <input type="text" [(ngModel)]="meme.caption" name="caption" required>
          </div>
          <div>
            <label for="imageUrl">Image URL:</label>
            <input type="text" [(ngModel)]="meme.imageUrl" name="imageUrl" required>
          </div>
          <div>
            <label for="category">Category:</label>
            <select [(ngModel)]="meme.category" name="category" required>
              <option value="Funny">Funny</option>
              <option value="Relatable">Relatable</option>
              <option value="Dark">Dark</option>
              <option value="Wholesome">Wholesome</option>
            </select>
          </div>
          <button type="submit">Save Meme</button>
        </form>
        ```
    *   **`meme-form.component.ts`:**
        ```typescript
        import { Component } from '@angular/core';
        import { MemeService } from '../../services/meme.service';
        import { Router } from '@angular/router';

        @Component({
          selector: 'app-meme-form',
          templateUrl: './meme-form.component.html',
          styleUrls: ['./meme-form.component.css']
        })
        export class MemeFormComponent {
          meme: any = {
            caption: '',
            imageUrl: '',
            category: 'Funny'
          };

          constructor(private memeService: MemeService, private router: Router) { }

          onSubmit(): void {
            this.memeService.createMeme(this.meme).subscribe(() => {
              this.router.navigate(['/memes']); // Go back to the list
            });
          }
        }
        ```
4.  **Add a route for the form in `app-routing.module.ts`** and a link in `meme-list.component.html`.
    *   **`app-routing.module.ts`:**
        ```typescript
        import { MemeFormComponent } from './components/meme-form/meme-form.component';
        // ...
        const routes: Routes = [
          // ...
          { path: 'memes', component: MemeListComponent },
          { path: 'memes/new', component: MemeFormComponent }
        ];
        // ...
        ```
    *   **`meme-list.component.html`:** (Add this inside the component)
        ```html
        <a routerLink="/memes/new">Add New Meme</a>
        ```

---

## Phase 3: Running the Full Application

To run the full-stack application, you need to have both the backend and frontend servers running at the same time.

1.  **Start the Backend:**
    Open a terminal, navigate to the `backend` directory, and run:
    ```bash
    npm start
    ```

2.  **Start the Frontend:**
    Open a *second* terminal, navigate to the `frontend/meme-app` directory, and run:
    ```bash
    ng serve --open
    ```
    This will start the Angular development server and automatically open your browser to `http://localhost:4200`.

You now have a working CRUD application! You can see your memes, add new ones, and build from here to add edit, delete, and other features following the patterns established above.
