'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MenuItemForm from '@/components/forms/MenuItemForm';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isVeg: boolean;
  imageUrl: string | null;
  shop: {
    id: string;
    name: string;
  };
}

export default function MenuItemManagementPage() {
  const params = useParams();
  const router = useRouter();
  const menuItemId = params.id as string;
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMenuItem();
    }
  }, [isAuthenticated, menuItemId]);

  async function fetchMenuItem() {
    try {
      setLoading(true);
      const response = await api.get(`/menu-items/${menuItemId}`);
      if (response.data.success) {
        setMenuItem(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch menu item:', error);
      router.push('/dashboard/menu');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await api.delete(`/menu-items/${menuItemId}`);
      router.push('/dashboard/menu');
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      alert('Failed to delete menu item. Please try again.');
    }
  }

  function handleFormSuccess() {
    setEditing(false);
    fetchMenuItem();
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !menuItem) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href={`/dashboard/menu`}>
            <Button variant="ghost">← Back to Menu Items</Button>
          </Link>
        </div>

        {editing ? (
          <MenuItemForm
            menuItemId={menuItem.id}
            shopId={menuItem.shop.id}
            initialData={{
              name: menuItem.name,
              description: menuItem.description || '',
              price: menuItem.price,
              isVeg: menuItem.isVeg,
              imageUrl: menuItem.imageUrl || '',
              shopId: menuItem.shop.id,
            }}
            onSuccess={handleFormSuccess}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <Card>
            {menuItem.imageUrl && (
              <div className="aspect-video w-full overflow-hidden rounded-t-xl">
                <img
                  src={menuItem.imageUrl}
                  alt={menuItem.name}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl">{menuItem.name}</CardTitle>
                  <CardDescription className="mt-2">
                    Shop: {menuItem.shop.name}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${menuItem.price.toFixed(2)}
                  </div>
                </div>
              </div>
              {menuItem.description && (
                <p className="text-gray-600 dark:text-gray-400">
                  {menuItem.description}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <span
                  className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${
                    menuItem.isVeg
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                  }`}
                >
                  {menuItem.isVeg ? '🥬 Vegetarian' : '🍖 Non-Veg'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditing(true)}>
                  Edit Item
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete Item
                </Button>
                <Link href={`/shops/${menuItem.shop.id}`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    View Public Menu
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

