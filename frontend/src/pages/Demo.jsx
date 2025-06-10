import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../services/slices/cartSlice'; // Assuming cartSlice is in the same directory or adjust path
import ImageSwiper from '../components/ProductDetails/ImageSwiper'; // Import the new ImageSwiper component
import { useParams } from 'react-router-dom';

const ProductDetail = ({productId}) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // For swipable images
    const {id} = useParams();
    const dispatch = useDispatch();
    // const cartItems = useSelector((state) => state.cart.items); // Not directly used in render, but good to know it's accessible

    // Combine static images with fetched images
    const staticImages = [
        // { id: 'static1', url: '/image_c7bebc.jpg', is_main: false },
        // { id: 'static2', url: '/image_c7bbfb.jpg', is_main: false },
    ];

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const rr = await fetch(`http://localhost:8000/api/auth/products/${id}`); // Use productId prop
                const response = await rr.json();
                if (response.success) {
                    const fetchedProduct = response.product;
                    // Ensure images array exists, if not, initialize as empty
                    const fetchedImages = fetchedProduct.images || []; 
                    const allImages = [...fetchedImages, ...staticImages];
                    
                    setProduct({ ...fetchedProduct, allImages }); // Add allImages to product object
                    
                    if (allImages.length > 0) {
                        setCurrentImageIndex(0); // Start with the first image
                    }

                    // Set default selected size and color if available
                    if (fetchedProduct.available_sizes.length > 0) {
                        setSelectedSize(fetchedProduct.available_sizes[0]);
                    }
                    if (fetchedProduct.available_colors.length > 0) {
                        setSelectedColor(fetchedProduct.available_colors[0]);
                    }
                } else {
                    setError('Failed to fetch product data');
                }
            } catch (err) {
                setError('Error fetching product data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]); // Refetch if productId changes

    useEffect(() => {
        if (product) {
            const foundVariant = product.variants.find(
                (variant) =>
                    variant.size.name === selectedSize &&
                    variant.color.name === selectedColor &&
                    variant.in_stock
            );
            setSelectedVariant(foundVariant);
        }
    }, [selectedSize, selectedColor, product]);

    const handleAddToCart = () => {
        if (selectedVariant) {
            const itemToAdd = {
                productId: product.id,
                productVariantId: selectedVariant.id,
                name: product.name,
                price: parseFloat(selectedVariant.price),
                quantity: 1, // Always add 1 for simplicity, can be extended
                size: selectedVariant.size.name,
                color: selectedVariant.color.name,
                image: product.allImages[currentImageIndex]?.url, // Use current main image
            };
            dispatch(addToCart(itemToAdd));
            alert(`${product.name} (${selectedColor}, ${selectedSize}) added to cart!`);
        } else {
            alert('Please select an available size and color combination.');
        }
    };

    const handleSelectImage = (index) => {
        setCurrentImageIndex(index);
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            (prevIndex + 1) % (product.allImages.length || 1)
        );
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            (prevIndex - 1 + (product.allImages.length || 1)) % (product.allImages.length || 1)
        );
    };

    if (loading) return <div className="p-5 max-w-7xl mx-auto">Loading...</div>;
    if (error) return <div className="p-5 max-w-7xl mx-auto text-red-500">{error}</div>;
    if (!product) return <div className="p-5 max-w-7xl mx-auto">Product not found.</div>;

    const displayPrice = selectedVariant ? parseFloat(selectedVariant.price).toFixed(2) : parseFloat(product.base_price).toFixed(2);
    const displayCurrency = '€'; // Assuming Euro based on the image

    return (
        <div className="font-sans p-5 max-w-7xl mx-auto">
            <div className="mb-5 text-gray-600 cursor-pointer hover:underline">
                &lt; Back to overview
            </div>
            <div className="flex flex-col lg:flex-row gap-10 bg-white p-5 rounded-lg shadow-md">
                {/* Product Images Section - Using ImageSwiper */}
                <ImageSwiper
                    images={product.allImages}
                    currentImageIndex={currentImageIndex}
                    onSelectImage={handleSelectImage}
                    onNext={handleNextImage}
                    onPrev={handlePrevImage}
                />

                {/* Product Info Section */}
                <div className="lg:w-1/2 flex flex-col">
                    <h1 className="text-4xl font-semibold mb-2 text-gray-800">{product.name}</h1>
                    <p className="text-lg text-gray-600 mb-4">{product.description}</p>
                    <p className="text-3xl font-bold text-black mb-6">{displayCurrency} {displayPrice}</p>

                    <div className="mb-6">
                        <div className="flex items-center mb-3">
                            <span className="font-semibold w-24 text-gray-700">Condition:</span>
                            <span className="text-gray-600">Very good condition</span> {/* Hardcoded from image */}
                        </div>
                        <div className="flex items-center mb-3">
                            <span className="font-semibold w-24 text-gray-700">Colour:</span>
                            <div className="flex gap-2">
                                {product.available_colors.map((color) => (
                                    <button
                                        key={color}
                                        className={`w-8 h-8 rounded-full border-2 relative flex items-center justify-center
                                            ${selectedColor === color ? 'border-black' : 'border-gray-300'}
                                            ${color.toLowerCase().replace(/\s/g, '-') === 'white' ? 'bg-white' : ''}
                                            ${color.toLowerCase().replace(/\s/g, '-') === 'black' ? 'bg-black' : ''}
                                            ${color.toLowerCase().replace(/\s/g, '-') === 'yellow' ? 'bg-yellow-400' : ''}
                                            ${color.toLowerCase().replace(/\s/g, '-') === 'neavy blue' ? 'bg-blue-800' : ''} {/* Corrected for 'neavy blue' */}
                                            ${color.toLowerCase().replace(/\s/g, '-') === 'orange' ? 'bg-orange-500' : ''}
                                            cursor-pointer hover:border-gray-500`}
                                        onClick={() => setSelectedColor(color)}
                                    >
                                        {selectedColor === color && (
                                            <span className="text-white text-xl">✓</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center mb-3">
                            <span className="font-semibold w-24 text-gray-700">EU Size:</span>
                            <div className="flex gap-2">
                                {product.available_sizes.map((size) => (
                                    <button
                                        key={size}
                                        className={`px-4 py-2 border rounded-md transition-colors duration-200
                                            ${selectedSize === size ? 'bg-black text-white border-black' : 'bg-gray-100 text-gray-800 border-gray-300'}
                                            hover:bg-gray-200 hover:text-gray-900`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        className={`py-4 px-6 text-xl rounded-lg font-semibold transition-colors duration-300
                            ${!selectedVariant || selectedVariant.stock === 0
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-black text-white hover:bg-gray-800'
                            }`}
                        onClick={handleAddToCart}
                        disabled={!selectedVariant || selectedVariant.stock === 0}
                    >
                        {selectedVariant && selectedVariant.stock === 0 ? 'Out of Stock' : 'Add to cart'}
                    </button>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex mb-4">
                            <button className="py-2 px-4 font-bold border-b-2 border-black text-black">Shipping</button>
                            <button className="py-2 px-4 font-bold text-gray-600 hover:text-black">Returns</button>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;