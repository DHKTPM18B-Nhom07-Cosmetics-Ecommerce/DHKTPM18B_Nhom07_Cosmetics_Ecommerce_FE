import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, ChevronLeft } from 'lucide-react';
import { createReview } from '../services/reviewService';
import { toast } from 'react-toastify';
import axios from 'axios';

const ProductReviewPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const orderId = location.state?.orderId;
    const preSelectedProduct = location.state?.preSelectedProduct;

    // States
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Lấy thông tin đơn hàng từ API
    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!orderId) {
                toast.error('Không tìm thấy thông tin đơn hàng');
                navigate('/orders');
                return;
            }

            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const response = await axios.get(`http://localhost:8080/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${user?.token}` }
                });
                const fetchedOrderItems = response.data.orderDetails || [];

                setOrderDetails(response.data);

                //  CHỌN SẢN PHẨM
                let itemToSelect = null;

                if (preSelectedProduct && preSelectedProduct.variantId) {
                    // 1. Nếu có preSelectedProduct, tìm OrderDetail đầy đủ dựa trên variantId
                    itemToSelect = fetchedOrderItems.find(
                        item => item.productVariant?.id === preSelectedProduct.variantId
                    );
                }

                // 2. Tự động chọn sản phẩm đầu tiên nếu chỉ có 1 sản phẩm
                if (!itemToSelect && fetchedOrderItems.length === 1) {
                    itemToSelect = fetchedOrderItems[0];
                }

                // Gán sản phẩm được chọn
                setSelectedProduct(itemToSelect || preSelectedProduct);

            } catch (error) {
                console.error('Lỗi khi tải đơn hàng:', error);
                toast.error('Không thể tải thông tin đơn hàng');
                navigate('/orders');
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId, navigate, preSelectedProduct]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.warning('Vui lòng chọn số sao đánh giá!');
            return;
        }

        if (!selectedProduct) {
            toast.warning('Vui lòng chọn sản phẩm để đánh giá!');
            return;
        }

        // Lấy thông tin customer từ account ID
        const userStored = localStorage.getItem('user');
        if (!userStored) {
            toast.error('Vui lòng đăng nhập để đánh giá sản phẩm');
            navigate('/login');
            return;
        }

        const user = JSON.parse(userStored);

        try {
            // Lấy customer ID từ account ID
            const customerResponse = await axios.get(
                `http://localhost:8080/api/customers/account/${user.id}`,
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            const customerId = customerResponse.data.id;

            // 🎯 LẤY PRODUCT ID TỪ CẤU TRÚC ORDER DETAIL HOẶC TỪ preSelectedProduct
            const productId = selectedProduct.productVariant?.product?.id || selectedProduct.productId;

            if (!productId) {
                toast.error('Không tìm thấy thông tin sản phẩm');
                return;
            }

            // Gửi review
            await createReview({
                customerId,
                productId,
                rating,
                comment: review.trim(),
                active: true
            });

            toast.success('Gửi đánh giá thành công!');
            navigate(`/orders/${orderId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá');
        }
    };

    const handleCancel = () => {
        if (rating > 0 || review.trim()) {
            if (window.confirm('Bạn có chắc muốn hủy? Các thông tin đã nhập sẽ bị mất.')) {
                navigate(-1);
            }
        } else {
            navigate(-1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-xl text-gray-600">Đang tải thông tin đơn hàng...</div>
                </div>
            </div>
        );
    }

    if (!orderDetails) {
        return null;
    }

    // --- HÀM TRỢ GIÚP HIỂN THỊ THÔNG TIN SẢN PHẨM ---
    const getProductDisplayInfo = (item) => {
        // Ưu tiên lấy từ cấu trúc OrderDetail đầy đủ
        const productName = item.productVariant?.product?.name || item.productVariant?.variantName;
        const variantName = item.productVariant?.variantName;
        const imageUrl = item.productVariant?.imageUrls?.[0] || item.productVariant?.product?.images?.[0]?.imageUrl || 'https://via.placeholder.com/100';
        const price = item.unitPrice || 0;
        const quantity = item.quantity || 1;

        // Nếu item là preSelectedProduct (cấu trúc đơn giản)
        if (!item.productVariant) {
            return {
                name: item.productName || 'Sản phẩm',
                variant: item.variantName || 'Không xác định',
                image: 'https://via.placeholder.com/100', // Không có ảnh đầy đủ
                price: 'N/A', // Không có giá đầy đủ
                quantity: 'N/A', // Không có số lượng đầy đủ
            }
        }

        return {
            name: productName,
            variant: variantName,
            image: imageUrl,
            price: price,
            quantity: quantity,
        }
    };


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-[#2C6B6E] text-white shadow-md sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="hover:bg-white/10 p-2 rounded-lg transition"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <h1 className="text-xl font-semibold">Đánh giá sản phẩm</h1>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="min-h-screen bg-gray-50 flex flex-col items-center">
                <div className="max-w-4xl w-full px-4 py-6">
                    {/* Breadcrumb */}
                    <div className="pt-4 pb-4 mt-4 mb-4 text-sm text-gray-600">
                        <span className="hover:underline cursor-pointer" onClick={() => navigate('/')}>Home</span>
                        <span className="mx-2">›</span>
                        <span className="hover:underline cursor-pointer" onClick={() => navigate('/order')}>Tài khoản</span>
                        <span className="mx-2">›</span>
                        <span className="hover:underline cursor-pointer" onClick={() => navigate('/order')}>Quản lý đơn hàng</span>
                        <span className="mx-2">›</span>
                        <span className="hover:underline cursor-pointer">Chi tiết đơn hàng</span>
                        <span className="mx-2">›</span>
                        <span className="text-gray-900 font-medium">Đánh giá sản phẩm</span>
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold text-[#2C6B6E] mb-6">ĐÁNH GIÁ SẢN PHẨM</h2>
                        <p className="text-gray-600 mb-6">Chia sẻ trải nghiệm của bạn về sản phẩm</p>

                        {/* Danh sách sản phẩm trong đơn hàng - Chỉ hiển thị nếu KHÔNG có preSelectedProduct */}
                        {!preSelectedProduct && orderDetails.orderDetails && orderDetails.orderDetails.length > 1 && (
                            <div className="mb-6">
                                <h3 className="font-semibold mb-3">Chọn sản phẩm để đánh giá</h3>
                                <div className="space-y-2">
                                    {orderDetails.orderDetails.map((item) => {
                                        const info = getProductDisplayInfo(item);
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => setSelectedProduct(item)}
                                                className={`bg-blue-50 rounded-lg p-4 flex items-center cursor-pointer border-2 transition ${
                                                    selectedProduct?.id === item.id
                                                        ? 'border-[#2C6B6E] bg-blue-100'
                                                        : 'border-transparent hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={info.image}
                                                        alt={info.name}
                                                        className="w-20 h-20 object-cover rounded-lg bg-white"
                                                    />
                                                </div>
                                                <div className="flex-1 ml-4">
                                                    <h4 className="font-semibold text-base">{info.name}</h4>
                                                    <p className="text-sm text-gray-600">
                                                        Phân loại: {info.variant}
                                                    </p>
                                                    <p className="text-teal-700 font-medium">
                                                        Giá: {formatCurrency(info.price)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">Số lượng: {info.quantity}</p>
                                                </div>
                                                {selectedProduct?.id === item.id && (
                                                    <div className="flex-shrink-0 text-[#2C6B6E]">
                                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Thông tin sản phẩm được chọn */}
                        {selectedProduct && (
                            <div className="bg-blue-50 rounded-lg p-4 mb-6 flex w-full items-center border-2 border-[#2C6B6E]" style={{minHeight: '120px'}}>
                                <div className="flex-shrink-0">
                                    <img
                                        src={getProductDisplayInfo(selectedProduct).image}
                                        alt={getProductDisplayInfo(selectedProduct).name}
                                        className="w-24 h-24 object-cover rounded-lg bg-white"
                                    />
                                </div>
                                <div className="flex-1 ml-6 flex flex-col justify-center text-left">
                                    <h3 className="font-semibold text-lg mb-1">
                                        {getProductDisplayInfo(selectedProduct).name}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                        Phân loại: {getProductDisplayInfo(selectedProduct).variant}
                                    </p>
                                    <p className="text-teal-700 font-medium">
                                        Giá: {formatCurrency(getProductDisplayInfo(selectedProduct).price)}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">Số lượng: {getProductDisplayInfo(selectedProduct).quantity}</p>
                                </div>
                            </div>
                        )}

                        {/* Đánh giá sao */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">Chất lượng sản phẩm</h3>
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="transition-transform hover:scale-110"
                                    >
                                        <Star
                                            size={40}
                                            className={`${
                                                star <= (hoverRating || rating)
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                                {rating > 0 && (
                                    <span className="ml-4 text-gray-600">
                                    {rating === 1 ? 'Tệ' :
                                        rating === 2 ? 'Bình thường' :
                                            rating === 3 ? 'Tốt' :
                                                rating === 4 ? 'Rất tốt' :
                                                    'Tuyệt vời'}
                                </span>
                                )}
                            </div>
                        </div>

                        {/* Nhận xét */}
                        <div className="mb-6">
                            <h3 className="font-semibold mb-3">Nhận xét của bạn</h3>
                            <textarea
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                                className="w-full border border-gray-300 rounded-lg p-4 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-[#2C6B6E] focus:border-transparent resize-none"
                                maxLength={500}
                            />
                            <div className="text-right text-sm text-gray-500 mt-1">
                                {review.length}/500 ký tự
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex justify-end gap-8 pt-6 border-t mt-6">
                            <button
                                onClick={handleCancel}
                                className="px-8 py-3 rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 transition font-medium shadow-none border-none"
                                style={{border: 'none'}}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-3 bg-[#2C6B6E] text-white rounded-lg hover:bg-[#235557] transition font-medium text-base"
                            >
                                Gửi đánh giá
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductReviewPage;