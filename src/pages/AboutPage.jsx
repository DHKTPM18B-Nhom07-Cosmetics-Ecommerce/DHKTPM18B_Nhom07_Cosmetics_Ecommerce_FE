import { useState } from "react";
import {
    Leaf, ShieldCheck, Heart, Users, // Icon cũ
    MapPin, Phone, Mail, Clock, Send, // Icon liên hệ
    BadgeCheck, Sparkles, RefreshCcw, Truck // Icon mới cho phần cam kết
} from "lucide-react";
import api, { sendContact } from "../services/api";

export default function AboutPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });
    const [loading, setLoading] = useState(false);
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Gọi hàm đã định nghĩa sẵn cho gọn
            await sendContact(formData);

            alert("Gửi thành công! Hãy kiểm tra email, chúng tôi vừa gửi xác nhận cho bạn.");
            setFormData({ name: "", email: "", phone: "", message: "" });

        } catch (error) {
            // ... xử lý lỗi giữ nguyên
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">

            <main className="flex flex-col gap-16 pb-20 pt-8">

                {/* === SECTION 1: HERO GIỚI THIỆU === */}
                <section className="max-w-7xl mx-auto px-4 w-full">
                    <div className="bg-gradient-to-br from-[#E8F0F4] to-[#D4E5ED] rounded-3xl p-8 md:p-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center shadow-sm">
                        <div className="space-y-6">
              <span className="text-[#2B6377] font-semibold tracking-wider uppercase border-b border-[#2B6377] inline-block pb-1">
                Về chúng tôi
              </span>
                            <h1 className="text-4xl md:text-5xl font-light text-[#2E5F6D] leading-tight">
                                Điểm Đến Của Vẻ Đẹp <br />
                                <span className="font-semibold">Chính Hãng & Toàn Diện</span>
                            </h1>
                            <p className="text-gray-600 leading-relaxed text-lg">
                                Không chỉ là một cửa hàng mỹ phẩm, chúng tôi là người bạn đồng hành tin cậy trên hành trình chăm sóc bản thân của bạn. Từ chăm sóc da chuyên sâu đến trang điểm thời thượng, tất cả đều hội tụ tại đây.
                            </p>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-[#2E5F6D]/10 rounded-2xl transform rotate-3 transition-transform group-hover:rotate-6"></div>
                            <img
                                src="/woman-with-cosmetics-and-natural-leaf.jpg"
                                alt="About Hero"
                                className="relative rounded-2xl shadow-xl w-full h-80 object-cover transform transition-transform group-hover:-translate-y-2"
                            />
                        </div>
                    </div>
                </section>

                {/* === SECTION 2: CÂU CHUYỆN THƯƠNG HIỆU === */}
                <section className="max-w-7xl mx-auto px-4 w-full">
                    <div className="bg-gradient-to-br from-[#E8F0F4] to-[#D4E5ED] rounded-2xl py-4 mb-10 text-center shadow-sm">
                        <h2 className="text-2xl font-medium text-[#2E5F6D] uppercase tracking-wide">
                            Câu chuyện khởi nguồn
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="order-2 md:order-1">
                            <img
                                src="/about-story.jpg"
                                alt="Our Story"
                                className="rounded-2xl shadow-lg w-full h-[400px] object-cover"
                                onError={(e) => e.target.src = "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop"}
                            />
                        </div>
                        <div className="order-1 md:order-2 space-y-4">
                            <h3 className="text-2xl text-[#2E5F6D] font-semibold">Từ niềm đam mê cây cỏ...</h3>
                            <p className="text-gray-600 leading-relaxed">
                                Được thành lập vào năm 2023, chúng tôi bắt đầu với mong muốn xóa bỏ nỗi lo về hàng giả, hàng kém chất lượng đang tràn lan trên thị trường.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Chúng tôi hiểu rằng làn da là tài sản quý giá nhất. Vì vậy, mỗi sản phẩm tại shop đều phải trải qua quy trình kiểm duyệt nguồn gốc khắt khe trước khi đến tay khách hàng.
                            </p>
                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="text-3xl font-bold text-[#2B6377]">50+</div>
                                    <div className="text-sm text-gray-500">Thương hiệu đối tác</div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="text-3xl font-bold text-[#2B6377]">10k+</div>
                                    <div className="text-sm text-gray-500">Khách hàng tin dùng</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === SECTION MỚI: CAM KẾT CHẤT LƯỢNG (THEO YÊU CẦU CỦA BẠN) === */}
                <section className="max-w-7xl mx-auto px-4 w-full">
                    <div className="bg-[#F5F9FB] rounded-3xl p-8 md:p-12 border border-[#D4E5ED]">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl md:text-3xl font-light text-[#2E5F6D] mb-4 uppercase tracking-wider">
                                Tại sao chọn chúng tôi?
                            </h2>
                            <p className="text-gray-500 max-w-2xl mx-auto">
                                Uy tín tạo nên thương hiệu. Dưới đây là những lý do khiến hàng ngàn khách hàng đã lựa chọn đồng hành cùng shop.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Item 1: Chính hãng */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-5 items-start group hover:border-[#2E5F6D] transition-colors">
                                <div className="bg-[#E8F0F4] p-3 rounded-full text-[#2B6377] group-hover:bg-[#2E5F6D] group-hover:text-white transition-colors">
                                    <BadgeCheck size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-[#2E5F6D] mb-2">100% Hàng Chính Hãng</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Chúng tôi là đối tác phân phối chính thức của các thương hiệu lớn như
                                        <span className="font-semibold"> La Roche-Posay, Cerave, L'Oreal, Simple... </span>
                                        Mọi sản phẩm đều có đầy đủ tem phụ, giấy tờ chứng minh nguồn gốc.
                                        <span className="text-red-500 font-medium"> Hoàn tiền 200% </span> nếu phát hiện hàng giả.
                                    </p>
                                </div>
                            </div>

                            {/* Item 2: Đa dạng */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-5 items-start group hover:border-[#2E5F6D] transition-colors">
                                <div className="bg-[#E8F0F4] p-3 rounded-full text-[#2B6377] group-hover:bg-[#2E5F6D] group-hover:text-white transition-colors">
                                    <Sparkles size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-[#2E5F6D] mb-2">Thế Giới Làm Đẹp Đa Dạng</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Từ quy trình <span className="font-semibold">Skincare</span> chuyên sâu (trị mụn, dưỡng trắng, chống lão hóa)
                                        đến các bộ sưu tập <span className="font-semibold">Trang điểm (Makeup)</span> thời thượng và Chăm sóc cơ thể.
                                        Bạn có thể tìm thấy mọi thứ mình cần chỉ tại một nơi.
                                    </p>
                                </div>
                            </div>

                            {/* Item 3: Đổi trả */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-5 items-start group hover:border-[#2E5F6D] transition-colors">
                                <div className="bg-[#E8F0F4] p-3 rounded-full text-[#2B6377] group-hover:bg-[#2E5F6D] group-hover:text-white transition-colors">
                                    <RefreshCcw size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-[#2E5F6D] mb-2">Đổi Trả Dễ Dàng</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Hỗ trợ đổi trả trong vòng <span className="font-semibold">7 ngày</span> nếu sản phẩm có lỗi từ nhà sản xuất hoặc kích ứng (theo chính sách). Mua sắm an tâm tuyệt đối.
                                    </p>
                                </div>
                            </div>

                            {/* Item 4: Giao hàng */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex gap-5 items-start group hover:border-[#2E5F6D] transition-colors">
                                <div className="bg-[#E8F0F4] p-3 rounded-full text-[#2B6377] group-hover:bg-[#2E5F6D] group-hover:text-white transition-colors">
                                    <Truck size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-[#2E5F6D] mb-2">Giao Hàng Hỏa Tốc</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Giao hàng nội thành chỉ trong <span className="font-semibold">2h</span>. Đóng gói cẩn thận 3 lớp chống sốc, đảm bảo sản phẩm nguyên vẹn đến tay bạn.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* === SECTION 4: GIÁ TRỊ CỐT LÕI (Vẫn giữ để tăng uy tín về độ an toàn) === */}
                <section className="max-w-7xl mx-auto px-4 w-full">
                    <div className="bg-gradient-to-br from-[#E8F0F4] to-[#D4E5ED] rounded-2xl py-4 mb-10 text-center shadow-sm">
                        <h2 className="text-2xl font-medium text-[#2E5F6D] uppercase tracking-wide">
                            Tiêu chuẩn sản phẩm
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { icon: Leaf, title: "Thành Phần Xanh", desc: "Ưu tiên các sản phẩm có bảng thành phần lành tính, chiết xuất thiên nhiên." },
                            { icon: ShieldCheck, title: "Kiểm Định Da Liễu", desc: "An toàn cho mọi loại da, kể cả da nhạy cảm nhất." },
                            { icon: Heart, title: "Cruelty Free", desc: "Nói không với các sản phẩm thử nghiệm tàn nhẫn trên động vật." },
                            { icon: Users, title: "Tư Vấn 1:1", desc: "Đội ngũ chuyên viên am hiểu về da liễu sẵn sàng tư vấn routine phù hợp." }
                        ].map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <div key={index} className="bg-white border border-[#D4E5ED] p-8 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group text-center">
                                    <div className="w-16 h-16 bg-[#E8F0F4] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[#2E5F6D] transition-colors duration-300">
                                        <Icon size={32} className="text-[#2E5F6D] group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#2E5F6D] mb-3">{item.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                                </div>
                            )
                        })}
                    </div>
                </section>

                {/* === SECTION 5: LIÊN HỆ & BẢN ĐỒ === */}
                <section className="max-w-7xl mx-auto px-4 w-full">
                    <div className="bg-gradient-to-br from-[#E8F0F4] to-[#D4E5ED] rounded-2xl py-4 mb-10 text-center shadow-sm">
                        <h2 className="text-2xl font-medium text-[#2E5F6D] uppercase tracking-wide">
                            Liên hệ với chúng tôi
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                        {/* CỘT TRÁI: THÔNG TIN + MAP */}
                        <div className="space-y-8">
                            {/* Thông tin liên lạc */}
                            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 space-y-6">
                                <h3 className="text-xl font-semibold text-[#2E5F6D] mb-4">Thông tin cửa hàng</h3>

                                <div className="flex items-start gap-4">
                                    <div className="bg-[#D4E5ED] p-3 rounded-full text-[#2B6377]">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Địa chỉ</p>
                                        <p className="text-gray-600 text-sm">123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-[#D4E5ED] p-3 rounded-full text-[#2B6377]">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Hotline</p>
                                        <p className="text-gray-600 text-sm">1900 123 456</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-[#D4E5ED] p-3 rounded-full text-[#2B6377]">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Email</p>
                                        <p className="text-gray-600 text-sm">support@cosmetic.vn</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-[#D4E5ED] p-3 rounded-full text-[#2B6377]">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Giờ mở cửa</p>
                                        <p className="text-gray-600 text-sm">Thứ 2 - Chủ Nhật: 09:00 - 21:00</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bản đồ */}
                            <div className="rounded-2xl overflow-hidden shadow-lg h-64 md:h-80 border border-gray-200">
                                <iframe
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.494541818296!2d106.6999433748047!3d10.773385289375176!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f4743648f3d%3A0x16ce7636a0293d50!2zQ2hvUIWjIELhur9uIFRow6BuaA!5e0!3m2!1svi!2s!4v1715421234567!5m2!1svi!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Google Map"
                                ></iframe>
                            </div>
                        </div>

                        {/* CỘT PHẢI: FORM LIÊN HỆ */}
                        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-lg border border-[#D4E5ED]">
                            <h3 className="text-2xl font-semibold text-[#2E5F6D] mb-2">Gửi thắc mắc cho chúng tôi</h3>
                            <p className="text-gray-500 mb-8 text-sm">
                                Bạn có câu hỏi về sản phẩm hoặc đơn hàng? Hãy điền thông tin bên dưới nhé.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Họ và tên</label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Nhập tên của bạn"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2E5F6D] focus:ring-1 focus:ring-[#2E5F6D] outline-none transition bg-gray-50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Số điện thoại</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Nhập SĐT (Tùy chọn)"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2E5F6D] focus:ring-1 focus:ring-[#2E5F6D] outline-none transition bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="example@email.com"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2E5F6D] focus:ring-1 focus:ring-[#2E5F6D] outline-none transition bg-gray-50"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Lời nhắn</label>
                                    <textarea
                                        name="message"
                                        required
                                        value={formData.message}
                                        onChange={handleChange}
                                        rows="5"
                                        placeholder="Bạn cần tư vấn gì..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#2E5F6D] focus:ring-1 focus:ring-[#2E5F6D] outline-none transition bg-gray-50 resize-none"
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-[#2E5F6D] text-white font-medium py-4 rounded-xl hover:bg-[#244f61] transition shadow-lg flex items-center justify-center gap-2 mt-4"
                                >
                                    <Send size={18} />
                                    Gửi Ngay
                                </button>
                            </form>
                        </div>

                    </div>
                </section>

            </main>


        </div>
    );
}