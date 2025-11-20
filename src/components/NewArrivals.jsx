import { useState } from 'react';
import { GoHeart } from 'react-icons/go';
import { FaStar } from 'react-icons/fa6';
import { FaCartPlus } from 'react-icons/fa';
const products = [
    {
        id: 1,
        name: 'Facial Serum',
        category: 'Skincare',
        price: '$45.00',
        image: '/blue-facial-serum-bottle.jpg',
        rating: 4.3,
    },
    {
        id: 2,
        name: 'Pearl Moisturizer',
        category: 'Skincare',
        price: '$59.00',
        image: '/white-moisturizer-cream-jar.jpg',
        rating: 4.3,
    },
    {
        id: 3,
        name: 'Indigo Eye Serum',
        category: 'Skincare',
        price: '$45.00',
        image: '/purple-eye-serum-bottle.jpg',
        rating: 4.3,
    },
    {
        id: 4,
        name: 'Bath Essentials',
        category: 'Wellness',
        price: '$35.00',
        image: '/bath-products-arrangement.jpg',
        rating: 4.3,
    },
];

export default function NewArrivals() {
    const [selectedProduct, setSelectedProduct] = useState(null);

    return (
        <section className="max-w-7xl mx-auto px-4 py-20">
            <div className="flex justify-between items-center mb-12">
                <div>
                    <h2 className="text-3xl font-light text-[#2E5F6D] mb-2">
                        NEW ARRIVALS
                    </h2>
                </div>
                <button className="text-prim hover:text-[#234852] transition text-sm font-medium">
                    View All →
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                    <div
                        key={product.id}
                        className="group cursor-pointer bg-secondary rounded-lg p-6"
                        onClick={() => setSelectedProduct(product)}>
                        {/* Hình ảnh + Trái tim */}
                        <div className="relative bg-accent rounded-lg overflow-hidden mb-6 h-72 flex items-center justify-center">
                            <img
                                src={product.image || '/placeholder.svg'}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                            {/* Biểu tượng trái tim */}
                            <GoHeart className="absolute top-4 right-4 w-6 h-6 text-primary hover:fill-current transition" />
                        </div>

                        {/* Tên brand */}
                        <p className="text-secondary text-sm mb-2">
                            {product.category}
                        </p>

                        {/* Tên sản phẩm */}
                        <h3 className="text-primary font-medium mb-4">
                            {product.name}
                        </h3>

                        {/* Rating */}
                        <div className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg w-fit mb-4">
                            <span className="font-semibold">
                                {product.rating}
                            </span>
                            <FaStar className="w-4 h-4" />
                        </div>

                        {/* Giá + Nút Thêm */}
                        <div className="flex items-center justify-between">
                            <span className="text-primary font-bold text-xl">
                                {product.price}
                            </span>
                            <button className="bg-primary text-white h-10 w-10   rounded-lg hover:bg-accent transition flex items-center justify-center">
                                <FaCartPlus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
