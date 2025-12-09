import { Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  const TEAL_BG = '#2B6377';
  return (
      <footer className="text-white" style={{ backgroundColor: TEAL_BG }}>
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">EMBROSIA</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Trải nghiệm vẻ đẹp lấy cảm hứng từ đại dương. Tự nhiên – hiệu quả – bền vững, mang lại làn da rạng rỡ cho bạn.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Cửa hàng</h4>
              <ul className="space-y-2 text-blue-100 text-sm">
                <li><a href="#" className="hover:text-white transition">Chăm sóc da</a></li>
                <li><a href="#" className="hover:text-white transition">Trang điểm</a></li>
                <li><a href="#" className="hover:text-white transition">Chăm sóc tóc</a></li>
                <li><a href="#" className="hover:text-white transition">Chăm sóc cơ thể</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-blue-100 text-sm">
                <li><a href="#" className="hover:text-white transition">Về chúng tôi</a></li>
                <li><a href="#" className="hover:text-white transition">Liên hệ</a></li>
                <li><a href="#" className="hover:text-white transition">Câu hỏi thường gặp</a></li>
                <li><a href="#" className="hover:text-white transition">Thông tin giao hàng</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Bản tin</h4>
              <p className="text-blue-100 text-sm mb-3">Đăng ký để nhận ưu đãi và mẹo chăm sóc sắc đẹp</p>
              <div className="flex gap-2">
                <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    className="flex-1 px-3 py-2 rounded text-white-800 text-sm"
                />
                <button className="bg-blue-200 text-teal-700 px-4 py-2 rounded font-medium hover:bg-blue-100 transition">
                  Tham gia
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-blue-200 pt-8">
            <div className="flex justify-between items-center">
              <p className="text-blue-100 text-sm">
                © 2025 Embrosia. Tất cả quyền được bảo lưu.
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
