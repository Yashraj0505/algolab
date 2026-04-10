# Clarify - Algorithm Visualizer

Clarify is a comprehensive, modern web-based Algorithm Visualizer with a professional SaaS-style UI. It is designed to help users understand complex data structures and algorithms through interactive visualizations, real-time code execution tracking, and AI-powered explanations.

## 🚀 Features

- **Interactive Algorithm Visualizations**
  - **Sorting Algorithms:** Merge Sort, Quick Sort, Bubble Sort.
  - **Searching Algorithms:** Binary Search.
  - **Data Structures:** Binary Search Tree (Insert, Delete, Search, Traversals - BFS & DFS).
  - **Dynamic Programming:** Longest Common Subsequence (LCS).
- **Real-Time Code Execution Tracking:** Highlights the active line of code being executed as the algorithm runs.
- **AI-Powered Explanations:** Integrated AI Panel (powered by Groq) to explain algorithm mechanics and provide context.
- **Performance Metrics:** Real-time metrics for algorithm efficiency and steps.
- **Modern UI:** Built with React, TailwindCSS, and Framer Motion for smooth, dynamic animations.

## 🛠️ Technology Stack

- **Frontend:**
  - React 19 / Vite
  - TailwindCSS 4
  - Framer Motion (for animations)
- **Backend:**
  - Node.js / Express
  - Groq SDK (AI Integration)
  - CORS & dotenv

## 📁 Project Structure

```
algolab/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── algorithms/     # Logic for various algorithms (BST, Sorting, LCS, etc.)
│   │   ├── components/     # UI Components (Visualizer, Controls, AiPanel, etc.)
│   │   ├── pages/          # Main application pages
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Application entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express Backend
│   ├── routes/             # API routes (e.g., aiRoutes.js)
│   ├── controllers/        # Route controllers
│   ├── services/           # Backend services
│   ├── server.js           # Server entry point
│   └── package.json
└── README.md
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Groq API Key (for the AI integration)

### Running the Backend

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory and add your Groq API key:
   ```env
   GROQ_API_KEY=your_api_key_here
   PORT=5000
   ```
4. Start the server (development mode):
   ```bash
   npm run dev
   ```

### Running the Frontend

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🤝 Contribution Guidelines
Check specific folders for more granular implementation details and run `eslint` configuration to maintain code standards.

## 📄 License
ISC License (as specified in `server/package.json`)
