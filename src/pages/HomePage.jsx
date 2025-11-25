import Header from '../components/Header'
import Hero from '../components/Hero'
import CategoryShop from '../components/CategoryShop'
import NewArrivals from '../components/NewArrivals'
import PartnerBrands from '../components/PartnerBrands'
import Footer from '../components/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <CategoryShop />
      <NewArrivals />
      <PartnerBrands />
    </div>
  )
}
