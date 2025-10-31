'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Shop {
  id: string;
  name: string;
  description: string | null;
  menuItems: Array<{ id: string }>;
}

export default function DashboardPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [stats, setStats] = useState({ totalShops: 0, totalMenuItems: 0 });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
        async function fetchData() {
        try {
          const { getUser } = await import('@/lib/auth');
          const [shopsResponse, menuResponse] = await Promise.all([
            api.get('/shops'),
            api.get('/menu-items'),
          ]);

          if (shopsResponse.data.success) {
            const user = getUser();
            const userShops = shopsResponse.data.data.filter(
              (shop: any) => shop.owner?.id === user?.id
            );
            setShops(userShops);
            setStats({
              totalShops: userShops.length,
              totalMenuItems: userShops.reduce(
                (acc: number, shop: Shop) => acc + shop.menuItems.length,
                0
              ),
            });
          }
        } catch (error) {
          console.error('Failed to fetch data:', error);
        }
      }
      fetchData();
    }
  }, [isAuthenticated]);

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white px-4 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="h-0.5 w-6 sm:w-8 md:w-10 bg-gradient-to-r from-transparent to-green-500 rounded-full"></div>
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500"></div>
              <div className="h-0.5 w-6 sm:w-8 md:w-10 bg-gradient-to-l from-transparent to-green-500 rounded-full"></div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <div className="hidden sm:flex items-center gap-1.5">
              <div className="h-0.5 w-6 sm:w-8 md:w-10 bg-gradient-to-l from-transparent to-green-500 rounded-full"></div>
              <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500"></div>
              <div className="h-0.5 w-6 sm:w-8 md:w-10 bg-gradient-to-r from-transparent to-green-500 rounded-full"></div>
            </div>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your shops and menu items
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="border-2 border-green-100 dark:border-green-900/50">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-400">Total Shops</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalShops}</div>
            </CardContent>
          </Card>
          <Card className="border-2 border-green-100 dark:border-green-900/50">
            <CardHeader>
              <CardTitle className="text-green-700 dark:text-green-400">Total Menu Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.totalMenuItems}</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex gap-4">
          <Link href="/dashboard/shops">
            <Button>Manage Shops</Button>
          </Link>
          <Link href="/dashboard/menu">
            <Button variant="outline">Manage Menu Items</Button>
          </Link>
        </div>

        {/* Recent Shops */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
            Your Shops
          </h2>
          {shops.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  You don't have any shops yet.
                </p>
                <Link href="/dashboard/shops">
                  <Button>Create Your First Shop</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shops.slice(0, 6).map((shop, index) => (
                <Link 
                  key={shop.id} 
                  href={`/dashboard/shops/${shop.id}`}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:border-green-400 dark:hover:border-green-600 cursor-pointer group overflow-hidden relative bg-gradient-to-br from-white to-green-50/50 dark:from-gray-950 dark:to-green-950/20">
                    {/* Animated gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:via-green-500/3 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
                    
                    <CardHeader className="relative z-10">
                      <CardTitle className="group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors text-xl">
                        {shop.name}
                      </CardTitle>
                      {shop.description && (
                        <CardDescription className="line-clamp-2">{shop.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                          {shop.menuItems.length} menu item{shop.menuItems.length !== 1 ? 's' : ''}
                        </p>
                        <span className="text-green-600 group-hover:translate-x-1 transition-transform inline-block">→</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

