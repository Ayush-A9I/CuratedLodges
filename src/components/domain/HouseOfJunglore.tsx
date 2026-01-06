    import styles from './HouseOfJunglore.module.css'

interface ProductCard {
  id: number
  category: string
  title: string
  image: string
}

const products: ProductCard[] = [
  {
    id: 1,
    category: 'Sustainable Safari Wear',
    title: 'APPAREL',
    image: 'https://houseofjunglore.com/cdn/shop/files/Comp_Image_hrkebvhrkebvhrke.webp?v=1765252418&width=1200'
  },
  {
    id: 2,
    category: 'Essential Transport',
    title: 'SAFARI GEAR',
    image: 'https://houseofjunglore.com/cdn/shop/files/Comp_Image_ejrsf8ejrsf8ejrs.webp?v=1765252417&width=800'
  },
  {
    id: 3,
    category: 'Exclusive park collections',
    title: 'NATIONAL PARKS',
    image: 'https://houseofjunglore.com/cdn/shop/files/Comp_Image_f8000af8000af800.webp?v=1765252417&width=800'
  },
  {
    id: 4,
    category: 'Essential wildlife reads',
    title: 'BOOKS',
    image: 'https://houseofjunglore.com/cdn/shop/files/Comp_Image_strqi1strqi1strq.webp?v=1765252418&width=800'
  }
]

export default function HouseOfJunglore() {
  return (
    <section className="py-20 px-8 bg-[#1E2D27]">
      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
          {/* Left Side - Content */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <p className="text-[#F1663F] text-xs md:text-sm font-semibold uppercase tracking-wider">
                  Lifestyle Artifacts
                </p>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                HOUSE OF<br />JUNGLORE<span className="text-[#F1663F]">.</span>
              </h2>
            </div>
            <p className="text-sm md:text-base text-white/70 font-light leading-relaxed max-w-lg">
              Gear for the wild, artifacts for the soul. Explore our collection of sustainable safari essentials and field gear designed for life on the move.
            </p>
          </div>

          {/* Right Side - Button */}
          <a 
            href="https://houseofjunglore.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-3 bg-[#F1663F] hover:bg-[#d55535] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 uppercase text-sm tracking-wide"
          >
            Visit Official Shop
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>

        {/* Product Cards - 4 in a row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div 
              key={product.id}
              className={styles.productCard}
            >
              <div className={styles.productImage}>
                <img 
                  src={product.image} 
                  alt={product.title}
                />
                <div className={styles.overlay} />
              </div>
              <div className={styles.productContent}>
                <p className={styles.category}>{product.category}</p>
                <h3 className={styles.title}>{product.title}</h3>
                <div className={styles.underline}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
