# Meme Collection Manager - Complete Project Guide

A full-stack MEAN (MongoDB, Express, Angular, Node.js) application for managing and sharing memes with real-time likes and comments functionality.

## ✅ Project Status: COMPLETE

All features implemented and tested successfully!

### What's Been Completed

#### Backend (Node.js/Express)
- ✅ Google OAuth 2.0 authentication with Passport.js
- ✅ MongoDB integration with Mongoose
- ✅ RESTful API with proper HTTP semantics
- ✅ Meme CRUD operations (Create, Read, Update, Delete)
- ✅ Like/unlike functionality
- ✅ Comments system
- ✅ Pagination support
- ✅ Security vulnerabilities fixed (404 for unauthorized access, proper response codes)

#### Frontend (Angular 21)
- ✅ Google OAuth login page
- ✅ Dashboard with meme grid gallery
- ✅ Meme detail view with full information
- ✅ Create/Edit meme form with image preview
- ✅ Like functionality with real-time updates
- ✅ Comments section with full CRUD
- ✅ Authentication guards protecting routes
- ✅ Responsive Material Design UI
- ✅ Signal-based state management

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14+) and npm
- **MongoDB** running locally or connection string
- **Google OAuth credentials** (see setup below)

### 1. Setup Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the **Google+ API**
4. Go to **Credentials** → **Create OAuth 2.0 Credentials (Web Application)**
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy your **Client ID** and **Client Secret**

### 2. Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your credentials:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/memesDB
DATABASE_NAME=memesDB
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
COOKIE_KEY=your-random-secure-key-32-chars-min
FRONTEND_URL=http://localhost:4200
BACKEND_URL=http://localhost:3000
```

Generate a secure cookie key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Start MongoDB

```bash
mongod
```

### 4. Start Backend Server

```bash
cd backend
npm install
npm run dev    # or npm start for production
```

Backend will run on `http://localhost:3000`

### 5. Start Frontend Application

```bash
cd frontend
npm install
npm start      # or ng serve
```

Frontend will run on `http://localhost:4200`

### 6. Access the Application

Open `http://localhost:4200` in your browser

---

## 🎯 User Flow

### First Time User
1. **Redirected to `/login`** - Not authenticated
2. **Click "Sign in with Google"** - OAuth redirect
3. **Google login** - Complete authentication
4. **Redirected to dashboard** - See public memes
5. **Browse memes** - Click any meme to view details
6. **Like/comment** - Interact with memes
7. **Create meme** - Click "Create New Meme" button
8. **Manage account** - Click profile menu to logout

### Authenticated User
- Dashboard shows all public memes
- Can create, edit, delete own memes
- Can like/unlike any public meme
- Can comment on any public meme
- Can view own memes from profile menu
- Can make memes private (only they can see)

---

## 📁 Project Structure

```
meme-collection-manager/
├── backend/
│   ├── config/
│   │   └── passport.js           # Google OAuth strategy
│   ├── models/
│   │   ├── user.model.js         # User schema
│   │   └── meme.model.js         # Meme schema
│   ├── routes/
│   │   ├── auth.routes.js        # Auth endpoints
│   │   └── meme.routes.js        # Meme CRUD endpoints
│   ├── .env                       # Environment variables (NOT in git)
│   ├── .env.example               # Environment template
│   └── server.js                  # Express server
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── create-meme/
│   │   │   │   └── meme-detail/
│   │   │   ├── services/
│   │   │   │   ├── auth.ts       # Auth service
│   │   │   │   └── meme.ts       # Meme API service
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts # Route guards
│   │   │   ├── app.routes.ts     # Route definitions
│   │   │   ├── app.config.ts     # App config
│   │   │   └── app.ts            # Root component
│   │   └── main.ts
│   ├── angular.json
│   └── package.json
│
└── docs/                          # Development guides
```

---

## 🔌 API Endpoints

### Authentication
- `GET /auth/google` - Redirect to Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/current_user` - Get logged-in user (returns 401 if not authenticated)
- `GET /auth/logout` - Logout user

### Memes
- `POST /api/memes` - Create meme (authenticated)
- `GET /api/memes` - List public memes (paginated)
- `GET /api/memes/my-memes` - List user's memes (authenticated)
- `GET /api/memes/:id` - Get meme details
- `PATCH /api/memes/:id` - Update meme (owner only)
- `DELETE /api/memes/:id` - Delete meme (owner only)
- `POST /api/memes/:id/like` - Like meme (authenticated)
- `DELETE /api/memes/:id/like` - Unlike meme (authenticated)
- `POST /api/memes/:id/comments` - Add comment (authenticated)
- `DELETE /api/memes/:id/comments/:commentId` - Delete comment (author or owner)

### Response Format
All responses follow REST principles:
- **Success (2xx)**: Returns resource directly or array
- **Created (201)**: Returns created resource
- **No Content (204)**: Delete operations
- **Unauthorized (401)**: Not authenticated
- **Not Found (404)**: Resource doesn't exist or not authorized

---

## 🛣️ Frontend Routes

```
/                  → Dashboard (requires auth)
/login             → Login page (public, redirects if auth)
/create            → Create new meme (requires auth)
/edit/:id          → Edit meme (requires auth)
/meme/:id          → View meme details (requires auth)
```

---

## 🔐 Security Features

- ✅ Google OAuth 2.0 authentication (no passwords stored)
- ✅ Secure session cookies with 24-hour expiration
- ✅ XSRF protection on all state-changing requests
- ✅ Credentials sent with all API requests
- ✅ 404 for unauthorized access (prevents resource enumeration)
- ✅ Owner verification on meme operations
- ✅ Comment permissions (author or meme owner can delete)
- ✅ Private meme support (only owner can view)

---

## 🎨 Frontend Features

### Material Design
- Professional UI with Angular Material components
- Responsive grid layouts
- Smooth animations and transitions
- Dark-aware styling

### State Management
- Angular Signals for reactive updates
- AuthService tracks user and authentication status
- MemeService handles all meme operations
- Automatic state synchronization across components

### User Experience
- Automatic login redirect
- Real-time like/comment updates
- Image preview before posting
- Form validation with error messages
- Loading indicators
- Empty state messaging
- Error handling and user feedback

---

## 🧪 Testing

### Backend
Currently runs without test suite. To add tests, install:
```bash
npm install --save-dev jest supertest
```

### Frontend
Run tests:
```bash
cd frontend
npm test
```

---

## 📊 Database Schema

### User
```
{
  googleId: String (unique),
  displayName: String,
  email: String (unique),
  profileImage: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Meme
```
{
  title: String,
  caption: String,
  imageUrl: String,
  category: String (funny|political|reaction|motivational|other),
  owner: ObjectId (User),
  likes: [ObjectId] (User[]),
  comments: [{
    author: ObjectId (User),
    text: String,
    createdAt: Date
  }],
  isPublic: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🐛 Troubleshooting

### Backend not starting
```bash
# Check if port 3000 is in use
lsof -i :3000

# Check MongoDB connection
mongod --version
```

### Frontend build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### OAuth not working
- Verify Client ID and Secret in `.env`
- Check callback URL matches Google Console settings
- Ensure FRONTEND_URL matches where app is running

### Memes not loading
- Check backend is running: `http://localhost:3000/auth/current_user`
- Check browser console for API errors
- Verify MongoDB is running with memes in DB

---

## 📝 Git Commits

All features were committed separately for clear tracking:

```
aaf0658 fix(frontend): resolve compilation errors in dashboard component
7a2f57d feat(frontend): add edit route for meme updates
ccae9f9 feat(frontend): create meme detail component with likes/comments
e0430e4 feat(frontend): create meme create/edit form component
2e503ad feat(frontend): implement routing and auth guards
9d2b555 feat(frontend): create meme service and dashboard component
e9862ae feat(frontend): create login component
71b0f30 feat(frontend): implement authentication service
8ab13cb feat(backend): create meme CRUD API endpoints
4066843 feat(backend): create meme model with schema
aa7fb03 fix(auth): remove verbose response envelope and fix HTTP semantics
```

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/meme-app to your hosting
```

### Backend (Heroku/Railway)
```bash
# Add Procfile
web: node server.js

# Deploy with environment variables configured
```

Remember to:
- Update `FRONTEND_URL` and `BACKEND_URL` for production
- Use MongoDB Atlas instead of local MongoDB
- Update Google OAuth redirect URLs in Google Console
- Enable HTTPS
- Set strong `COOKIE_KEY`

---

## 📞 Support

For issues or questions:
1. Check browser console for client-side errors
2. Check terminal output for server-side errors
3. Verify all environment variables are set
4. Ensure MongoDB is running
5. Clear browser cache and try again

---

## ✨ Future Enhancements

Potential features to add:
- [ ] Search and filter memes
- [ ] User profiles with meme collections
- [ ] Follow/unfollow users
- [ ] Meme trending/ranking
- [ ] Image upload instead of URL only
- [ ] Notifications for likes/comments
- [ ] Dark mode theme toggle
- [ ] Sharing memes on social media
- [ ] Mobile app with React Native
- [ ] Admin dashboard for moderation

---

**Happy meme sharing!** 🎉
