'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { menuItemSchema, type MenuItemInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/ui/image-upload';
import api from '@/lib/api';

interface MenuItemFormProps {
  menuItemId?: string;
  shopId?: string;
  initialData?: MenuItemInput & { id: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MenuItemForm({
  menuItemId,
  shopId: propShopId,
  initialData,
  onSuccess,
  onCancel,
}: MenuItemFormProps) {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<Array<{ id: string; name: string }>>([]);
  const [imageUrl, setImageUrl] = useState<string>(initialData?.imageUrl || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<MenuItemInput>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      ...initialData,
      shopId: propShopId || initialData?.shopId,
      isVeg: initialData?.isVeg ?? true,
    },
  });

  useEffect(() => {
    if (initialData) {
      setImageUrl(initialData.imageUrl || '');
    }
  }, [initialData]);

  useEffect(() => {
    setValue('imageUrl', imageUrl || '');
  }, [imageUrl, setValue]);

  useEffect(() => {
    async function fetchShops() {
      try {
        const response = await api.get('/shops');
        if (response.data.success) {
          setShops(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch shops:', error);
      }
    }
    fetchShops();
  }, []);

  useEffect(() => {
    if (initialData) {
      reset({
        ...initialData,
        shopId: propShopId || initialData.shopId,
      });
    }
  }, [initialData, propShopId, reset]);

  const onSubmit = async (data: MenuItemInput) => {
    try {
      setError('');
      setLoading(true);
      
      const submitData = {
        ...data,
        imageUrl: imageUrl || data.imageUrl || '',
      };
      
      if (menuItemId) {
        await api.put(`/menu-items/${menuItemId}`, submitData);
      } else {
        await api.post('/menu-items', submitData);
      }

      onSuccess?.();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 'Failed to save menu item. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedShopId = watch('shopId');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{menuItemId ? 'Edit Menu Item' : 'Create New Menu Item'}</CardTitle>
        <CardDescription>
          {menuItemId ? 'Update menu item information' : 'Add a new item to your menu'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          {!propShopId && (
            <div className="space-y-2">
              <Label htmlFor="shopId">Shop *</Label>
              <select
                id="shopId"
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300"
                {...register('shopId')}
              >
                <option value="">Select a shop</option>
                {shops.map((shop) => (
                  <option key={shop.id} value={shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
              {errors.shopId && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {errors.shopId.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              placeholder="Beef Taco"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300"
              placeholder="Delicious beef taco..."
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="5.99"
              {...register('price', { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.price.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Menu Item Image</Label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="Upload Menu Item Image"
            />
            <Input
              type="hidden"
              {...register('imageUrl')}
            />
            {errors.imageUrl && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.imageUrl.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isVeg"
              className="h-4 w-4 rounded border-gray-300"
              {...register('isVeg')}
            />
            <Label htmlFor="isVeg" className="cursor-pointer">
              Vegetarian
            </Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : menuItemId ? 'Update Item' : 'Create Item'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

