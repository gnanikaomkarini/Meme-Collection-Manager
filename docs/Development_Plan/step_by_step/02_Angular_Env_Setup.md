# Guide: 02 - Configuring Frontend Environments in Angular

This document provides a step-by-step guide on how to properly configure the frontend environment for your Angular application. The goal is to make the backend URL modular, so it can be easily changed for development, testing, and production environments.

---

### **Understanding Angular's Environment System**

Unlike a Node.js backend that uses `.env` files, Angular's CLI has a built-in system that uses files in the `frontend/meme-app/src/environments/` directory. By default, you have:

*   `environment.ts`: Used for local development (`ng serve`).
*   `environment.prod.ts`: Automatically used when you build for production (`ng build --configuration production`).

This is the standard, type-safe, and recommended way to manage configuration in Angular.

---

### **Step 1: Update the Development Environment**

Modify the development configuration to separate the base URL from the full API path. This makes it easier to change the backend server address later.

**File:** `frontend/meme-app/src/environments/environment.ts`

```typescript
// Define the base URL for your local backend server
const backendUrl = 'http://localhost:3000';

export const environment = {
  production: false,
  // Make the base URL available as a property
  backendUrl: backendUrl,
  // Construct the full API URL from the base URL
  apiUrl: `${backendUrl}/api`
};
```

---

### **Step 2: Update the Production Environment**

Do the same for the production configuration, but use your actual production domain as the `backendUrl`.

**File:** `frontend/meme-app/src/environments/environment.prod.ts`

```typescript
// Define the base URL for your live production backend
const backendUrl = 'https://your-production-api-domain.com';

export const environment = {
  production: true,
  // Make the base URL available as a property
  backendUrl: backendUrl,
  // Construct the full API URL from the base URL
  apiUrl: `${backendUrl}/api`
};
```

---

### **Step 3: Using the Environment in Your Services**

Your Angular services, like `AuthService` and `MemeService`, should already be importing and using `environment.apiUrl`. No changes are needed there, but this setup ensures that when you build for production, the services will automatically point to the correct live API endpoint.

**Example (No change needed):**

```typescript
// In a service like auth.service.ts
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // This now correctly points to 'http://localhost:3000/api' in dev
  // and 'https://your-production-api-domain.com/api' in production.
  private apiUrl = `${environment.apiUrl}/auth`;

  // ...
}
```

By following these steps, your frontend configuration is now clean, modular, and correctly set up for both development and production environments, using Angular's standard practices.
