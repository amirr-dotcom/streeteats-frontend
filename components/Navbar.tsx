'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  
  // Check if we're on a shop detail page (/shops/[id])
  const isShopDetailPage = pathname?.startsWith('/shops/') && pathname !== '/shops';
  
  // On shop detail page, only show navigation if user is logged in (vendor/admin)
  // Customers viewing shop menus should not see Browse Shops or Login/Signup
  const shouldShowNavigation = isAuthenticated || !isShopDetailPage;

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🍃</span>
            <Link href="/" className="text-xl font-bold text-green-700 dark:text-green-400">
              StreetEats
            </Link>
          </div>
          
          {shouldShowNavigation && (
            <div className="flex items-center gap-4">
              <Link
                href="/shops"
                className="text-sm font-medium text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors"
              >
                Browse Shops
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {user?.name}
                  </span>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

