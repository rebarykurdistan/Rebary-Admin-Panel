import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { AuthProvider } from '../hooks/useAuth';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Rebary Admin Panel',
  description: 'Admin control panel for Rebary services',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#7FB800',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#E81D23',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
