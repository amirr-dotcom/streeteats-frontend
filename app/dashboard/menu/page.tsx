'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function MenuManagementContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const shopId = searchParams.get('shopId');
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [filterShopId, setFilterShopId] = useState<string | null>(shopId);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMenuItems();
    }
  }, [isAuthenticated, filterShopId]);

  async function fetchMenuItems() {
    try {
      setLoading(true);
      const params = filterShopId ? { shopId: filterShopId } : {};
      const response = await api.get('/menu-items', { params });
      if (response.data.success) {
        setMenuItems(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await api.delete(`/menu-items/${itemId}`);
      fetchMenuItems();
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      alert('Failed to delete menu item. Please try again.');
    }
  }

  function handleEdit(item: MenuItem) {
    setEditingItem(item);
    setShowForm(true);
  }

  function handleFormSuccess() {
    setShowForm(false);
    setEditingItem(null);
    fetchMenuItems();
  }

  function handleCancel() {
    setShowForm(false);
    setEditingItem(null);
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

  const filteredItems = filterShopId
    ? menuItems
    : menuItems;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Manage Menu Items
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Create and manage your menu items
            </p>
          </div>
          {!showForm && (
            <Button onClick={() => setShowForm(true)}>Create New Item</Button>
          )}
        </div>

        {showForm && (
          <div className="mb-8">
            <MenuItemForm
              menuItemId={editingItem?.id}
              shopId={shopId || editingItem?.shop.id || undefined}
              initialData={editingItem ? {
                id: editingItem.id,
                name: editingItem.name,
                description: editingItem.description || '',
                price: editingItem.price,
                isVeg: editingItem.isVeg,
                imageUrl: editingItem.imageUrl || '',
                shopId: editingItem.shop.id,
              } : undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}

        {filteredItems.length === 0 && !showForm ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                You don't have any menu items yet.
              </p>
              <Button onClick={() => setShowForm(true)}>Create Your First Menu Item</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item, index) => (
              <Card 
                key={item.id}
                className="h-full transition-all duration-300 hover:shadow-2xl hover:border-green-400 dark:hover:border-green-600 group overflow-hidden relative bg-gradient-to-br from-white to-green-50/50 dark:from-gray-950 dark:to-green-950/20 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/0 to-green-500/0 group-hover:from-green-500/5 group-hover:via-green-500/3 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
                
                {item.imageUrl ? (
                  <div className="aspect-video w-full overflow-hidden rounded-t-xl relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-10 group-hover:from-black/30 transition-all duration-300" />
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <span className="text-white text-6xl opacity-80">🍽️</span>
                  </div>
                )}
                
                <CardHeader className="relative z-10">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                      {item.name}
                    </CardTitle>
                    <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent dark:from-green-400 dark:to-green-500 whitespace-nowrap">
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                  {item.description && (
                    <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition-all duration-300 group-hover:scale-105 ${
                        item.isVeg
                          ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/40 dark:to-green-900/60 dark:text-green-300 border border-green-300 dark:border-green-700'
                          : 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900/40 dark:to-orange-900/60 dark:text-orange-300 border border-orange-300 dark:border-orange-700'
                      }`}
                    >
                      {item.isVeg ? '🥬 Veg' : '🍖 Non-Veg'}
                    </span>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {item.shop.name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/dashboard/menu/${item.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full">
                        Manage
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(item.id)}
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

export default function MenuManagementPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <MenuManagementContent />
    </Suspense>
  );
}

