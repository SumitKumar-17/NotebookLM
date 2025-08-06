# Take-Home Assignment: Google NotebookLM Clone

This project is a web-based application that enables users to upload PDF documents and interact with them through a chat interface. It leverages AI to extract relevant information efficiently, providing citations that link back to the source pages in the PDF.

## Tech Stack

* **Frontend:** Next.js ,TypeScript, Tailwind CSS
* **Backend:** Convex (Real-time Database, File Storage, and Serverless Functions)
* **AI/Embeddings:** Google Gemini 

## Step-by-Step Setup Guide

### 1. Backend Setup (Convex)

1.  **Sign Up & Create Project:** Go to [convex.dev](https://www.convex.dev/) and create a new project.
2.  **Install Convex CLI & Link Project:**
    ```bash
    npm install -g convex
    npx convex dev
    ```
    Follow the prompts. Keep this process running and note the deployment URL provided.
3.  **Get API Keys:**
    * **Gemini API Key:** Get from [Google AI Studio](https://aistudio.google.com/).
    
4.  **Set Environment Variables in Convex Dashboard:**
    * Navigate to **Settings -> Environment Variables** in your Convex project.
    * Add the following three secrets:
        * `GEMINI_API_KEY`: Your key from Google AI Studio.
        * `APP_URL`: Set to `http://localhost:3000` for development. You will update this later with your Vercel production URL.

### 2. Frontend Setup (Next.js)

1.  **Install Dependencies:** In the project root, run:
    ```bash
    npm install
    ```
2.  **Create Environment File:** Create a file named `.env.local` in the project root.
3.  **Add Convex URL:** Add your Convex deployment URL (from the `npx convex dev` command) to `.env.local`:
    ```
    NEXT_PUBLIC_CONVEX_URL=[https://your-project-name.convex.cloud](https://your-project-name.convex.cloud)
    ```
4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.
