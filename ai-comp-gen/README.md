# Craftly — AI Component Generator

## Final Year Project Report / Overview

**Project By:** Suraj & Durgesh

Craftly is an AI-powered web application designed to help developers and designers quickly generate complete UI components using natural language prompts. By leveraging the power of Google's Gemini API, users can describe the component they need, select their preferred framework (e.g., HTML + CSS, React + Tailwind), and instantly receive functional, styled, and responsive code.

### 🚀 Key Features

*   **AI-Driven Code Generation:** Generate complex UI components simply by describing them.
*   **Multiple Framework Support:** Generate code for plain HTML/CSS, React, Tailwind CSS, Bootstrap, and more.
*   **Live Preview:** Instantly visualize the generated component in an integrated iframe preview.
*   **Built-in Code Editor:** Edit and tweak the generated code using the Monaco Editor (the same editor powering VS Code).
*   **User Authentication:** Secure signup and login functionality.
*   **History Tracking:** Save and revisit previously generated components (requires login).
*   **Export & Copy:** Easily copy the generated code to the clipboard or download it as an `.html` file.
*   **Dark/Light Mode:** Seamlessly switch between themes for a comfortable development experience.

### 🛠️ Technology Stack

*   **Frontend Library:** React.js (via Vite)
*   **Styling:** Tailwind CSS + Vanilla CSS
*   **AI Integration:** Google GenAI (Gemini 2.5 Flash)
*   **Code Editor:** `@monaco-editor/react`
*   **Routing:** React Router DOM
*   **Icons:** `react-icons`
*   **Animations:** Framer Motion

### ⚙️ Getting Started

Follow these steps to run the project locally.

#### Prerequisites

*   Node.js (v18 or higher recommended)
*   npm (Node Package Manager)
*   A Google Gemini API Key

#### Installation and Setup

1.  **Clone the Repository (or navigate to the project folder):**
    ```bash
    cd ai-comp-gen
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add your Google Gemini API Key:
    ```env
    VITE_GOOGLE_API_KEY=your_actual_api_key_here
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

5.  **Open in Browser:**
    Navigate to the local URL provided in the terminal (usually `http://localhost:5173/`).

### 📝 Project Goals & Learning Outcomes

This project was developed as part of our final year curriculum to demonstrate proficiency in modern web development practices, integrating third-party AI APIs, and managing complex application state within a React ecosystem.
