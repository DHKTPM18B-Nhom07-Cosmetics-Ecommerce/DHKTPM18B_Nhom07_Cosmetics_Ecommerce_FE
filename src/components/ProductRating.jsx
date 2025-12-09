import { Star } from 'lucide-react'

const formatSold = (count) => {
    if (!count) return "0";
    if (count < 1000) return count;

    // Divide by 1000, keep 1 decimal
    const k = (count / 1000).toFixed(1);

    // Replace dot with comma for VN style and remove .0 if integer
    return k.replace('.', ',').replace(',0', '') + 'k';
};

export default function ProductRating({ rating, soldCount }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center bg-orange-500 text-white px-3 py-1.5 rounded text-xs font-bold gap-1">
                <span>{rating || 0}</span>
                <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-gray-500 text-xs">{formatSold(soldCount)} Đã bán</span>
        </div>
    )
}
