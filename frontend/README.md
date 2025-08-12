# DropAws Frontend

A modern, responsive file management frontend built with Next.js 15, TypeScript, and Tailwind CSS.

## Features

- **Authentication**: Firebase Authentication with email/password
- **File Management**: Upload, organize, search, and manage files
- **Drag & Drop**: Intuitive drag and drop file upload
- **Responsive Design**: Works seamlessly across desktop and mobile
- **Real-time Updates**: Live updates using Firebase Firestore
- **Cloud Storage**: Integration with AWS S3 for file storage
- **Modern UI**: Clean interface with smooth animations

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: AWS S3
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Components**: Headless UI

## Color Palette

- **Primary Purple**: `#9929EA`
- **Primary Pink**: `#CC66DA`
- **Primary Yellow**: `#FAEB92`
- **Primary Black**: `#000000`

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication and Firestore enabled
- AWS S3 bucket for file storage

### Environment Setup

1. Copy the environment template:
```bash
cp .env.local.example .env.local
```

2. Fill in your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

3. Add your AWS credentials:
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
```

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── auth/              # Authentication components
│   ├── FileUpload.tsx     # File upload component
│   ├── FileGrid.tsx       # File display grid
│   ├── DashboardLayout.tsx # Main dashboard layout
│   ├── SearchBar.tsx      # Search functionality
│   └── Breadcrumb.tsx     # Navigation breadcrumbs
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Authentication state
│   └── FileContext.tsx    # File management state
├── lib/                   # Utility libraries
│   ├── firebase.ts        # Firebase configuration
│   ├── aws.ts            # AWS S3 configuration
│   └── utils.ts          # Helper functions
└── types/                 # TypeScript type definitions
    └── index.ts
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Deployment

The application can be deployed to Vercel, Netlify, or any static hosting service.

## License

This project is licensed under the MIT License.
