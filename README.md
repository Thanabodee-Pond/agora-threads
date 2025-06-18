# Agora Threads

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Nest.js](https://img.shields.io/badge/Nest.js-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## 🚀 [Live Demo]([https://your-agora-threads-url.com]) 🚀

**[➡️ DEMO (Frontend Next.js)](https://youtu.be/SONtEk43acA)**
**[➡️ DEMO (Frontend Nestjs)](https://youtu.be/leIkWGZy5zM)**

**Agora Threads** is a full-stack discussion platform inspired by Reddit, built with a modern, decoupled architecture that cleanly separates the frontend and backend. The project emphasizes **end-to-end TypeScript** for robust, maintainable code and an excellent developer experience.

## 📸 Screenshots & Demo

| Main Feed                                          | Creating a Post                                  |
| -------------------------------------------------- | ------------------------------------------------ |
| ![Agora Threads Homepage](URL_TO_YOUR_HOMEPAGE_PNG) | ![Creating a Post GIF](URL_TO_YOUR_CREATE_POST_GIF) |

## ✨ Key Features

-   **Community Creation:** Users can create their own sub-forums (communities) for topics they are interested in.
-   **Nested Post & Comment System:** A complete system for creating posts and threaded comments.
-   **Voting System:** Users can upvote and downvote posts and comments.
-   **Secure Authentication:** Secure user registration and login system powered by NextAuth.js (with Google Provider support).
-   **Infinite Scrolling:** Seamlessly load more content as the user scrolls for a smooth user experience.
-   **End-to-End Type Safety:** Guarantees data integrity from the database all the way to the user's screen.

## 🏛️ Architecture Overview

This project uses a **Decoupled Architecture**:

-   **Frontend (Next.js):** Handles all UI/UX rendering and client-side state management, leveraging the Next.js App Router and React Server Components (RSC) for maximum performance.
-   **Backend (Nest.js):** A robust Headless API Server responsible for all business logic, database interactions, and security.
-   **Database (PostgreSQL & Redis):** Utilizes PostgreSQL as the primary database for structured data and Redis for high-performance caching of frequently accessed data, like vote counts.

## 🛠️ Technology Stack

<details>
<summary><strong>Click to view the full Tech Stack</strong></summary>

### Frontend (Client-side)

| Library / Framework        | Role                                                                    |
| -------------------------- | ----------------------------------------------------------------------- |
| **Next.js (App Router)** | Core React framework with SSR and RSC for high-performance web apps.    |
| **React** | A JavaScript library for building user interfaces.                        |
| **TypeScript** | Adds static type-checking to JavaScript.                                |
| **Tailwind CSS** | A utility-first CSS framework for rapid UI development.                 |
| **Shadcn/UI & Radix UI** | A collection of accessible, and highly customizable UI components.        |
| **TanStack Query** | Manages server state, caching, and data fetching efficiently.             |
| **React Hook Form & Zod** | Manages form state and provides client-side validation.                 |
| **NextAuth.js** | A complete open-source authentication solution for Next.js applications. |
| **Axios** | A promise-based HTTP client for making requests to the backend API.     |

### Backend (Server-side)

| Library / Framework     | Role                                                                |
| ----------------------- | ------------------------------------------------------------------- |
| **Nest.js** | A progressive Node.js framework for building efficient, scalable server-side applications. |
| **TypeScript** | The primary language for development.                                       |
| **Prisma** | A next-generation, type-safe ORM for Node.js and TypeScript.         |
| **Redis (Upstash)** | An in-memory database used for high-performance caching.                |
| **Zod** | Provides schema validation for API DTOs (Data Transfer Objects).      |
| **class-validator** | A decorator-based library for DTO validation that integrates with Nest.js. |

</details>

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

-   Node.js (v18.x or higher)
-   PNPM (recommended), NPM, or Yarn
-   Git
-   Docker (for running PostgreSQL and Redis databases) or a separate installation.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Thanabodee-Pond/agora-threads.git](https://github.com/Thanabodee-Pond/agora-threads.git)
    cd agora-threads
    ```

2.  **Set up Environment Variables:**
    Copy the `.env.example` file to create your own `.env` file.
    ```bash
    cp .env.example .env
    ```
    Then, open the `.env` file and fill in all the required values:
    ```env
    # Database URL (for Prisma)
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

    # Redis (from Upstash or a local instance)
    REDIS_URL="redis://..."
    REDIS_SECRET="..."

    # NextAuth.js
    # Generate a secret using `openssl rand -base64 32` in your terminal
    NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET"
    NEXTAUTH_URL="http://localhost:3000"

    # Google OAuth Credentials (from Google Cloud Console)
    GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
    GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
    ```

3.  **Install Dependencies:**
    ```bash
    pnpm install
    ```

4.  **Run Database Migration:**
    Use Prisma to generate database tables based on your schema.
    ```bash
    pnpm db:push # or npx prisma db push
    ```

5.  **Run the application:**
    This will start both the frontend and backend development servers.
    ```bash
    pnpm dev
    ```
    -   The application will be available at: `http://localhost:3000`

## 🧪 Testing

This project prioritizes software quality through automated testing.

-   **Unit & Integration Tests:** We use `Jest` and `React Testing Library` to test logic and components.
-   **End-to-End Tests:** We use `Playwright` to simulate and validate real user flows.

**To run all tests:**
```bash
pnpm test
```

## ⚙️ Code Quality & Automation

We use a suite of tools to maintain high and consistent code quality:

-   **ESLint & Prettier:** For code linting and formatting.
-   **Husky & lint-staged:** To automatically lint and format code before each commit.
-   **GitHub Actions (CI/CD):** Every pull request is automatically checked (Linting, Testing) to ensure code integrity before merging.

## 🔗 API Endpoint Documentation

<details>
<summary><strong>Click to view main API Endpoints</strong></summary>

| Endpoint                             | Method  | Protected? | Description                               |
| ------------------------------------ | ------- | :--------: | ----------------------------------------- |
| `GET /api/community`                 | `GET`   |     No     | Fetches all communities.                  |
| `POST /api/community`                | `POST`  |    Yes     | Creates a new community.                  |
| `GET /api/posts`                     | `GET`   |     No     | Fetches all posts for the main feed.      |
| `POST /api/community/subscribe/{id}` | `POST`  |    Yes     | Subscribes/unsubscribes from a community. |
| `POST /api/post/comment`             | `POST`  |    Yes     | Creates a new comment on a post.          |
| `PATCH /api/post/vote`               | `PATCH` |    Yes     | Casts a vote on a post.                   |

</details>

## 🗺️ Future Roadmap

-   [ ] User Profiles
-   [ ] Real-time Notifications
-   [ ] Direct Messaging
-   [ ] Ability to edit posts and comments
-   [ ] Deployment to a Production Environment

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  **Fork** the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a **Pull Request**

## 📄 License

Distributed under the MIT License. See `LICENSE.txt` for more information.
