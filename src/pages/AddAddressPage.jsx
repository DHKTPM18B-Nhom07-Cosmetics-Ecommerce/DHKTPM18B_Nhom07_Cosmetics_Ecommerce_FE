import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { ChevronRight } from 'lucide-react';
import { provinces, getDistrictsByProvince, getWardsByDistrict } from '../data/vietnamAddresses';
import { getAddressesByCustomerId, createAddress } from '../services/checkout';
import { getCustomerIdByAccountId } from '../services/checkout';

export default function AddAddressPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customerId, setCustomerId] = useState(null);
  const [existingAddresses, setExistingAddresses] = useState([]);
  const [isDefault, setIsDefault] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    province: null,
    district: null,
    ward: null,
    street: '',
    note: ''
  });

  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Load customer info
  useEffect(() => {
    const loadCustomerInfo = async () => {
      try {
        setLoading(true);
        const userStored = localStorage.getItem('user');
        if (!userStored) {
          navigate('/login');
          return;
        }

        const user = JSON.parse(userStored);
        const cId = await getCustomerIdByAccountId(user.id);
        
        if (!cId) {
          navigate('/login');
          return;
        }

        setCustomerId(cId);

        // Load existing addresses
        const addresses = await getAddressesByCustomerId(cId);
        setExistingAddresses(addresses || []);

        // Auto set isDefault = true if no addresses exist
        if (!addresses || addresses.length === 0) {
          setIsDefault(true);
        }
      } catch (error) {
        console.error('Error loading customer info:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    loadCustomerInfo();
  }, [navigate]);

  const handleProvinceChange = (selectedOption) => {
    setFormData({
      ...formData,
      province: selectedOption,
      district: null,
      ward: null
    });

    if (selectedOption) {
      const districtList = getDistrictsByProvince(selectedOption.code);
      setDistricts(districtList);
      setWards([]);
    } else {
      setDistricts([]);
      setWards([]);
    }
  };

  const handleDistrictChange = (selectedOption) => {
    setFormData({
      ...formData,
      district: selectedOption,
      ward: null
    });

    if (selectedOption && formData.province) {
      const wardList = getWardsByDistrict(formData.province.code, selectedOption.code);
      setWards(wardList);
    } else {
      setWards([]);
    }
  };

  const handleWardChange = (selectedOption) => {
    setFormData({
      ...formData,
      ward: selectedOption
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSaveAddress = async () => {
    try {
      // Validate
      if (!formData.firstName || !formData.lastName || !formData.phone || !formData.street) {
        alert('Vui lòng điền đầy đủ thông tin: Họ, Tên, Số điện thoại, Địa chỉ cụ thể.');
        return;
      }

      if (!formData.province || !formData.district) {
        alert('Vui lòng chọn Tỉnh/Thành phố và Quận/Huyện.');
        return;
      }

      setSaving(true);

      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      const city = formData.district?.label || '';
      const state = formData.province?.label || '';

      const addressPayload = {
        customerId: customerId,
        fullName: fullName,
        phone: formData.phone,
        address: formData.street,
        city: city,
        state: state,
        country: 'Vietnam',
        default: isDefault
      };

      console.log('📍 Saving address:', addressPayload);

      // If this is not the first address and it's set as default, update existing default addresses
      if (isDefault && existingAddresses.length > 0) {
        // TODO: Update existing addresses to setDefault = false
        // This would require an update endpoint for each existing address
        console.log('⚠️ Setting other addresses as non-default');
      }

      const savedAddress = await createAddress(addressPayload);
      console.log('✅ Address saved:', savedAddress);

      alert('Địa chỉ đã được lưu thành công!');
      navigate('/');
    } catch (error) {
      console.error('❌ Error saving address:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi khi lưu địa chỉ.';
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-[#2B5F68]">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-[#1f2d3d]">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6 gap-2">
          <span className="cursor-pointer hover:text-[#2B5F68]" onClick={() => navigate('/')}>Trang chủ</span>
          <ChevronRight size={14} />
          <span className="text-[#2B5F68] font-semibold">Thêm địa chỉ</span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-bold text-[#2B5F68] mb-6">Thêm địa chỉ giao hàng</h1>

          {/* Info */}
          {existingAddresses.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                💡 Đây sẽ là địa chỉ mặc định của bạn.
              </p>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5">
            {/* Họ - Tên */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#2B5F68] mb-2">
                  Họ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Nhập họ"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2B5F68]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2B5F68] mb-2">
                  Tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Nhập tên"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2B5F68]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#2B5F68] mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Nhập email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2B5F68]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#2B5F68] mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Nhập số điện thoại"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2B5F68]"
              />
            </div>

            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-[#2B5F68] mb-2">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </label>
              <Select
                options={provinces}
                value={formData.province}
                onChange={handleProvinceChange}
                placeholder="Chọn tỉnh/thành phố..."
                className="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#2B5F68' }
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#2B5F68' : state.isFocused ? '#f3f4f6' : 'white',
                    color: state.isSelected ? 'white' : '#1f2d3d'
                  })
                }}
              />
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-[#2B5F68] mb-2">
                Quận/Huyện <span className="text-red-500">*</span>
              </label>
              <Select
                options={districts}
                value={formData.district}
                onChange={handleDistrictChange}
                placeholder="Chọn quận/huyện..."
                isDisabled={!formData.province}
                className="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#2B5F68' }
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#2B5F68' : state.isFocused ? '#f3f4f6' : 'white',
                    color: state.isSelected ? 'white' : '#1f2d3d'
                  })
                }}
              />
            </div>

            {/* Ward */}
            <div>
              <label className="block text-sm font-medium text-[#2B5F68] mb-2">
                Phường/Xã
              </label>
              <Select
                options={wards}
                value={formData.ward}
                onChange={handleWardChange}
                placeholder="Chọn phường/xã..."
                isDisabled={!formData.district}
                className="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: '#d1d5db',
                    '&:hover': { borderColor: '#2B5F68' }
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected ? '#2B5F68' : state.isFocused ? '#f3f4f6' : 'white',
                    color: state.isSelected ? 'white' : '#1f2d3d'
                  })
                }}
              />
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-sm font-medium text-[#2B5F68] mb-2">
                Địa chỉ cụ thể <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="VD: 123 Đường Nguyễn Huệ, Tòa nhà ABC"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2B5F68]"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-[#2B5F68] mb-2">
                Ghi chú (tùy chọn)
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="VD: Gần trường học, cạnh siêu thị..."
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#2B5F68]"
              />
            </div>

            {/* Default Address Radio */}
            {existingAddresses.length > 0 && (
              <div className="border-t pt-5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium text-[#2B5F68]">
                    Đặt làm địa chỉ mặc định
                  </span>
                </label>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-2.5 border border-[#2B5F68] text-[#2B5F68] font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveAddress}
                disabled={saving}
                className="flex-1 px-6 py-2.5 bg-[#2B5F68] text-white font-medium rounded-lg hover:bg-[#1e4450] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
