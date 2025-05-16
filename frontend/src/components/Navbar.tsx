import Link from 'next/link';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { LOGOUT } from '@/graphql/Auth';
import { useMutation } from '@apollo/client';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [logoutSession] = useMutation(LOGOUT);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignInWithGoogle = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL as string;
    window.location.href = url;
  }, []);

  const handleLogout = async () => {
    try {
      await logoutSession();
      logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  return (
    <nav className="bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                CueCal
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {isAuthenticated && (
              <>
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="bg-gray-800 flex text-sm rounded-full focus:outline-none"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white text-sm">
                        {user?.name?.[0] || 'U'}
                      </span>
                    </div>
                  </button>

                  {showProfileMenu && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-40">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            {!isAuthenticated && (
              <button
                onClick={handleSignInWithGoogle}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary"
              >
                Sign up
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;