# Guide: 06 - Implementing Frontend Authentication

This guide provides a complete, step-by-step plan for building the frontend of the Meme Collection Manager using Angular. It covers project setup, creating a user interface with Angular Material, and implementing the full authentication flow to communicate with the backend you've already built.

This guide assumes the Angular project files are located directly inside the `/frontend` directory.

---

### **Prerequisites**

*   You have Node.js and the Angular CLI installed (`npm install -g @angular/cli`).
*   Your backend server is running and accessible at `http://localhost:3000`.

---

### **Step 1: Initialize the Angular Project**

First, navigate to the `frontend` directory and initialize it as an Angular application.

1.  Open your terminal and navigate to the `frontend` directory.
2.  If the directory is empty, you can generate the project files directly inside it. If you have already created the project, you can skip to Step 2.
    ```bash
    # Run this from within the /frontend directory
    ng new . --routing --style=scss
    ```
    *   `ng new .`: The `.` tells the CLI to create the project in the current directory.
    *   `--routing`: This flag creates a separate `app-routing.module.ts` file to handle application navigation.
    *   `--style=scss`: This sets the project's stylesheet format to SCSS.

### **Step 2: Add Angular Material**

We will use Angular Material to quickly build a clean, modern user interface.

1.  From within the `frontend` directory, run the following command:
    ```bash
    ng add @angular/material
    ```
2.  The CLI will ask you a few questions to set up the library:
    *   **Choose a prebuilt theme name, or "custom"**: Select a theme (e.g., `Indigo/Pink`).
    *   **Set up global Angular Material typography styles?**: Choose `Yes`.
    *   **Set up browser animations for Angular Material?**: Choose `Include and enable animations`.

### **Step 3: Configure Environment Files**

Just as with the backend, we need to tell the frontend where to find the backend API.

1.  Open `frontend/src/environments/environment.ts`.
2.  Inside the `environment` object, add a new property named `backendUrl`.
3.  Set the value of this property to your backend's address as a string (e.g., `'http://localhost:3000'`).

### **Step 4: Create the Core Authentication Service**

This service will be the central point for handling all authentication logic, such as checking the user's status and logging them in or out.

1.  Generate the service using the Angular CLI:
    ```bash
    ng generate service services/auth
    ```
2.  Open the new file `frontend/src/app/services/auth.ts` and implement the following logic:
    *   **Imports**: Import `Injectable` from `@angular/core`, `HttpClient` from `@angular/common/http`, `BehaviorSubject`, `Observable`, and `of` from `rxjs`, `tap` and `catchError` from `rxjs/operators`, and your `environment` file.
    *   **Interfaces**: Define two exported interfaces, `User` and `ApiResponse<T>`, to provide strong typing for the data you expect from your backend. The `User` interface should match your backend's user model, and `ApiResponse` should match the success/error envelope.
    *   **State Management**: Inside the `AuthService` class, create a private `BehaviorSubject` named `userSubject` to hold the current user state. Initialize it with `null` to represent a logged-out state. Then, create a public observable property named `user$` and assign it the value of `this.userSubject.asObservable()`.
    *   **Constructor**: Inject `HttpClient` into the service's constructor. From within the constructor, call a method (which you will create next) to check the user's authentication status as soon as the application loads.
    *   **`checkAuthStatus()` Method**: Create this public method. It should make an HTTP `GET` request to your backend's `/auth/current_user` endpoint. **Crucially**, include the `{ withCredentials: true }` option in the request to ensure the session cookie is sent. Use RxJS's `.pipe()` method to handle the response.
        *   In the `tap` operator, check if the API response was successful and contains user data in its `data` property. If so, call `this.userSubject.next()` with the user data. Otherwise, call it with `null`.
        *   In the `catchError` operator, call `this.userSubject.next(null)` to handle cases where the HTTP request itself fails (e.g., the backend is down). Return an empty observable with `of()` to allow the application to continue.
    *   **`login()` Method**: Create a public `login()` method. Its only job is to change the browser's location to your backend's Google authentication URL (e.g., `window.location.href = 'http://localhost:3000/auth/google'`).
    *   **`logout()` Method**: Create a public `logout()` method that does the same as `login()`, but for your backend's `/auth/logout` URL.

### **Step 5: Set Up a Basic App Layout and UI**

Now, let's create a simple toolbar that shows the user's status and login/logout buttons.

1.  **Import Modules**: Open `frontend/src/app/app.module.ts`. Find the `imports` array within the `@NgModule` decorator. Add `HttpClientModule` (for using the `HttpClient` you injected in your service) and the necessary Angular Material modules: `MatToolbarModule`, `MatButtonModule`, and `MatIconModule`.
2.  **Update the Main Component Logic**: Open `frontend/src/app/app.component.ts`.
    *   Inject your `AuthService` into the constructor.
    *   Create a public property named `user$` that is an `Observable<User | null>`.
    *   In the constructor, assign the `user$` observable from your `AuthService` to this component's `user$` property.
    *   Create public `login()` and `logout()` methods in the component that simply call the corresponding methods on your injected `authService` instance.
3.  **Update the Main Component HTML**: Open `frontend/src/app/app.component.html` and create the layout.
    *   Add a `<mat-toolbar>` element with `color="primary"`.
    *   Inside the toolbar, add a `<span>` for your app title and a spacer element (`<span class="spacer"></span>`).
    *   Use an `<ng-container>` with an `*ngIf` structural directive to check the `user$` observable (with an `async` pipe). If the user is `null`, display a "Login with Google" `<button>`.
    *   Use a second `<ng-container>` with `*ngIf` to check if `user$` has a value. If it does, display a welcome message like `<span>Hello, {{ user.displayName }}</span>` and a "Logout" button.
    *   Bind the `(click)` events of your login and logout buttons to the `login()` and `logout()` methods you created in the component's class.
    *   Finally, ensure you have a `<router-outlet>` tag after the toolbar to render your page content.

### **Step 6: Run and Test the Frontend**

1.  From the `frontend` directory, run the Angular development server:
    ```bash
    ng serve
    ```
2.  Open your browser and navigate to `http://localhost:4200`.
3.  You should see your toolbar. Click the "Login with Google" button. You should be redirected to Google, then back to your app, and the toolbar should now show "Hello, [Your Name]" and a logout button.

Congratulations! You now have a working frontend with a complete authentication flow. The next steps would be to create a protected "dashboard" page and use an Auth Guard to prevent access to it when logged out.