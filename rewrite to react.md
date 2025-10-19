# Plan for Rewriting the Project to React

This document outlines a comprehensive plan to rewrite the existing project into a modern React web application, replicating all current features.

## 1. Project Overview & Analysis

The current project appears to be a **React Native** mobile application with the following key components:

*   **Frontend:** Built with React Native.
*   **Backend/Web3:** Integration with the Hedera Hashgraph network using `@hashgraph/sdk`.
*   **Deployment:** Potentially deployed to Vercel, suggesting a web component or serverless functions might already exist.
*   **Configuration:** Uses `dotenv` for environment variables.

**Objective:** Create a new, standalone **React web application** that mirrors the functionality of the mobile app, and establish a clear plan for the backend and database.

---

## 2. High-Level Plan & Folder Structure

We will create a new folder for the React project to keep it separate from the original.

```
chai-project/
├── new-react-webapp/      <-- New React project folder
│   ├── public/
│   ├── src/
│   │   ├── api/           <-- For backend communication
│   │   ├── components/    <-- Reusable UI components
│   │   ├── hooks/         <-- Custom React hooks
│   │   ├── pages/         <-- Main pages of the app
│   │   ├── services/      <-- Business logic (e.g., Hedera service)
│   │   ├── styles/
│   │   └── App.js
│   ├── .env
│   ├── package.json
│   └── ...
└── ... (original project files)
```

---

## 3. Phase-by-Phase Implementation

### Phase 1: Setup and Foundation

1.  **Initialize New React Project:**
    *   Use a modern tool like Vite or Create React App to set up the project.
        ```bash
        # Using Vite (recommended for speed)
        npm create vite@latest new-react-webapp -- --template react-ts
        ```
    *   This provides a fast development server and an optimized build process.

2.  **Basic Structure and Tooling:**
    *   Set up the folder structure as outlined above.
    *   Install essential libraries: `react-router-dom` for navigation, and a styling solution (e.g., Tailwind CSS, Styled Components, or Material-UI).
    *   Set up ESLint and Prettier for code quality and consistency.

3.  **Environment Variables:**
    *   Create a `.env` file in the root of `new-react-webapp`.
    *   Identify all environment variables from the original project (e.g., API keys, Hedera account info) and add them to the new `.env` file, prefixed as required by the framework (e.g., `VITE_` for Vite).

### Phase 2: Backend and Database Strategy

The current project interacts with Hedera. A web app cannot do this securely from the client-side alone.

1.  **Choose a Backend Framework:**
    *   **Node.js with Express/Fastify:** A solid choice if you are comfortable with JavaScript/TypeScript. It's versatile and has a large ecosystem.
    *   **Next.js (React Framework with Backend):** Provides API routes out-of-the-box. This is a great option if you want to keep your frontend and backend in the same project and language.
    *   **Other options:** Python (Django/Flask), Go, etc., depending on team expertise.

2.  **Design API Endpoints:**
    *   List all actions the mobile app performs (e.g., `login`, `fetchData`, `submitTransaction`).
    *   Create corresponding API endpoints for each action (e.g., `POST /api/login`, `GET /api/data`, `POST /api/hedera/transaction`).
    *   The backend will securely hold credentials and interact with the Hedera SDK. **Never expose private keys to the frontend.**

3.  **Database Selection:**
    *   If the app needs to store user data, session information, or transaction history, a database is required.
    *   **SQL (e.g., PostgreSQL):** Good for structured data, relational integrity.
    *   **NoSQL (e.g., MongoDB, Firebase Firestore):** Flexible, good for unstructured or rapidly changing data.
    *   Choose based on the complexity of your data model.

### Phase 3: Frontend Feature Replication

This is where we rebuild the user-facing parts of the application.

1.  **Component Inventory:**
    *   Go through every screen of the React Native app.
    *   List all UI components: buttons, forms, lists, cards, navigation bars, etc.

2.  **Rebuild UI Components in React:**
    *   Translate React Native components (`<View>`, `<Text>`, `<TouchableOpacity>`) to their web equivalents (`<div>`, `<span>`, `<button>`).
    *   Create a reusable component library in `src/components`.

3.  **Implement Routing:**
    *   Use `react-router-dom` to define routes for each page/screen (e.g., `/`, `/dashboard`, `/profile`).

4.  **State Management:**
    *   For simple state, use React's built-in `useState` and `useContext`.
    *   For complex global state (e.g., user authentication status, shared data across pages), consider a state management library like **Zustand**, **Redux Toolkit**, or **Jotai**.

5.  **Connect to Backend:**
    *   Use a data-fetching library like **React Query** or **SWR** (or `fetch`/`axios`) in the `src/api` or `src/hooks` directory to communicate with the backend API endpoints created in Phase 2.

### Phase 4: Hedera Integration (Backend)

1.  **Re-implement Hedera Logic:**
    *   Move all logic using `@hashgraph/sdk` from the mobile app to your new backend service.
    *   Create service modules (e.g., `hederaService.js`) that handle creating clients, signing transactions, and querying the network.
    *   Expose this functionality through the secure API endpoints.

### Phase 5: Testing and Deployment

1.  **Testing:**
    *   **Unit Tests (Jest/Vitest):** Test individual functions and components.
    *   **Integration Tests:** Test how components work together.
    *   **End-to-End (E2E) Tests (Cypress/Playwright):** Simulate user flows from start to finish.

2.  **Deployment:**
    *   **Frontend:** Deploy the static React app to a service like **Vercel**, Netlify, or AWS S3/CloudFront. The `.vercelignore` file suggests Vercel is a familiar choice.
    *   **Backend:** Deploy the backend API to a service like Vercel (as serverless functions), Heroku, AWS Lambda, or a traditional server.