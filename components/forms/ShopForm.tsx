'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shopSchema, type ShopInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ImageUpload from '@/components/ui/image-upload';
import api from '@/lib/api';
import { getUser } from '@/lib/auth';
import { generateShopQRCode, generateQRCode, downloadQRCode } from '@/lib/qrcode';

interface ShopFormProps {
  shopId?: string;
  initialData?: ShopInput & { id: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ShopForm({ shopId, initialData, onSuccess, onCancel }: ShopFormProps) {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(initialData?.imageUrl || '');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>(initialData?.qrCodeUrl || '');
  const [generatingQR, setGeneratingQR] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ShopInput>({
    resolver: zodResolver(shopSchema),
    defaultValues: initialData,
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setImageUrl(initialData.imageUrl || '');
      setQrCodeUrl(initialData.qrCodeUrl || '');
    }
  }, [initialData, reset]);

  // Watch imageUrl changes to sync with form
  useEffect(() => {
    setValue('imageUrl', imageUrl || '');
  }, [imageUrl, setValue]);

  useEffect(() => {
    setValue('qrCodeUrl', qrCodeUrl || '');
  }, [qrCodeUrl, setValue]);

  const handleGenerateQRCode = async () => {
    try {
      setGeneratingQR(true);
      // For existing shops, use shopId; for new shops, generate after creation
      if (shopId) {
        const qrCodeDataUrl = await generateShopQRCode(shopId);
        setQrCodeUrl(qrCodeDataUrl);
        setValue('qrCodeUrl', qrCodeDataUrl);
      } else {
        // For new shops, we'll generate QR code after shop is created
        const shopUrl = `${window.location.origin}/shops/[new-shop-id]`;
        const qrCodeDataUrl = await generateQRCode(shopUrl);
        setQrCodeUrl(qrCodeDataUrl);
        setValue('qrCodeUrl', qrCodeDataUrl);
      }
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      setError('Failed to generate QR code');
    } finally {
      setGeneratingQR(false);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      downloadQRCode(qrCodeUrl, `shop-qrcode-${shopId || 'new'}.png`);
    }
  };

  const onSubmit = async (data: ShopInput) => {
    try {
      setError('');
      setLoading(true);
      
      const submitData = {
        ...data,
        imageUrl: imageUrl || data.imageUrl || '',
        qrCodeUrl: qrCodeUrl || data.qrCodeUrl || '',
      };
      
      if (shopId) {
        const response = await api.put(`/shops/${shopId}`, submitData);
        // Generate QR code if shop was just updated and doesn't have one
        if (response.data.success && !qrCodeUrl) {
          const qrCodeDataUrl = await generateShopQRCode(shopId);
          setQrCodeUrl(qrCodeDataUrl);
          // Update shop with QR code
          await api.put(`/shops/${shopId}`, { qrCodeUrl: qrCodeDataUrl });
        }
      } else {
        const user = getUser();
        if (!user) throw new Error('User not found');
        const response = await api.post('/shops', { ...submitData, ownerId: user.id });
        
        // Generate QR code for newly created shop
        if (response.data.success && response.data.data?.id) {
          const newShopId = response.data.data.id;
          const qrCodeDataUrl = await generateShopQRCode(newShopId);
          // Update shop with QR code
          await api.put(`/shops/${newShopId}`, { qrCodeUrl: qrCodeDataUrl });
        }
      }

      onSuccess?.();
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message || 'Failed to save shop. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{shopId ? 'Edit Shop' : 'Create New Shop'}</CardTitle>
        <CardDescription>
          {shopId ? 'Update your shop information' : 'Add a new shop to your account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Shop Name *</Label>
            <Input
              id="name"
              placeholder="Taco Stand"
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
              placeholder="Authentic Mexican tacos..."
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Downtown"
              {...register('location')}
            />
          </div>

          <div className="space-y-2">
            <Label>Shop Image</Label>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              label="Upload Shop Image"
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

          <div className="space-y-2">
            <Label>QR Code</Label>
            {qrCodeUrl ? (
              <div className="space-y-2">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-48 h-48 border rounded-lg p-2 bg-white"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadQR}
                  >
                    Download QR Code
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateQRCode}
                    disabled={generatingQR}
                  >
                    {generatingQR ? 'Generating...' : 'Regenerate QR Code'}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateQRCode}
                disabled={generatingQR}
              >
                {generatingQR ? 'Generating...' : 'Generate QR Code'}
              </Button>
            )}
            <Input
              type="hidden"
              {...register('qrCodeUrl')}
            />
            {errors.qrCodeUrl && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.qrCodeUrl.message}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : shopId ? 'Update Shop' : 'Create Shop'}
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

