import { Star } from 'lucide-react'

export default function ProductRating({ rating, reviewCount }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center bg-orange-500 text-white px-3 py-1.5 rounded text-xs font-bold gap-1">
                <span>{rating || 0}</span>
                <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-gray-500 text-xs">({reviewCount || 0})</span>
        </div>
    )
}
