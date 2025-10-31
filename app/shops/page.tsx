'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Shop {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  imageUrl: string | null;
  qrCodeUrl: string | null;
  owner: {
    name: string;
    email: string;
  };
  menuItems: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchShops() {
      try {
        const response = await api.get('/shops');
        if (response.data.success) {
          setShops(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch shops:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchShops();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-lg">Loading shops...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white px-4 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8 px-4">
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="h-0.5 w-8 sm:w-12 bg-gradient-to-r from-transparent to-green-500 rounded-full"></div>
            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-500"></div>
            <div className="h-0.5 w-8 sm:w-12 bg-gradient-to-l from-transparent to-green-500 rounded-full"></div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white text-center">
            Browse Shops
          </h1>
          <div className="hidden sm:flex items-center gap-1.5">
            <div className="h-0.5 w-8 sm:w-12 bg-gradient-to-l from-transparent to-green-500 rounded-full"></div>
            <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full bg-green-500"></div>
            <div className="h-0.5 w-8 sm:w-12 bg-gradient-to-r from-transparent to-green-500 rounded-full"></div>
          </div>
        </div>
        
        {shops.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No shops available yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop, index) => (
              <Link 
                key={shop.id} 
                href={`/shops/${shop.id}`}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:border-green-400 dark:hover:border-green-600 cursor-pointer group overflow-hidden relative bg-gradient-to-br from-white to-green-50/50 dark:from-gray-950 dark:to-green-950/20">
                  {/* Decorative gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:via-green-500/3 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
                  
                  {shop.imageUrl ? (
                    <div className="aspect-video w-full overflow-hidden rounded-t-xl relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 group-hover:from-black/30 transition-all duration-300" />
                      <img
                        src={shop.imageUrl}
                        alt={shop.name}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <span className="text-white text-6xl opacity-80">🍽️</span>
                    </div>
                  )}
                  
                  <CardHeader className="relative z-10">
                    <CardTitle className="group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors text-xl">
                      {shop.name}
                    </CardTitle>
                    {shop.description && (
                      <CardDescription className="line-clamp-2">{shop.description}</CardDescription>
                    )}
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    {shop.location && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-1">
                        <span className="text-green-600">📍</span>
                        <span>{shop.location}</span>
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                        {shop.menuItems.length} item{shop.menuItems.length !== 1 ? 's' : ''}
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
  );
}

