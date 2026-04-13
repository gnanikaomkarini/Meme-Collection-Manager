# Meme Collection Manager - Full Stack Development Experiments Documentation

Complete documentation for the Meme Collection Manager Full Stack Development Experiments course. This package contains 14 comprehensive experiments organized in 3 parts, covering backend setup, authentication, database operations, frontend development, and full-stack integration.

## Documentation Files

### Main Experiment Files
1. **Meme_Collection_Manager_FSD_Experiments_Part1.md** (Experiments 1-5)
   - Set up Node.js environment
   - Develop user login system with Google OAuth
   - Insert and remove data using backend scripts
   - Implement HTTP request/response handling
   - Connect to MongoDB and define collections

2. **Meme_Collection_Manager_FSD_Experiments_Part2.md** (Experiments 6-10)
   - Implement CRUD operations for meme records
   - Perform count and sorting operations
   - Develop styled Angular login form
   - Develop and validate authentication form with Google OAuth
   - Fetch and display JSON data from backend

3. **Meme_Collection_Manager_FSD_Experiments_Part3.md** (Experiments 11-14)
   - Develop complete web application with Express and Angular
   - Implement like and comment workflow
   - Develop image upload and display system
   - Build Angular application with reusable components and routing

### Reference Files
- **Experiments_Summary.md** - Overview of all 14 experiments with learning outcomes and key skills
- **API_Response_Reference.md** - Actual API responses, error codes, and testing examples
- **README.md** (this file) - Documentation guide

## Project Overview

**Meme Collection Manager** is a full-stack web application for creating, sharing, and managing meme collections.

### Technology Stack
- **Backend:** Node.js with Express.js
- **Frontend:** Angular 17 with standalone components and signals
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** Google OAuth 2.0 with Passport.js
- **Session Management:** connect-mongo for persistent sessions
- **File Upload:** multer middleware with validation
- **UI Framework:** Angular Material Design
- **Build Tool:** Angular CLI

### Key Features
- User authentication with Google OAuth
- Create and upload memes with images
- Like and comment on memes
- Public meme gallery with pagination
- User profile management
- Secure session-based authentication

## Experiment Structure

Each experiment includes:

1. **AIM** - Clear objective of the experiment
2. **Description** - Detailed background and context
3. **Source Code** - Actual project code with file paths
4. **OUTPUT** - Expected results and actual responses

## Learning Path

### Foundational Level (Experiments 1-3)
- Backend initialization
- Authentication setup
- Basic database operations

### Intermediate Level (Experiments 4-10)
- API design and HTTP handling
- Database connection and modeling
- CRUD operations
- Frontend forms and event handling
- API integration

### Advanced Level (Experiments 11-14)
- Full-stack integration
- User interactions and real-time updates
- File upload and processing
- Component architecture and routing

## Quick Links

### By Technology
- **Backend (Node.js/Express):** Experiments 1-7
- **Frontend (Angular):** Experiments 8-10, 12, 14
- **Database (MongoDB):** Experiments 3-7
- **Full-Stack Integration:** Experiments 11, 13

### By Feature
- **Authentication & Authorization:** Experiments 2, 9
- **Database & Data Operations:** Experiments 3-7
- **User Interface:** Experiments 8, 10, 14
- **User Interactions:** Experiments 11-13

## How to Use This Documentation

1. **Sequential Learning:** Start with Part 1 and progress through Part 2 and Part 3
2. **Reference Lookup:** Use Experiments_Summary.md to find specific topics
3. **API Testing:** Reference API_Response_Reference.md for endpoint details
4. **Code Review:** Each experiment includes actual project source code

## Running the Application

### Prerequisites
- Node.js (v18+)
- MongoDB (running on localhost:27017)
- Google OAuth credentials

### Backend Setup
```bash
cd backend
npm install
# Configure .env with MongoDB URI and Google OAuth credentials
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
ng serve
```

### Access Application
- Frontend: http://localhost:4200
- Backend API: http://localhost:3000

## API Reference

See `API_Response_Reference.md` for:
- Complete endpoint documentation
- Request/response examples
- Error codes and handling
- cURL testing examples
- Authentication flow

## Database Schema

### Users Collection
- `_id`: MongoDB ObjectId
- `displayName`: User full name
- `email`: User email
- `profileImage`: Google profile picture URL
- `createdAt`: Account creation timestamp

### Memes Collection
- `_id`: MongoDB ObjectId
- `title`: Meme title
- `caption`: Description
- `imageUrl`: URL to uploaded image
- `category`: Meme category
- `owner`: Reference to User
- `likes`: Array of user references
- `comments`: Array of comment objects
- `isPublic`: Visibility flag
- `createdAt`: Creation timestamp
- `updatedAt`: Last modification timestamp

## Common Issues and Solutions

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check MONGO_URI in `.env` file
- Verify database name matches configuration

### Authentication Issues
- Verify Google OAuth credentials are correct
- Check FRONTEND_URL matches your development environment
- Clear browser cookies and retry login

### Image Upload Issues
- Maximum file size: 5MB
- Allowed types: jpeg, jpg, png, gif, webp
- Ensure `/backend/uploads` directory exists with write permissions

### CORS Issues
- Verify FRONTEND_URL in backend .env
- Ensure credentials: true in Angular HttpClient
- Check for protocol mismatch (http vs https)

## Project Statistics

- **Total Experiments:** 14
- **Backend Experiments:** 7
- **Frontend Experiments:** 6
- **Full-Stack Experiments:** 2
- **Documentation Files:** 5
- **Total Lines of Documentation:** 3,000+

## Additional Resources

### Key Project Files
- `/backend/server.js` - Main Express server configuration
- `/backend/config/passport.js` - OAuth configuration
- `/backend/routes/` - API route handlers
- `/backend/models/` - MongoDB schemas
- `/frontend/src/app/services/` - Angular services
- `/frontend/src/app/components/` - UI components
- `/frontend/src/app/guards/` - Route guards

### API Endpoints
- Authentication: `/auth/google`, `/auth/current_user`, `/auth/logout`
- Memes: `/api/memes`, `/api/memes/:id`, `/api/memes/:id/like`, `/api/memes/:id/comment`
- Upload: `/api/upload`

## Course Information

- **Roll No:** 23WH1A0532
- **Date:** April 13, 2026
- **Subject:** Full Stack Development
- **Project:** Meme Collection Manager

## Feedback and Support

For issues or questions:
1. Review the relevant experiment documentation
2. Check API_Response_Reference.md for endpoint details
3. Verify backend is running and MongoDB is connected
4. Check browser console for frontend errors
5. Check backend logs for server errors

## Document Version

- **Version:** 1.0
- **Last Updated:** April 13, 2026
- **Status:** Complete

---

All experiments are tested and working with the live Meme Collection Manager application. Code samples are taken directly from the project and have been verified to work correctly.
