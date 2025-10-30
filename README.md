# TaskFlow - Team Task & Project Manager# TaskFlow - Team Task & Project Manager



A modern, full-featured Trello-style project management application built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, and Microsoft SQL Server.A modern, full-featured Trello-style project management application built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, and Microsoft SQL Server.



## Features## Getting Started



- 🔐 **Authentication**: Secure sign-up/sign-in with NextAuth.js, email verification, and password resetFirst, run the development server:

- 📋 **Project Management**: Create and manage multiple projects with team collaboration

- ✅ **Task Management**: Kanban-style board with drag-and-drop tasks (TODO, IN_PROGRESS, DONE)```bash

- 👥 **Team Collaboration**: Add team members, assign tasks, and manage permissionsnpm run dev

- 💬 **Comments & Activity**: Task comments and real-time activity tracking# or

- 📎 **File Attachments**: Upload and manage task attachmentsyarn dev

- 🔔 **Notifications**: Real-time notifications for task updates and mentions# or

- 👤 **User Profiles**: Customizable user profiles with avatar supportpnpm dev

- 📱 **Responsive Design**: Modern UI that works on desktop and mobile# or

bun dev

## Tech Stack```



- **Framework**: Next.js 15 (App Router)Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- **Language**: TypeScript

- **Database**: Microsoft SQL Server with Prisma ORMYou can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

- **Authentication**: NextAuth.js v5

- **Styling**: Tailwind CSSThis project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

- **UI Components**: shadcn/ui

- **Icons**: Lucide React## Learn More

- **Notifications**: Sonner

To learn more about Next.js, take a look at the following resources:

## Prerequisites

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

- Node.js 18+ - [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

- pnpm (or npm/yarn)

- Microsoft SQL ServerYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!



## Installation## Deploy on Vercel



1. Clone the repository:The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

```bash

git clone https://github.com/Hassan1910/taskflow.gitCheck out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

cd taskflow
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
DATABASE_URL="sqlserver://localhost:1433;database=taskflow;user=your_user;password=your_password;encrypt=true;trustServerCertificate=true"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="noreply@example.com"
```

4. Set up the database:
```bash
pnpm prisma generate
pnpm prisma db push
```

5. Run the development server:
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

The application uses the following main models:
- User (with authentication and profile)
- Project (with team members)
- Task (with status, priority, and assignments)
- Comment (task discussions)
- Attachment (file uploads)
- Activity (audit trail)
- Notification (user notifications)

## Project Structure

```
taskflow/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── profile/           # User profile
│   └── projects/          # Project boards
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── project/           # Project/task components
│   ├── notifications/     # Notification components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
├── prisma/                # Database schema
└── types/                 # TypeScript type definitions
```

## API Routes

- `/api/auth/*` - Authentication endpoints
- `/api/projects` - Project CRUD operations
- `/api/tasks` - Task management
- `/api/comments` - Task comments
- `/api/attachments` - File uploads
- `/api/members` - Team member management
- `/api/notifications` - User notifications
- `/api/activities` - Activity logs
- `/api/profile` - User profile management

## Development

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run database migrations
pnpm prisma migrate dev

# Open Prisma Studio
pnpm prisma studio
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build the application:
```bash
pnpm build
```

The application can be deployed to any platform that supports Next.js applications.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
