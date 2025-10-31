'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  menuItems: Array<{ id: string }>;
  owner: {
    id: string;
  };
}

export default function ShopsManagementPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchShops();
    }
  }, [isAuthenticated]);

  async function fetchShops() {
    try {
      setLoading(true);
      const { getUser } = await import('@/lib/auth');
      const response = await api.get('/shops');
      if (response.data.success) {
        const user = getUser();
        const userShops = response.data.data.filter(
          (shop: Shop) => shop.owner?.id === user?.id
        );
        setShops(userShops);
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(shopId: string) {
    if (!confirm('Are you sure you want to delete this shop?')) return;

    try {
      await api.delete(`/shops/${shopId}`);
      fetchShops();
    } catch (error) {
      console.error('Failed to delete shop:', error);
      alert('Failed to delete shop. Please try again.');
    }
  }

  function handleEdit(shop: Shop) {
    setEditingShop(shop);
    setShowForm(true);
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingShop(null);
    fetchShops();
  }

  function handleCancel() {
    setShowForm(false);
    setEditingShop(null);
  }

  if (authLoading || loading) {
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
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Manage Shops
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create and manage your food shops
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>Create New Shop</Button>
          )}
        </div>

        {showForm && (
          <div className="mb-8">
            <ShopForm
              shopId={editingShop?.id}
              initialData={editingShop ? {
                id: editingShop.id,
                name: editingShop.name,
                description: editingShop.description || '',
                location: editingShop.location || '',
                imageUrl: editingShop.imageUrl || '',
                qrCodeUrl: editingShop.qrCodeUrl || '',
              } : undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}

        {shops.length === 0 && !showForm ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                You don't have any shops yet.
              </p>
              <Button onClick={() => setShowForm(true)}>Create Your First Shop</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop, index) => (
              <Card 
                key={shop.id}
                className="h-full transition-all duration-300 hover:shadow-2xl hover:border-green-400 dark:hover:border-green-600 group overflow-hidden relative bg-gradient-to-br from-white to-green-50/50 dark:from-gray-950 dark:to-green-950/20 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Animated gradient overlay */}
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
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <span className="text-green-600">📍</span>
                      <span>{shop.location}</span>
                    </p>
                  )}
                  <p className="mb-4 text-sm font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full inline-block">
                    {shop.menuItems.length} menu item{shop.menuItems.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/dashboard/shops/${shop.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Manage
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(shop)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(shop.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

