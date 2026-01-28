# Guide: 04 - Implementing Backend Authentication

This guide walks you through writing the code for the backend authentication system. It uses Passport.js and the `passport-google-oauth20` strategy to handle user login and session management, as outlined in the project's development plan.

---

### **Prerequisites**

*   You have completed the steps in "Guide: 01 - Initializing the Node.js Backend".
*   You have completed the steps in "Guide: 03 - Setting Up Google OAuth Credentials" and your `backend/.env` file contains your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

---

### **Step 1: Create the User Model**

This is the first and crucial step for setting up authentication. This model defines how user data obtained from Google will be stored in your MongoDB database. It's essential that the field names and validation rules match the expectations of your Passport.js strategy and ensure data integrity.

*   **File to Create**: `backend/models/user.model.js`
*   **What to Implement**:
    1.  **Import Mongoose**: Start by requiring the `mongoose` library.
    2.  **Define Schema**: Create a new `mongoose.Schema()`. This will be the blueprint for your user documents.
    3.  **Add Fields**: Define the following fields within your schema definition object:
        *   `googleId`: This *must* be `googleId` (not `id`) to match the `profile.id` provided by Google. It should be a `String`, `required: true`, `unique: true`, and `index: true` for efficient lookups during authentication.
        *   `displayName`: This *must* be `displayName` (not `Name`) to match `profile.displayName`. It should be a `String`, `required: true`, and include `trim: true` to remove extraneous whitespace.
        *   `email`: This should be a `String`, `required: true`, and `unique: true`. Crucially, include `lowercase: true` and `trim: true` to ensure email addresses are stored consistently (e.g., `User@Example.com` becomes `user@example.com`), which is vital for correct uniqueness validation.
        *   `profileImage`: This *must* be `profileImage` (not `profilePicture`) to match `profile.photos[0].value`. It should be a `String` and is not `required`.
    4.  **Enable Timestamps (Correctly)**: After the schema definition object, pass a *second argument* to `new mongoose.Schema()`. This second argument is an options object, where you should set `{ timestamps: true }`. This tells Mongoose to automatically add `createdAt` and `updatedAt` fields to your documents.
    5.  **Export Model**: Finally, export the Mongoose model using `module.exports = mongoose.model('User', userSchema)`.

**Example `backend/models/user.model.js` (Corrected):**

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // The unique ID provided by Google for the user. Matches profile.id.
  googleId: {
    type: String,
    required: true,
    unique: true,
    index: true // Indexed for fast lookups.
  },

  // The user's full display name from their Google account. Matches profile.displayName.
  displayName: {
    type: String,
    required: true,
    trim: true
  },

  // The user's primary email address from their Google account. Matches profile.emails[0].value.
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true, // Store emails in a consistent format.
    trim: true
  },

  // The URL for the user's profile picture. Matches profile.photos[0].value.
  profileImage: {
    type: String
  }
}, {
  // Correct placement for schema options, enables createdAt and updatedAt.
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

---

### **Step 2: Configure the Passport Strategy**

*   **File to Create**: `backend/config/passport.js`
*   **What to Implement**:
    1.  **Import Dependencies**: Require `passport`, `passport-google-oauth20`, and your newly created `User` model from `../models/user.model.js`.
    2.  **Use Google Strategy**: Call `passport.use()` and provide it with a `new GoogleStrategy()`. This function takes two arguments:
        *   **Configuration Object**: This object tells the strategy your app's credentials. It needs:
            *   `clientID`: Get this from your environment variables: `process.env.GOOGLE_CLIENT_ID`.
            *   `clientSecret`: Likewise, get `process.env.GOOGLE_CLIENT_SECRET`.
            *   `callbackURL`: This is the exact URL on your backend that Google will redirect to after the user authenticates. To make it dynamic, build it from your environment variables: `${process.env.BACKEND_URL}/api/auth/google/callback`.
            *   `proxy: true`: This option is important if your backend runs behind a proxy (like Nginx or a cloud load balancer), telling Passport to trust the `callbackURL` from the proxy.
        *   **Verification Callback**: This is an `async` function that Passport will execute after it successfully gets the user's profile from Google. It receives `(accessToken, refreshToken, profile, done)` as arguments. Inside this function, you must:
            *   Wrap your logic in a `try...catch` block.
            *   **Find User**: Try to find a user in your database with a `googleId` that matches `profile.id`. Use `await User.findOne({ googleId: profile.id })`.
            *   **If User Exists**: Call the `done` callback with `done(null, user)`. This tells Passport the authentication was successful and provides the user object.
            *   **If User Doesn't Exist**: Create a `newUser` object using details from the `profile` object (e.g., `displayName: profile.displayName`, `email: profile.emails[0].value`, `profileImage: profile.photos[0].value`). Save this to the database using `await User.create(newUser)`. Then call `done(null, createdUser)`.
    3.  **Implement `serializeUser`**: After the verification callback, implement `passport.serializeUser((user, done) => { ... })`. Its job is to decide what piece of user information to store in the session cookie. To keep the cookie lightweight and secure, you should only store the user's unique database ID: `done(null, user.id)`.
    4.  **Implement `deserializeUser`**: Implement `passport.deserializeUser(async (id, done) => { ... })`. On every request with a session cookie, Passport takes the `id` from the cookie and passes it to this function. Here, you must query your database to find the user by that ID (`await User.findById(id)`). Once you have the full user object, pass it to the `done` callback: `done(null, user)`. The user object you pass here is what becomes available as `req.user` in your API routes.

---

### **Step 3: Define the Authentication Routes**

*   **File to Create**: `backend/routes/auth.routes.js`
*   **What to Implement**:
    1.  **Import Dependencies**: Require `express` and `passport`.
    2.  **Create Router**: Instantiate a new router with `express.Router()`.
    3.  **Define Routes**:
        *   `GET /google`: This route initiates the login flow. The handler is simply `passport.authenticate('google', { scope: ['profile', 'email'] })`. The `scope` array tells Google what user data you are requesting access to.
        *   `GET /google/callback`: This is the endpoint Google redirects to. It has two handlers:
            1.  `passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL })`: This middleware intercepts the request, handles the code exchange with Google, and triggers your verification callback from Step 2. If anything fails, it redirects to the URL you specify using the `FRONTEND_URL` environment variable.
            2.  `(req, res) => { ... }`: This handler only runs on successful authentication. Its only job is to redirect the user's browser to the main part of your frontend application, for example by calling `res.redirect(`${process.env.FRONTEND_URL}/memes`)`.
        *   `GET /current_user`: This is a simple endpoint for the frontend to check if a user is logged in. The handler should just send back the `req.user` object: `res.send(req.user)`. Passport will ensure `req.user` is either the user object or `undefined` (which will be sent as `null` by `res.send`).
        *   `GET /logout`: This endpoint clears the session. The handler needs to call the `req.logout()` function that Passport attaches to the request object. As of `passport@0.6`, this is an asynchronous function, so you must provide a callback to handle any errors and perform the redirect: `req.logout((err) => { if (err) { return next(err); } res.redirect(process.env.FRONTEND_URL); })`.
    4.  **Export Router**: Export the configured router using `module.exports = router`.

---

### **Step 4: Create the Main Server File**

*   **File to Create**: `backend/server.js`
*   **What to Implement**:
    1.  **Load Environment**: The very first line of the file should be `require('dotenv').config()`.
    2.  **Import Dependencies**: Require all necessary modules: `express`, `mongoose`, `cors`, `passport`, `cookie-session`.
    3.  **Connect to Database**: Write and call an `async` function that uses `mongoose.connect()` with `process.env.MONGO_URI` to establish a connection to your database. Make sure to specify `dbName: process.env.DATABASE_NAME || 'memesDB'` for clarity. Include `try...catch` for error handling and `process.exit(1)` on failure.
    4.  **Register Passport Config**: Immediately after the database connection logic (and after defining your `User` model, implicitly by requiring Mongoose), you **must** `require('./config/passport')`. This executes the code in that file, which is necessary for Passport to know about the Google strategy you defined.
    5.  **Initialize App and Middleware (in order)**:
        *   Instantiate your app: `const app = express()`.
        *   `app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }))`: Configure CORS to allow requests from your frontend's domain and to permit cookies (`credentials: true`).
        *   `app.use(express.json())`: Add this middleware to parse incoming JSON request bodies.
        *   `app.use(cookieSession({ ... }))`: Configure the session middleware. It needs `maxAge` (the duration of the cookie in milliseconds, e.g., 30 days) and `keys` (an array containing your `COOKIE_KEY` from `.env` to encrypt the session cookie).
        *   `app.use(passport.initialize())`: Initializes Passport itself.
        *   `app.use(passport.session())`: This middleware enables persistent login sessions by managing the serialization and deserialization of user information.
    6.  **Mount Routes**: Use `app.use('/api/auth', require('./routes/auth.routes'))` to tell your Express app to use the authentication router for all requests starting with `/api/auth`.
    7.  **Error Handling**: Include a basic error handling middleware (`app.use((err, req, res, next) => { ... })`) as the last `app.use` statement.
    8.  **Start Server**: Use `app.listen()` with your `PORT` from `.env` to start the server, but only if `process.env.NODE_ENV` is not `'test'`. Export the `app` for testing purposes.

Following these detailed instructions will allow you to construct the entire authentication system correctly.