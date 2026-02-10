# Notes Summariser & RBAC Dashboard

A production-ready dashboard application built with Next.js, Neon DB (PostgreSQL), and Tailwind CSS.

## Features

- **Authentication**: Sign up and Log in using JWT-based auth (httpOnly cookies).
- **RBAC**: Role-based access control for `admin` and `user` roles.
- **Approval Workflow**: New users are `pending` by default and must be approved by an admin.
- **Dashboards**:
  - **Admin**: View all users, approve/reject users.
  - **User**: Protected dashboard for approved users.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes, `jose` (JWT), `bcryptjs`
- **Database**: PostgreSQL (Neon DB), `pg` driver

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd deep-celestial
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   JWT_SECRET=your_super_secure_secret_key_at_least_32_chars_long
   ```

4. Set up the Database:
   Run the setup script to create the tables:
   ```bash
   node scripts/setup-db.js
   ```

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deployment (Vercel)

1. Push your code to GitHub.
2. Import the project in Vercel.
3. Add the Environment Variables (`DATABASE_URL`, `JWT_SECRET`) in Vercel project settings.
4. Deploy!

## License

MIT
