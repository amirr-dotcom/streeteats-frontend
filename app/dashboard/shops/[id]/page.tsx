'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ShopForm from '@/components/forms/ShopForm';

interface Shop {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  imageUrl: string | null;
  qrCodeUrl: string | null;
  owner: {
    id: string;
  };
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  isVeg: boolean;
}

export default function ShopManagementPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, shopId]);

  async function fetchData() {
    try {
      setLoading(true);
      const [shopResponse, menuResponse] = await Promise.all([
        api.get(`/shops/${shopId}`),
        api.get(`/menu-items?shopId=${shopId}`),
      ]);

      if (shopResponse.data.success) {
        setShop(shopResponse.data.data);
      }
      if (menuResponse.data.success) {
        setMenuItems(menuResponse.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      router.push('/dashboard/shops');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this shop? This will also delete all menu items.')) return;

    try {
      await api.delete(`/shops/${shopId}`);
      router.push('/dashboard/shops');
    } catch (error) {
      console.error('Failed to delete shop:', error);
      alert('Failed to delete shop. Please try again.');
    }
  }

  function handleFormSuccess() {
    setEditing(false);
    fetchData();
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !shop) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href="/dashboard/shops">
            <Button variant="ghost">← Back to Shops</Button>
          </Link>
        </div>

        {editing ? (
          <ShopForm
            shopId={shop.id}
            initialData={{
              name: shop.name,
              description: shop.description || '',
              location: shop.location || '',
              imageUrl: shop.imageUrl || '',
              qrCodeUrl: shop.qrCodeUrl || '',
            }}
            onSuccess={handleFormSuccess}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <div className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {shop.name}
                </h1>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setEditing(true)}>
                    Edit Shop
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete Shop
                  </Button>
                </div>
              </div>

              {shop.imageUrl && (
                <div className="mb-4 aspect-video w-full overflow-hidden rounded-xl">
                  <img
                    src={shop.imageUrl}
                    alt={shop.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              {shop.description && (
                <p className="mb-2 text-lg text-gray-600 dark:text-gray-400">
                  {shop.description}
                </p>
              )}
              {shop.location && (
                <p className="text-gray-600 dark:text-gray-400">
                  📍 {shop.location}
                </p>
              )}
              {shop.qrCodeUrl && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">QR Code:</p>
                  <img src={shop.qrCodeUrl} alt="QR Code" className="h-32 w-32" />
                </div>
              )}
            </div>

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Menu Items ({menuItems.length})
              </h2>
              <Link href={`/dashboard/menu?shopId=${shopId}`}>
                <Button>Add Menu Item</Button>
              </Link>
            </div>

            {menuItems.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="mb-4 text-gray-600 dark:text-gray-400">
                    No menu items yet.
                  </p>
                  <Link href={`/dashboard/menu?shopId=${shopId}`}>
                    <Button>Add Your First Menu Item</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {menuItems.map((item) => (
                  <Link key={item.id} href={`/dashboard/menu/${item.id}`}>
                    <Card className="h-full transition-shadow hover:shadow-lg cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle>{item.name}</CardTitle>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                            item.isVeg
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                          }`}
                        >
                          {item.isVeg ? '🥬 Vegetarian' : '🍖 Non-Veg'}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

