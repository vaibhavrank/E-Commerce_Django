import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart, CreditCard, ArrowLeft, Star, Truck, RotateCcw } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../services/slices/cartSlice';
 

const Demo = () => {
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('shipping');
  const {id} = useParams();
   
  const {items} = useSelector((state)=>state.cart)
  // Mock API call - replace with your actual API call
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Simulate API call delay 
        const BASE_URL = import.meta.env.VITE_BASE_URL;

        const rr =await fetch(`${BASE_URL}/api/auth/products/${id}`);
        const response = await rr.json();
        console.log(response);
        setProduct( response.product);
        setSelectedColor(response.product.available_colors[0]);
        setSelectedSize( response.product.available_sizes[0]);
        setLoading(false);
      } catch (error) {
        console.error('Error while fetching product:', error);
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  // Update selected variant when color or size changes
  useEffect(() => {
    if (product && selectedColor && selectedSize) {
      const variant = product.variants.find(v => 
        v.color.name === selectedColor && v.size.name === selectedSize
      );
      setSelectedVariant(variant);
    }
  }, [product, selectedColor, selectedSize]);

  const handleImageChange = (index) => {
    setSelectedImageIndex(index);
  };

  const handlePrevImage = () => {
    if (product?.images) {
      setSelectedImageIndex(prev => 
        prev === 0 ? product.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (product?.images) {
      setSelectedImageIndex(prev => 
        prev === product.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert('Please select color and size');
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: selectedVariant.price,
      image: product.images[0]?.url,
      variant: selectedVariant,
      quantity: quantity,
      color: selectedColor,
      size: selectedSize,
      productVariantId: selectedVariant.id,
    };
    
    dispatch(addToCart(cartItem));
    console.log("Item added to cart...........",items)
    alert('Product added to cart!');
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      alert('Please select color and size');
      return;
    }
    
    handleAddToCart();

    // Redirect to checkout or payment page
    alert('Redirecting to checkout...');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price || product.base_price;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button className="flex items-center text-gray-600 hover:text-gray-900 mr-4">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to overview
              </button>
            </div>
            <div className="text-2xl font-bold text-center flex-1">
              Thrift Shop
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                Sell your items
              </button>
              <button className="relative p-2">
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  0
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImageIndex]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
                  >
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all"
                  >
                    <ChevronRight className="h-6 w-6 text-gray-700" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex space-x-3">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => handleImageChange(index)}
                    className={`relative aspect-square w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex
                        ? 'border-gray-900'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="text-3xl font-bold text-gray-900">€ {currentPrice}</div>

            {/* Product Details */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Condition:</span>
                <span className="text-gray-900">Very good condition</span>
              </div>

              {/* Color Selection */}
              <div>
                <span className="font-medium text-gray-700 block mb-2">Colour:</span>
                <div className="flex space-x-2">
                  {product.available_colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border rounded-md transition-all ${
                        selectedColor === color
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <span className="font-medium text-gray-700 block mb-2">EU Size:</span>
                <div className="flex space-x-2">
                  {product.available_sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded-md transition-all ${
                        selectedSize === size
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stock Status */}
              {selectedVariant && (
                <div className="text-sm text-gray-600">
                  {selectedVariant.stock > 0 ? (
                    <span className="text-green-600">✓ In stock ({selectedVariant.stock} available)</span>
                  ) : (
                    <span className="text-red-600">✗ Out of stock</span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0}
                className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to cart</span>
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={!selectedVariant || selectedVariant.stock === 0}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <CreditCard className="h-5 w-5" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Tabs */}
            <div className="border-t pt-6">
              <div className="flex space-x-8 border-b">
                <button
                  onClick={() => setActiveTab('shipping')}
                  className={`pb-2 text-sm font-medium transition-colors ${
                    activeTab === 'shipping'
                      ? 'border-b-2 border-gray-900 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Shipping
                </button>
                <button
                  onClick={() => setActiveTab('returns')}
                  className={`pb-2 text-sm font-medium transition-colors ${
                    activeTab === 'returns'
                      ? 'border-b-2 border-gray-900 text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Returns
                </button>
              </div>

              <div className="pt-4">
                {activeTab === 'shipping' && (
                  <div className="flex items-start space-x-3">
                    <Truck className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-700">
                        Free shipping on orders over €50. Standard delivery takes 3-5 business days.
                        Express delivery available for €9.99.
                      </p>
                    </div>
                  </div>
                )}
                {activeTab === 'returns' && (
                  <div className="flex items-start space-x-3">
                    <RotateCcw className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-700">
                        30-day return policy. Items must be in original condition with tags attached.
                        Return shipping is free for defective items.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;