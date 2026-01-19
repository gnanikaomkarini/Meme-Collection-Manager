# Meme Collection Manager - Project Setup (MEAN Stack)

This document provides the necessary steps to set up and run the Meme Collection Manager application on your local machine.

## 1. Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Node.js and npm:** Required for both backend and frontend. You can check if they are installed by running:
    ```bash
    node -v
    npm -v
    ```
    If not installed, download them from [nodejs.org](https://nodejs.org/).

*   **MongoDB:** The database for our application. You need to install it and have it running as a service.
    *   Follow the official installation guide for your operating system: [Install MongoDB](https://docs.mongodb.com/manual/installation/)

*   **Angular CLI:** The command-line interface for Angular. This will be installed in the next step.

## 2. Installation

1.  **Clone the Repository:**
    ```bash
    # (Instructions to be added once the repository is available)
    ```

2.  **Install Backend Dependencies:**
    Navigate to the `server` directory and run:
    ```bash
    npm install
    ```

3.  **Install Frontend Dependencies:**
    Navigate to the `client` directory (which will be created later) and run:
    ```bash
    npm install
    ```

## 3. Running the Application

1.  **Start the MongoDB Service:**
    Ensure that the MongoDB service is running.

2.  **Start the Backend Server:**
    In the `server` directory, run:
    ```bash
    npm start
    ```
    The server will typically run on `http://localhost:3000`.

3.  **Start the Frontend Application:**
    In the `client` directory, run:
    ```bash
    ng serve
    ```
    The frontend will be available at `http://localhost:4200`.
