import { Search, Heart, ShoppingCart, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const navigate = useNavigate()

  return (
    <>
      {/* Main Header */}
      <header className="bg-teal-700 text-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-8 py-4">
          {/* Logo */}
          <div 
            onClick={() => navigate('/')}
            className="text-2xl font-bold cursor-pointer hover:text-teal-100 transition"
          >
            EMBROSIA
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-8">
            <button
              onClick={() => navigate('/products')}
              className="hover:text-teal-100 transition font-medium"
            >
              Product
            </button>
            <button className="hover:text-teal-100 transition font-medium">
              Brands
            </button>
            <button className="hover:text-teal-100 transition font-medium">
              Sale
            </button>
            <button className="hover:text-teal-100 transition font-medium">
              About
            </button>
          </nav>

          {/* Search, Wishlist, Cart, User */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="bg-white text-gray-800 rounded-full py-2 px-4 pl-10 w-64 text-sm"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
            <Heart className="w-6 h-6 cursor-pointer hover:text-teal-100 transition" />
            <div className="relative">
              <ShoppingCart 
                onClick={() => navigate('/cart')}
                className="w-6 h-6 cursor-pointer hover:text-teal-100 transition" 
              />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-6 h-6" />
              <span className="text-sm">Hello, Guest</span>
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Header - Features */}
      <div className="bg-blue-100 text-teal-700 px-8 py-3 flex justify-around text-sm font-medium">
        <div className="flex items-center gap-2">
          <span>📦</span>
          <span>Free Shipping Over $50</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🌿</span>
          <span>Natural Ingredients</span>
        </div>
        <div className="flex items-center gap-2">
          <span>💚</span>
          <span>Cruelty-Free</span>
        </div>
        <div className="flex items-center gap-2">
          <span>👨‍⚕️</span>
          <span>Dermatologist Tested</span>
        </div>
      </div>
    </>
  )
}
