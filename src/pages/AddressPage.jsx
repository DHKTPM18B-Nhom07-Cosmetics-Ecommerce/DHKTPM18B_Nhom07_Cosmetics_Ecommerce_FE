import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Plus, Edit2, Trash2, CheckCircle, Package, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAddressesByCustomer, createAddress, updateAddress, deleteAddress } from '../services/addressService';
import axios from 'axios'; // Cần import axios để gọi API địa chính

const TEAL_TEXT = 'text-[#2B6377]';
const TEAL_ACTIVE_BG = 'bg-[#CCDFE3]';
const TEAL_HOVER_BG = 'hover:bg-[#E6F3F5]';

export default function AddressPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState(null);

    // --- STATE CHO ĐỊA CHÍNH VIỆT NAM ---
    const [provinces, setProvinces] = useState([]); // Danh sách Tỉnh
    const [districts, setDistricts] = useState([]); // Danh sách Huyện
    const [wards, setWards] = useState([]);         // Danh sách Xã
    
    // Lưu ID để load dữ liệu con (Backend lưu Tên, nhưng API cần ID để lọc)
    const [selectedProvId, setSelectedProvId] = useState('');
    const [selectedDistId, setSelectedDistId] = useState('');

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        city: '',       // Tỉnh/Thành
        state: '',      // Quận/Huyện
        ward: '',       // Phường/Xã (để ghép vào address)
        specificAddress: '', // Số nhà, tên đường
        address: '',    // Full địa chỉ gửi xuống DB
        isDefault: false
    });

    // 1. Load dữ liệu Tỉnh/Thành phố ngay khi mở trang
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await axios.get('https://esgoo.net/api-tinhthanh/1/0.htm');
                if (res.data.error === 0) {
                    setProvinces(res.data.data);
                }
            } catch (error) {
                console.error("Lỗi lấy tỉnh thành:", error);
            }
        };
        fetchProvinces();
    }, []);

    // 2. Load Quận/Huyện khi chọn Tỉnh
    useEffect(() => {
        const fetchDistricts = async () => {
            if (selectedProvId) {
                try {
                    const res = await axios.get(`https://esgoo.net/api-tinhthanh/2/${selectedProvId}.htm`);
                    if (res.data.error === 0) setDistricts(res.data.data);
                } catch (e) { console.error(e); }
            } else {
                setDistricts([]);
                setWards([]);
            }
        };
        fetchDistricts();
    }, [selectedProvId]);

    // 3. Load Phường/Xã khi chọn Huyện
    useEffect(() => {
        const fetchWards = async () => {
            if (selectedDistId) {
                try {
                    const res = await axios.get(`https://esgoo.net/api-tinhthanh/3/${selectedDistId}.htm`);
                    if (res.data.error === 0) setWards(res.data.data);
                } catch (e) { console.error(e); }
            } else {
                setWards([]);
            }
        };
        fetchWards();
    }, [selectedDistId]);

    // --- LOGIC CŨ ---
    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            setLoading(true);
            let userId = user?.id;
            if (!userId) {
                const localUser = localStorage.getItem('user');
                if (localUser) userId = JSON.parse(localUser).id;
            }
            if (!userId) return;

            const data = await getAddressesByCustomer(userId);
            const sorted = data.sort((a, b) => (b.default === true) - (a.default === true));
            setAddresses(sorted);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    const getUserIdSafe = () => {
        if (user?.id) return user.id;
        const localUser = localStorage.getItem('user');
        if (localUser) return JSON.parse(localUser).id;
        return null;
    };

    const handleAddNew = () => {
        setIsEditing(false);
        // Reset form sạch sẽ
        setFormData({ fullName: '', phone: '', city: '', state: '', ward: '', specificAddress: '', address: '', isDefault: false });
        setSelectedProvId('');
        setSelectedDistId('');
        setShowModal(true);
    };

    // Khi sửa, ta chỉ load lại text 
    // Người dùng muốn đổi địa chỉ thì chọn lại từ đầu
    const handleEdit = async (addr) => {
        setIsEditing(true);
        setCurrentId(addr.id);
        
        // 1. Tách Phường/Xã và Số nhà (Logic cũ)
        let detectedWard = '';
        let detectedSpecific = addr.address;

        if (addr.address && addr.address.includes(', ')) {
            const parts = addr.address.split(', ');
            if (parts.length > 1) {
                detectedWard = parts[parts.length - 1]; 
                detectedSpecific = parts.slice(0, parts.length - 1).join(', ');
            }
        }

        // 2. LOGIC MỚI: TÌM NGƯỢC ID TỪ TÊN (Mapping Name -> ID)
        
        // A. Tìm ID Tỉnh
        // Duyệt danh sách provinces đang có để tìm ID của cái tên "addr.city"
        const foundProv = provinces.find(p => p.full_name === addr.city);
        let provId = '';
        
        if (foundProv) {
            provId = foundProv.id;
            setSelectedProvId(provId); // Set ID để hiển thị đúng trên Select
        }

        // B. Tìm ID Huyện (Phải gọi API vì chưa load districts)
        let distId = '';
        if (provId) {
            try {
                // Gọi API lấy danh sách huyện của tỉnh này ngay lập tức
                const resDist = await axios.get(`https://esgoo.net/api-tinhthanh/2/${provId}.htm`);
                if (resDist.data.error === 0) {
                    const distList = resDist.data.data;
                    setDistricts(distList); // Nạp danh sách huyện vào dropdown

                    // Tìm ID huyện khớp tên
                    const foundDist = distList.find(d => d.full_name === addr.state);
                    if (foundDist) {
                        distId = foundDist.id;
                        setSelectedDistId(distId); // Set ID huyện
                    }
                }
            } catch (e) { console.error("Lỗi load huyện khi edit:", e); }
        }

        // C. Load danh sách Xã (Nếu tìm được huyện)
        if (distId) {
             try {
                const resWard = await axios.get(`https://esgoo.net/api-tinhthanh/3/${distId}.htm`);
                if (resWard.data.error === 0) {
                    setWards(resWard.data.data); // Nạp danh sách xã vào dropdown
                }
            } catch (e) { console.error("Lỗi load xã khi edit:", e); }
        }

        // 3. Đổ dữ liệu vào Form
        setFormData({
            fullName: addr.fullName,
            phone: addr.phone,
            city: addr.city,
            state: addr.state,
            ward: detectedWard, // Giờ dropdown xã đã có dữ liệu nên giá trị này sẽ hiện đúng
            specificAddress: detectedSpecific, 
            address: addr.address,
            isDefault: addr.default 
        });
        
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const userId = getUserIdSafe();

        // Ghép Phường + Số nhà thành field address
        // Ví dụ: "Phường Bến Nghé, 123 Đồng Khởi"
        const finalAddress = formData.ward 
            ? `${formData.specificAddress}, ${formData.ward}` 
            : formData.specificAddress;

        const payload = {
            ...formData,
            address: finalAddress, // Ghi đè address bằng chuỗi đã ghép
            country: 'Việt Nam'
        };

        try {
            if (isEditing) {
                await updateAddress(currentId, payload);
                alert("Cập nhật thành công!");
            } else {
                if (userId) {
                    await createAddress(userId, payload);
                    alert("Thêm địa chỉ mới thành công!");
                } else {
                    alert("Lỗi user ID");
                }
            }
            setShowModal(false);
            fetchData(); 
        } catch (error) {
            alert("Có lỗi xảy ra!");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Bạn chắc chắn muốn xóa?")) {
            await deleteAddress(id);
            fetchData();
        }
    };

    const AccountSidebar = () => (
        <div className="w-64 flex-shrink-0 bg-white p-4 rounded-lg shadow-sm font-sans border border-gray-100 h-fit">
            <h3 className="font-semibold text-lg text-gray-800 mb-4 border-b pb-2">Tài khoản</h3>
            <nav className="space-y-2">
                <Link to="/order" className={`flex items-center p-2 text-gray-700 ${TEAL_HOVER_BG} rounded-md transition`}>
                    <Package className="w-4 h-4 mr-2" /> Quản lý đơn hàng
                </Link>
                <Link to="/profile" className={`flex items-center p-2 text-gray-700 ${TEAL_HOVER_BG} rounded-md transition`}>
                    <User className="w-4 h-4 mr-2" /> Thông tin cá nhân
                </Link>
                <Link to="/addresses" className={`flex items-center p-2 ${TEAL_TEXT} ${TEAL_ACTIVE_BG} rounded-md font-medium transition`}>
                    <MapPin className="w-4 h-4 mr-2" /> Địa chỉ giao hàng
                </Link>
                <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center p-2 text-gray-700 hover:bg-red-50 rounded-md transition mt-4 border-t pt-2">
                    <LogOut className="w-4 h-4 mr-2" /> Thoát
                </button>
            </nav>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
            <div className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <div className="text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-[#2B6377]">Home</Link> / 
                    <span className="mx-1">Tài khoản</span> / 
                    <span className="font-medium text-[#2B6377]"> Sổ địa chỉ</span>
                </div>

                <div className="flex gap-8">
                    <AccountSidebar />

                    <main className="flex-1">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b">
                            <h2 className="text-3xl font-light text-gray-800 uppercase">địa chỉ</h2>
                            <button onClick={handleAddNew} className="flex items-center gap-2 bg-[#2B6377] text-white px-5 py-2.5 rounded-md hover:bg-[#1f4654] transition shadow-sm font-medium">
                                <Plus size={18} /> Thêm địa chỉ mới
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center py-10 text-[#2B6377]">Đang tải dữ liệu...</div>
                        ) : addresses.length === 0 ? (
                            <div className="bg-white p-8 rounded-lg shadow-sm border text-center text-gray-500">
                                <MapPin size={48} className="mx-auto mb-3 text-gray-300"/>
                                <p>Bạn chưa lưu địa chỉ nào.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {addresses.map((addr) => (
                                    <div key={addr.id} className={`bg-white border rounded-lg p-6 flex flex-col md:flex-row justify-between items-start gap-4 transition relative ${addr.default ? 'border-[#2B6377] ring-1 ring-[#2B6377]/30' : 'border-gray-200 hover:border-gray-300'}`}>
                                        {addr.default && (
                                            <span className="absolute top-0 left-0 bg-[#2B6377] text-white text-[10px] px-3 py-1 rounded-br rounded-tl font-bold uppercase tracking-wider flex items-center gap-1">
                                                <CheckCircle size={10} /> Mặc định
                                            </span>
                                        )}
                                        <div className={`space-y-1 ${addr.default ? 'mt-4' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-gray-800 text-lg">{addr.fullName}</span>
                                                <span className="text-gray-300">|</span>
                                                <span className="text-gray-600">{addr.phone}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm mt-1">{addr.address}</p>
                                            <p className="text-gray-500 text-sm uppercase">{addr.state}, {addr.city}</p>
                                        </div>
                                        <div className="flex flex-col gap-3 items-end mt-2">
                                            <div className="flex gap-3">
                                                <button onClick={() => handleEdit(addr)} className="text-[#2B6377] hover:text-[#1f4654] text-sm font-medium flex items-center gap-1 hover:underline"><Edit2 size={14}/> Sửa</button>
                                                {!addr.default && <button onClick={() => handleDelete(addr.id)} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 hover:underline"><Trash2 size={14}/> Xóa</button>}
                                            </div>
                                            {!addr.default && (
                                                <button className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded hover:border-[#2B6377] hover:text-[#2B6377] transition bg-gray-50"
                                                    onClick={() => { updateAddress(addr.id, { ...addr, isDefault: true }).then(() => fetchData()); }}>
                                                    Thiết lập mặc định
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* MODAL POPUP - ĐÃ CẬP NHẬT SELECT */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 sticky top-0 z-10">
                            <h3 className="font-bold text-lg text-gray-800">
                                {isEditing ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                                    <input type="text" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2B6377]"
                                        value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                                    <input type="tel" required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2B6377]"
                                        value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                                </div>
                            </div>

                            {/* --- PHẦN SELECT ĐỊA CHỈ MỚI --- */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố</label>
                                    <select 
                                        required 
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2B6377]"
                                        value={selectedProvId}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            const name = e.target.options[e.target.selectedIndex].text;
                                            setSelectedProvId(id);
                                            setFormData({...formData, city: name, state: '', ward: ''}); // Reset con
                                            setSelectedDistId('');
                                        }}
                                    >
                                        <option value="">Chọn Tỉnh/Thành</option>
                                        {provinces.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                                    </select>
                                    {/* Fallback hiển thị text cũ nếu đang sửa mà chưa chọn lại */}
                                    {isEditing && !selectedProvId && <p className="text-xs text-gray-500 mt-1">Hiện tại: {formData.city}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                                    <select 
                                        required={!!selectedProvId} // Bắt buộc nếu đã chọn Tỉnh
                                        disabled={!selectedProvId}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2B6377] disabled:bg-gray-100"
                                        value={selectedDistId}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            const name = e.target.options[e.target.selectedIndex].text;
                                            setSelectedDistId(id);
                                            setFormData({...formData, state: name, ward: ''});
                                        }}
                                    >
                                        <option value="">Chọn Quận/Huyện</option>
                                        {districts.map(d => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                                    </select>
                                    {isEditing && !selectedDistId && <p className="text-xs text-gray-500 mt-1">Hiện tại: {formData.state}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                                <select 
                                    required={!!selectedDistId}
                                    disabled={!selectedDistId}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2B6377] disabled:bg-gray-100"
                                    value={formData.ward}
                                    onChange={(e) => {
                                        // Lưu thẳng tên Phường vào state ward
                                        setFormData({...formData, ward: e.target.options[e.target.selectedIndex].text});
                                    }}
                                >
                                    <option value="">Chọn Phường/Xã</option>
                                    {wards.map(w => (
                                        //Dùng full_name làm value luôn
                                        <option key={w.id} value={w.full_name}>{w.full_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể</label>
                                <textarea rows="2" required 
                                    placeholder="Số nhà, tên đường, tòa nhà..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-[#2B6377]"
                                    value={formData.specificAddress} 
                                    onChange={(e) => setFormData({...formData, specificAddress: e.target.value})} 
                                ></textarea>
                            </div>

                            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <input type="checkbox" id="defaultAddr" className="w-5 h-5 text-[#2B6377] border-gray-300 rounded focus:ring-[#2B6377] cursor-pointer"
                                    checked={formData.isDefault} onChange={(e) => setFormData({...formData, isDefault: e.target.checked})} />
                                <label htmlFor="defaultAddr" className="text-sm text-gray-700 cursor-pointer select-none">Đặt làm địa chỉ mặc định</label>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition">Trở lại</button>
                                <button type="submit" className="px-6 py-2.5 bg-[#2B6377] text-white rounded-lg hover:bg-[#1f4654] font-medium transition shadow-sm">Hoàn thành</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}