# DropAws - Cloud File Management System

A modern, secure file management system with cloud storage capabilities, built with Next.js and AWS S3.

## 🚀 Features

- **Secure Authentication**: Firebase Authentication with email/password
- **Cloud Storage**: AWS S3 integration for reliable file storage
- **Modern UI**: Responsive design with smooth animations
- **File Management**: Upload, organize, search, and manage files
- **Drag & Drop**: Intuitive file upload interface
- **Real-time Updates**: Live updates using Firebase Firestore
- **Mobile-Friendly**: Works seamlessly across all devices

## 🎨 Design

The application features a modern, futuristic design with a custom color palette:
- **Primary Purple**: #9929EA
- **Primary Pink**: #CC66DA  
- **Primary Yellow**: #FAEB92
- **Primary Black**: #000000

## 🏗️ Project Structure

```
DropAws/
├── .github/
│   └── instructions/
│       └── context.instructions.md
├── frontend/                 # Next.js Frontend Application
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # React Components
│   │   ├── contexts/        # React Contexts
│   │   ├── lib/            # Utility Libraries
│   │   └── types/          # TypeScript Definitions
│   ├── public/             # Static Assets
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Components**: Headless UI

### Backend Services
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: AWS S3
- **Hosting**: Vercel (recommended)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Authentication and Firestore
- AWS S3 bucket for file storage

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GunjanSarkar/dropAws.git
   cd dropAws
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Fill in your Firebase and AWS credentials in `.env.local`

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Environment Configuration

Create a `.env.local` file in the frontend directory with the following variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_s3_bucket_name
```

## 🔐 Security

- All sensitive credentials are stored in environment variables
- Frontend code does not expose AWS or Firebase secrets
- Firebase security rules protect user data
- S3 bucket policies ensure secure file access

## 🚀 Deployment

### Frontend (Vercel - Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Alternative Hosting Options
- Netlify
- AWS Amplify
- Any static hosting service

## 📱 Features in Detail

### Authentication
- Email/password login
- Secure session management
- User profile management

### File Management
- Drag and drop file upload
- File organization with folders
- Search and filter capabilities
- File preview and download
- Bulk operations

### User Interface
- Responsive design for all screen sizes
- Smooth animations and transitions
- Accessibility features
- Dark mode ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help setting up the project, please open an issue in the GitHub repository.

## 🔗 Links

- [Live Demo](https://your-demo-url.vercel.app) (Coming Soon)
- [Documentation](./frontend/README.md)
- [Issues](https://github.com/GunjanSarkar/dropAws/issues)

---

Built with ❤️ by [Gunjan Sarkar](https://github.com/GunjanSarkar)
