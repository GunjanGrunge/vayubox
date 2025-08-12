import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/SimpleAuthContext";
import { FileProvider } from "@/contexts/SimpleFileContext";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Vayubox - Cloud File Management",
  description: "Secure file storage and management in the cloud",
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <FileProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#000000',
                  color: '#FAEB92',
                  border: '1px solid #9929EA',
                },
                success: {
                  style: {
                    background: '#000000',
                    color: '#FAEB92',
                    border: '1px solid #9929EA',
                  },
                },
                error: {
                  style: {
                    background: '#000000',
                    color: '#CC66DA',
                    border: '1px solid #9929EA',
                  },
                },
              }}
            />
          </FileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
