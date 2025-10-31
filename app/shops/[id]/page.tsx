'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isVeg: boolean;
  imageUrl: string | null;
}

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
}

type SortOption = 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export default function ShopDetailPage() {
  const params = useParams();
  const shopId = params.id as string;
  const [shop, setShop] = useState<Shop | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [shopResponse, menuResponse] = await Promise.all([
          api.get(`/shops/${shopId}`),
          api.get(`/menu-items?shopId=${shopId}${vegOnly ? '&isVeg=true' : ''}`),
        ]);

        if (shopResponse.data.success) {
          setShop(shopResponse.data.data);
        }
        if (menuResponse.data.success) {
          setMenuItems(menuResponse.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [shopId, vegOnly]);

  // Sort menu items client-side
  const sortedMenuItems = useMemo(() => {
    const items = [...menuItems];
    switch (sortBy) {
      case 'price-asc':
        return items.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return items.sort((a, b) => b.price - a.price);
      case 'name-asc':
        return items.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return items.sort((a, b) => b.name.localeCompare(a.name));
      default:
        return items;
    }
  }, [menuItems, sortBy]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-lg">Shop not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-white dark:bg-gray-900">
      <div className="mx-auto max-w-6xl px-2 sm:px-4 md:px-6 py-6 sm:py-8">
        {/* Shop Header */}
        <div className="mb-12 text-center animate-fade-in">
          {shop.imageUrl && (
            <div className="mb-8 aspect-video w-full max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-2xl relative group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10" />
              <img
                src={shop.imageUrl}
                alt={shop.name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {shop.qrCodeUrl && (
                <div className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg">
                  <img src={shop.qrCodeUrl} alt="QR Code" className="h-24 w-24" />
                </div>
              )}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 animate-fade-in-up px-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="h-0.5 w-8 sm:w-12 md:w-16 bg-gradient-to-r from-transparent via-green-500 to-green-500 rounded-full"></div>
                <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 rounded-full bg-green-500 shadow-lg"></div>
                <div className="h-0.5 w-8 sm:w-12 md:w-16 bg-gradient-to-l from-transparent via-green-500 to-green-500 rounded-full"></div>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-gray-900 bg-clip-text text-transparent dark:from-white dark:via-green-400 dark:to-white text-center">
                {shop.name}
              </h1>
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="h-0.5 w-8 sm:w-12 md:w-16 bg-gradient-to-l from-transparent via-green-500 to-green-500 rounded-full"></div>
                <div className="h-2 w-2 sm:h-2.5 sm:w-2.5 md:h-3 md:w-3 rounded-full bg-green-500 shadow-lg"></div>
                <div className="h-0.5 w-8 sm:w-12 md:w-16 bg-gradient-to-r from-transparent via-green-500 to-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
          {shop.description && (
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-4 max-w-2xl mx-auto leading-relaxed px-4">
              {shop.description}
            </p>
          )}
          {shop.location && (
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-green-200 dark:border-green-800 text-sm sm:text-base">
              <span className="text-green-600 text-base sm:text-lg">📍</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">{shop.location}</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div>
          {/* Section Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="h-0.5 w-6 sm:w-8 bg-gradient-to-r from-transparent to-green-500 rounded-full"></div>
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500"></div>
                <div className="h-0.5 w-6 sm:w-8 bg-gradient-to-l from-transparent to-green-500 rounded-full"></div>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Our Menu
              </h2>
              <div className="hidden sm:flex items-center gap-1.5">
                <div className="h-0.5 w-6 sm:w-8 bg-gradient-to-l from-transparent to-green-500 rounded-full"></div>
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500"></div>
                <div className="h-0.5 w-6 sm:w-8 bg-gradient-to-r from-transparent to-green-500 rounded-full"></div>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-center sm:justify-end">
              {/* Vegetarian Toggle */}
              <div className="flex items-center space-x-2 bg-green-50 dark:bg-green-900/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-green-200 dark:border-green-800">
                <input
                  type="checkbox"
                  id="vegOnly"
                  checked={vegOnly}
                  onChange={(e) => setVegOnly(e.target.checked)}
                  className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <Label htmlFor="vegOnly" className="cursor-pointer text-xs sm:text-sm font-medium text-green-800 dark:text-green-400">
                  🥬 Vegetarian Only
                </Label>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2">
                <Label htmlFor="sortBy" className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sort:
                </Label>
                <select
                  id="sortBy"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="flex h-8 sm:h-9 rounded-lg border border-gray-300 bg-white px-2 sm:px-3 py-1 text-xs sm:text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-950 dark:ring-offset-gray-950 dark:focus-visible:ring-green-400"
                >
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
              </div>
            </div>
          </div>

          {sortedMenuItems.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {vegOnly
                  ? 'No vegetarian items available.'
                  : 'No menu items available.'}
              </p>
              {vegOnly && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setVegOnly(false)}
                  className="mt-4 border-green-600 text-green-600 hover:bg-green-50"
                >
                  Show All Items
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {sortedMenuItems.map((item, index) => (
                <div
                  key={item.id}
                  className="group cursor-pointer rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-gradient-to-br from-white via-green-50/30 to-white dark:from-gray-950 dark:via-green-950/10 dark:to-gray-950 p-5 transition-all duration-300 hover:shadow-2xl hover:border-green-400 dark:hover:border-green-600 hover:-translate-y-1 animate-fade-in-up relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  onClick={() => setSelectedItem(item)}
                >
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:via-green-500/5 group-hover:to-transparent transition-all duration-500 pointer-events-none" />
                  
                  <div className="flex gap-4 relative z-10">
                    {/* Image - Square, smaller with animation */}
                    <div className="flex-shrink-0">
                      {item.imageUrl ? (
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-gradient-to-br from-green-400 to-green-600 p-0.5 group-hover:p-1 transition-all duration-300 shadow-lg group-hover:shadow-green-300/50">
                          <div className="w-full h-full rounded-lg overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg group-hover:shadow-green-300/50 transition-shadow duration-300">
                          <span className="text-white text-4xl opacity-90">🍽️</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex flex-col items-end">
                          <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent dark:from-green-400 dark:to-green-500 whitespace-nowrap">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm transition-all duration-300 group-hover:scale-105 ${
                            item.isVeg
                              ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/40 dark:to-green-900/60 dark:text-green-300 border border-green-300 dark:border-green-700'
                              : 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900/40 dark:to-orange-900/60 dark:text-orange-300 border border-orange-300 dark:border-orange-700'
                          }`}
                        >
                          {item.isVeg ? '🥬 Veg' : '🍖 Non-Veg'}
                        </span>
                        <span className="text-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-auto">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Menu Item Detail Dialog */}
          <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
            <DialogContent>
              {selectedItem && (
                <div className="space-y-6 animate-scale-in">
                  {selectedItem.imageUrl ? (
                    <div className="aspect-video w-full overflow-hidden rounded-xl relative group">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent z-10" />
                      <img
                        src={selectedItem.imageUrl}
                        alt={selectedItem.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                      <span className="text-white text-8xl opacity-90">🍽️</span>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-green-100 dark:border-green-900/50">
                      <h3 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-700 to-gray-900 bg-clip-text text-transparent dark:from-white dark:via-green-400 dark:to-white break-words flex-1 min-w-0">
                        {selectedItem.name}
                      </h3>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <span className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent dark:from-green-400 dark:to-green-500 whitespace-nowrap">
                          ${selectedItem.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold shadow-md transition-all duration-300 hover:scale-105 ${
                          selectedItem.isVeg
                            ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900/40 dark:to-green-900/60 dark:text-green-300 border-2 border-green-300 dark:border-green-700'
                            : 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900/40 dark:to-orange-900/60 dark:text-orange-300 border-2 border-orange-300 dark:border-orange-700'
                        }`}
                      >
                        {selectedItem.isVeg ? '🥬 Vegetarian' : '🍖 Non-Veg'}
                      </span>
                    </div>

                    {selectedItem.description && (
                      <div className="pt-2 bg-green-50/50 dark:bg-green-950/20 rounded-lg p-4 border border-green-100 dark:border-green-900/50">
                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed break-words overflow-wrap-anywhere word-break-break-word">
                          {selectedItem.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

