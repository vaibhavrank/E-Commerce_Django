import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Heart, ShoppingBag, Users, Award, Sparkles } from 'lucide-react';

const ThriftShopPages = () => {
  const [currentPage, setCurrentPage] = useState('new');
  const [favorites, setFavorites] = useState(new Set());

  const toggleFavorite = (itemId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(itemId)) {
      newFavorites.delete(itemId);
    } else {
      newFavorites.add(itemId);
    }
    setFavorites(newFavorites);
  };

  // Sample data for new items
  const newItems = [
    {
      id: 1,
      name: "Vintage Chanel Quilted Bag",
      price: "$890",
      originalPrice: "$2,400",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop",
      condition: "Excellent",
      designer: "Chanel"
    },
    {
      id: 2,
      name: "Louis Vuitton Neverfull MM",
      price: "$1,200",
      originalPrice: "$1,800",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      condition: "Very Good",
      designer: "Louis Vuitton"
    },
    {
      id: 3,
      name: "Hermès Silk Scarf",
      price: "$320",
      originalPrice: "$450",
      image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&h=400&fit=crop",
      condition: "Excellent",
      designer: "Hermès"
    },
    {
      id: 4,
      name: "Gucci Bamboo Handle Bag",
      price: "$750",
      originalPrice: "$1,500",
      image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&h=400&fit=crop",
      condition: "Good",
      designer: "Gucci"
    },
    {
      id: 5,
      name: "Prada Saffiano Tote",
      price: "$680",
      originalPrice: "$1,200",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
      condition: "Very Good",
      designer: "Prada"
    },
    {
      id: 6,
      name: "Dior Saddle Bag",
      price: "$1,450",
      originalPrice: "$2,800",
      image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=400&fit=crop",
      condition: "Excellent",
      designer: "Dior"
    }
  ];

  // Sample data for designers
  const designers = [
    {
      id: 1,
      name: "Coco Chanel",
      brand: "Chanel",
      image: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=300&h=300&fit=crop",
      bio: "Gabrielle 'Coco' Chanel revolutionized women's fashion with her timeless designs and liberated women from the constraints of corseted silhouettes.",
      founded: "1910",
      specialty: "Luxury fashion, fragrances, and accessories",
      signature: "Little black dress, Chanel suit, quilted handbags"
    },
    {
      id: 2,
      name: "Louis Vuitton",
      brand: "Louis Vuitton",
      image: "https://images.unsplash.com/photo-1506629905607-d8b1d8a2e375?w=300&h=300&fit=crop",
      bio: "Founded as a trunk-making company, Louis Vuitton has evolved into the world's most valuable luxury brand, known for its iconic monogram and craftsmanship.",
      founded: "1854",
      specialty: "Leather goods, ready-to-wear, shoes, watches, and jewelry",
      signature: "Monogram canvas, Damier pattern, travel trunks"
    },
    {
      id: 3,
      name: "Thierry Hermès",
      brand: "Hermès",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
      bio: "Originally a harness and saddle maker, Hermès has maintained its commitment to exceptional craftsmanship and exclusivity for over 180 years.",
      founded: "1837",
      specialty: "Leather goods, silk scarves, perfumes, and luxury items",
      signature: "Birkin bag, Kelly bag, silk carré scarves"
    },
    {
      id: 4,
      name: "Guccio Gucci",
      brand: "Gucci",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop",
      bio: "Inspired by the elegant luggage he observed while working at luxury hotels, Guccio Gucci founded his leather goods company in Florence.",
      founded: "1921",
      specialty: "Fashion, leather goods, and luxury accessories",
      signature: "Bamboo handle bags, horsebit loafers, flora print"
    }
  ];

  const Navigation = () => (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentPage('shop')}
                className="text-gray-700 hover:text-gray-900 transition-colors"
              >
                Shop
              </button>
              <button
                onClick={() => setCurrentPage('new')}
                className={`transition-colors ${currentPage === 'new' ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900'}`}
              >
                New
              </button>
              <button
                onClick={() => setCurrentPage('designer')}
                className={`transition-colors ${currentPage === 'designer' ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900'}`}
              >
                Designer
              </button>
              <button
                onClick={() => setCurrentPage('about')}
                className={`transition-colors ${currentPage === 'about' ? 'text-gray-900 font-medium' : 'text-gray-700 hover:text-gray-900'}`}
              >
                About
              </button>
              <button className="text-gray-700 hover:text-gray-900 transition-colors">
                Sale
              </button>
            </div>
          </div>
          
          <div className="flex-1 flex justify-center">
            <h1 className="text-2xl font-serif text-gray-900">Thrift Shop</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="text-gray-700 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            <button className="text-gray-700 hover:text-gray-900">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
            <button className="text-gray-700 hover:text-gray-900 relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-gray-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );

  const NewPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white py-24">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 mr-3" />
            <h1 className="text-5xl font-serif">New Arrivals</h1>
          </div>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Discover the latest authenticated luxury pieces that have just arrived in our collection
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <Heart 
                    className={`w-5 h-5 ${favorites.has(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                  />
                </button>
                <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                  NEW
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 font-medium">{item.designer}</span>
                  <span className="text-sm text-green-600 font-medium">{item.condition}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.name}</h3>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-gray-900">{item.price}</span>
                    <span className="text-sm text-gray-500 line-through">{item.originalPrice}</span>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
                
                <button className="w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const DesignerPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white py-24">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Award className="w-8 h-8 mr-3" />
            <h1 className="text-5xl font-serif">Our Designers</h1>
          </div>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Meet the legendary designers whose creations define luxury and style
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {designers.map((designer) => (
            <div key={designer.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <img 
                    src={designer.image} 
                    alt={designer.name}
                    className="w-full h-48 md:h-full object-cover"
                  />
                </div>
                <div className="md:w-2/3 p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{designer.name}</h2>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      Est. {designer.founded}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">{designer.brand}</h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">{designer.bio}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Specialty</h4>
                      <p className="text-gray-600 text-sm">{designer.specialty}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Signature Pieces</h4>
                      <p className="text-gray-600 text-sm">{designer.signature}</p>
                    </div>
                  </div>
                  
                  <button className="mt-6 bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium">
                    View Collection
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const AboutPage = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="relative bg-gradient-to-r from-gray-900 to-gray-700 text-white py-24">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Users className="w-8 h-8 mr-3" />
            <h1 className="text-5xl font-serif">About Us</h1>
          </div>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Not your ordinary vintage store - we're redefining luxury resale
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
          <div>
            <h2 className="text-4xl font-serif text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Founded with a passion for sustainable luxury, Thrift Shop emerged from the belief that exceptional fashion should be accessible, authentic, and environmentally conscious. We're not just another vintage store - we're curators of timeless elegance.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Every piece in our collection is carefully authenticated by our team of experts, ensuring that you receive only genuine luxury items with verified provenance. We believe that pre-loved doesn't mean pre-compromised.
            </p>
          </div>
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop" 
              alt="Luxury boutique interior"
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-gray-900 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Authenticated Quality</h3>
            <p className="text-gray-600">
              Every item undergoes rigorous authentication by our certified experts to guarantee authenticity and quality.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-900 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Curated Selection</h3>
            <p className="text-gray-600">
              Our team handpicks only the finest pieces from the world's most prestigious luxury brands.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-900 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Sustainable Luxury</h3>
            <p className="text-gray-600">
              We're committed to sustainable fashion, giving luxury items a second life while reducing environmental impact.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                To democratize luxury fashion while promoting sustainability and authenticity. We believe everyone deserves access to beautiful, high-quality pieces that tell a story and stand the test of time.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">10K+</div>
                  <div className="text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-gray-600">Items Authenticated</div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=400&fit=crop" 
                alt="Luxury fashion authentication process"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentPage = () => {
    switch(currentPage) {
      case 'new':
        return <NewPage />;
      case 'designer':
        return <DesignerPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <NewPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      {renderCurrentPage()}
      
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-serif mb-4">Thrift Shop</h3>
            <p className="text-gray-400 mb-6">Not your ordinary vintage store</p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400 text-sm">
              © 2025 Thrift Shop. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ThriftShopPages;