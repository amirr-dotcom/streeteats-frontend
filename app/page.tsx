import Link from "next/link";
import { Button } from "@/components/ui/button";

// Homepage for StreetEats - Digital Menus for Food Vendors
export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl">🍃</span>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl dark:text-white">
              StreetEats
            </h1>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-4 mb-6">
            Dive Into Delicious Meal Dishes
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Create beautiful digital menus for your food shop and share them
            instantly via QR codes. Perfect for street food vendors and small
            restaurants.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link href="/shops">
              <Button variant="outline" size="lg">
                Browse Shops
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to digitize your menu
            </h2>
          </div>
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border-2 border-green-100 bg-white p-8 shadow-sm hover:border-green-300 transition-colors dark:border-green-900/50 dark:bg-gray-950">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Digital Menus
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Create and manage your menu items with beautiful photos and
                  descriptions.
                </p>
              </div>
              <div className="rounded-xl border-2 border-green-100 bg-white p-8 shadow-sm hover:border-green-300 transition-colors dark:border-green-900/50 dark:bg-gray-950">
                <div className="text-4xl mb-4">🔲</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  QR Codes
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Generate QR codes for your shop that customers can scan to
                  view your menu.
                </p>
              </div>
              <div className="rounded-xl border-2 border-green-100 bg-white p-8 shadow-sm hover:border-green-300 transition-colors dark:border-green-900/50 dark:bg-gray-950">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Easy Management
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Update your menu anytime from your dashboard. Changes appear
                  instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
