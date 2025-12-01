import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Star, Upload, Video, X, ChevronLeft } from 'lucide-react';

const ProductReviewPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Lấy thông tin sản phẩm từ navigation state (hoặc dùng mặc định)
    const product = location.state?.product || {
        id: 1,
        name: 'Serum Dưỡng Ẩm Biển Sâu',
        category: 'Skin - Dưỡng da',
        price: 430000,
        image: 'https://via.placeholder.com/100'
    };

    // States
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [review, setReview] = useState('');
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    // Danh sách các tag đánh giá nhanh
    const quickTags = [
        'Chất lượng tốt',
        'Đóng gói cẩn thận',
        'Giao hàng nhanh',
        'Đúng mô tả',
        'Sẽ mua lại'
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setImages([...images, ...newImages]);
    };

    const handleVideoUpload = (e) => {
        const files = Array.from(e.target.files);
        const newVideos = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setVideos([...videos, ...newVideos]);
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const removeVideo = (index) => {
        const newVideos = videos.filter((_, i) => i !== index);
        setVideos(newVideos);
    };

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            alert('Vui lòng chọn số sao đánh giá!');
            return;
        }

        // Tạo FormData để gửi kèm file
        const formData = new FormData();
        formData.append('productId', product.id);
        formData.append('rating', rating);
        formData.append('review', review);
        formData.append('tags', JSON.stringify(selectedTags));
        
        // Thêm images
        images.forEach((img, index) => {
            formData.append('images', img.file);
        });
        
        // Thêm videos
        videos.forEach((vid, index) => {
            formData.append('videos', vid.file);
        });

        try {
            // TODO: Gọi API gửi đánh giá
            // await axios.post('/api/reviews', formData);
            
            console.log('Đánh giá:', {
                productId: product.id,
                rating,
                review,
                tags: selectedTags,
                imageCount: images.length,
                videoCount: videos.length
            });
            
            alert('Gửi đánh giá thành công!');
            navigate('/order'); // Quay về trang đơn hàng
        } catch (error) {
            console.error('Lỗi khi gửi đánh giá:', error);
            alert('Có lỗi xảy ra, vui lòng thử lại!');
        }
    };

    const handleCancel = () => {
        if (rating > 0 || review.trim() || images.length > 0 || videos.length > 0) {
            if (window.confirm('Bạn có chắc muốn hủy? Các thông tin đã nhập sẽ bị mất.')) {
                navigate(-1);
            }
        } else {
            navigate(-1);
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
                    <p className="text-gray-600 mb-6">Chỉ sẽ trải nghiệm của bạn về sản phẩm</p>

                    {/* Thông tin sản phẩm */}
                    <div className="bg-blue-50 rounded-lg p-4 mb-6 flex w-full items-center" style={{minHeight: '120px'}}>
                        <div className="flex-shrink-0">
                            <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-24 h-24 object-cover rounded-lg bg-white"
                            />
                        </div>
                        <div className="flex-1 ml-6 flex flex-col justify-center text-left">
                            <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-600 mb-1">
                                Phân loại: {product.category}
                            </p>
                            <p className="text-teal-700 font-medium">
                                Giá: {formatCurrency(product.price)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Số lượng: 1</p>
                        </div>
                    </div>

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
                            <span className="ml-4 text-gray-600">
                                {rating === 0 ? 'Rất tệ' : 
                                 rating === 1 ? 'Tệ' :
                                 rating === 2 ? 'Bình thường' :
                                 rating === 3 ? 'Tốt' :
                                 rating === 4 ? 'Tuyệt vời' :
                                 'Tuyệt vời'}
                            </span>
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

                    {/* Upload hình ảnh/video */}
                    <div className="mb-6">
                        <h3 className="font-semibold mb-3">
                            Thêm hình ảnh/video (tùy chọn)
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Tối đa 5 hình ảnh và 1 video
                            <br />
                            Định dạng: JPG, PNG, MP4. Kích thước tối đa: 10MB
                        </p>
                        
                        <div className="flex gap-4 flex-wrap">
                            {/* Hiển thị ảnh đã upload */}
                            {images.map((img, index) => (
                                <div key={index} className="relative w-24 h-24">
                                    <img
                                        src={img.preview}
                                        alt={`Preview ${index}`}
                                        className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}

                            {/* Hiển thị video đã upload */}
                            {videos.map((vid, index) => (
                                <div key={index} className="relative w-24 h-24">
                                    <video
                                        src={vid.preview}
                                        className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                                    />
                                    <button
                                        onClick={() => removeVideo(index)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    >
                                        <X size={16} />
                                    </button>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Video className="text-white opacity-80" size={32} />
                                    </div>
                                </div>
                            ))}

                            {/* Button upload ảnh */}
                            {images.length < 5 && (
                                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#2C6B6E] hover:bg-gray-50 transition">
                                    <Upload size={24} className="text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500">Ảnh</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/jpg"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}

                            {/* Button upload video */}
                            {videos.length < 1 && (
                                <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#2C6B6E] hover:bg-gray-50 transition">
                                    <Video size={24} className="text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500">Video</span>
                                    <input
                                        type="file"
                                        accept="video/mp4"
                                        onChange={handleVideoUpload}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Tag đánh giá nhanh */}
                    <div className="mb-8">
                        <h3 className="font-semibold mb-3">Đánh giá nhanh</h3>
                        <div className="flex flex-wrap gap-2">
                            {quickTags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={`px-4 py-2 rounded-full text-sm transition ${
                                        selectedTags.includes(tag)
                                            ? 'bg-[#2C6B6E] text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
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
