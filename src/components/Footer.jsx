import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-teal-700 text-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">EMBROSIA</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Experience the transformative power of ocean-inspired beauty. Natural, effective, and sustainable skincare for your radiant glow.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-blue-100 text-sm">
              <li><a href="#" className="hover:text-white transition">Skincare</a></li>
              <li><a href="#" className="hover:text-white transition">Makeup</a></li>
              <li><a href="#" className="hover:text-white transition">Hair Care</a></li>
              <li><a href="#" className="hover:text-white transition">Body Care</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-blue-100 text-sm">
              <li><a href="#" className="hover:text-white transition">About Us</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
              <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition">Shipping Info</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-blue-100 text-sm mb-3">Subscribe for exclusive offers and beauty tips</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 rounded text-gray-800 text-sm"
              />
              <button className="bg-blue-200 text-teal-700 px-4 py-2 rounded font-medium hover:bg-blue-100 transition">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-200 pt-8">
          <div className="flex justify-between items-center">
            <p className="text-blue-100 text-sm">
              © 2025 Embrosia. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-blue-100 hover:text-white transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-blue-100 hover:text-white transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-blue-100 hover:text-white transition">
                <Twitter size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
