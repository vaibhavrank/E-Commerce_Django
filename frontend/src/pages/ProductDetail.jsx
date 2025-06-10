import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../services/slices/cartSlice'; // Assuming cartSlice is in the same directory or adjust path
import '../assets/ProductDetail.css'
import { useParams } from 'react-router-dom';
const ProductDetail = ({ productId }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [mainImage, setMainImage] = useState('');

    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.items);
    const {id} = useParams();
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // In a real application, you'd fetch from your API endpoint
                // For this example, we'll use the provided JSON directly
                // const response = {
                //     "success": true,
                //     "product": {
                //         "id": 2,
                //         "name": "Lvy & Oak Set",
                //         "description": "good design and better quality",
                //         "base_price": "1230.00",
                //         "category": {
                //             "id": 3,
                //             "name": "Clothing",
                //             "description": "better price then market, best quality among the market",
                //             "image": "https://res.cloudinary.com/diyy4con2/image/upload/v1749546903/thumb-slide-1_cbzz50.jpg"
                //         },
                //         "images": [
                //             {
                //                 "id": 11,
                //                 "url": "https://res.cloudinary.com/diyy4con2/image/upload/v1749546903/thumb-slide-1_cbzz50.jpg",
                //                 "is_main": true
                //             }
                //         ],
                //         "variants": [
                //             {
                //                 "id": 4,
                //                 "size": {
                //                     "id": 7,
                //                     "name": "56"
                //                 },
                //                 "color": {
                //                     "id": 4,
                //                     "name": "Yellow",
                //                     "hex_code": ""
                //                 },
                //                 "stock": 3,
                //                 "price": "1230.00",
                //                 "in_stock": true
                //             },
                //             {
                //                 "id": 5,
                //                 "size": {
                //                     "id": 8,
                //                     "name": "25"
                //                 },
                //                 "color": {
                //                     "id": 6,
                //                     "name": "Neavy blue",
                //                     "hex_code": ""
                //                 },
                //                 "stock": 2,
                //                 "price": "452.00",
                //                 "in_stock": true
                //             },
                //             {
                //                 "id": 6,
                //                 "size": {
                //                     "id": 1,
                //                     "name": "21"
                //                 },
                //                 "color": {
                //                     "id": 5,
                //                     "name": "Orange",
                //                     "hex_code": ""
                //                 },
                //                 "stock": 0,
                //                 "price": "2356.00",
                //                 "in_stock": false
                //             },
                //             {
                //                 "id": 7,
                //                 "size": {
                //                     "id": 3,
                //                     "name": "34"
                //                 },
                //                 "color": {
                //                     "id": 3,
                //                     "name": "Black",
                //                     "hex_code": ""
                //                 },
                //                 "stock": 5,
                //                 "price": "452.00",
                //                 "in_stock": true
                //             }
                //         ],
                //         "available_colors": [
                //             "Black",
                //             "Neavy blue",
                //             "Orange",
                //             "Yellow"
                //         ],
                //         "available_sizes": [
                //             "21",
                //             "25",
                //             "34",
                //             "56"
                //         ],
                //         "in_stock": true,
                //         "created_at": "2025-06-10T09:29:11.019692+00:00",
                //         "related_products": [
                //             {
                //                 "id": 1,
                //                 "name": "Gucci Bag",
                //                 "base_price": "523.00",
                //                 "main_image": "https://res.cloudinary.com/diyy4con2/image/upload/v1749546941/h_pro_img_1_njktfz.jpg",
                //                 "in_stock": true
                //             },
                //             {
                //                 "id": 5,
                //                 "name": "Hugo Bos Bagger",
                //                 "base_price": "1235.00",
                //                 "main_image": "https://res.cloudinary.com/diyy4con2/image/upload/v1749546930/insta_img_5_d9w4r5.jpg",
                //                 "in_stock": true
                //             }
                //         ]
                //     }
                // };
                const pp = await fetch(`http://localhost:8000/api/auth/products/${id}`);
                const response = await pp.json();
                if (response.success) {
                    setProduct(response.product);
                    setMainImage(response.product.images[0]?.url || '');
                    // Set default selected size and color if available
                    if (response.product.available_sizes.length > 0) {
                        setSelectedSize(response.product.available_sizes[0]);
                    }
                    if (response.product.available_colors.length > 0) {
                        setSelectedColor(response.product.available_colors[0]);
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
    }, [productId]); // Refetch if productId changes

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
                image: mainImage,
            };
            dispatch(addToCart(itemToAdd));
            alert(`${product.name} (${selectedColor}, ${selectedSize}) added to cart!`);
        } else {
            alert('Please select an available size and color combination.');
        }
    };

    if (loading) return <div className="product-detail-container">Loading...</div>;
    if (error) return <div className="product-detail-container error">{error}</div>;
    if (!product) return <div className="product-detail-container">Product not found.</div>;

    // Determine the price to display
    const displayPrice = selectedVariant ? parseFloat(selectedVariant.price).toFixed(2) : parseFloat(product.base_price).toFixed(2);
    const displayCurrency = '€'; // Assuming Euro based on the image

    return (
        <div className="product-detail-page">
            <div className="back-to-overview">
                &lt; Back to overview
            </div>
            <div className="product-detail-container">
                <div className="product-images">
                    <div className="thumbnail-gallery">
                        {product.images.map((img) => (
                            <img
                                key={img.id}
                                src={img.url}
                                alt={product.name}
                                className={img.url === mainImage ? 'active' : ''}
                                onClick={() => setMainImage(img.url)}
                            />
                        ))}
                         {/* Additional static images from the prompt
                         <img src="/image_c7bbfb.jpg" alt="product view 2" onClick={() => setMainImage("/image_c7bbfb.jpg")} />
                         <img src="/image_c7bebc.jpg" alt="product view 3" onClick={() => setMainImage("/image_c7bebc.jpg")} /> */}
                    </div>
                    <div className="main-image-container">
                        <img src={mainImage} alt={product.name} className="main-product-image" />
                        <div className="image-nav-arrows">
                            <button className="arrow left-arrow">&lt;</button>
                            <button className="arrow right-arrow">&gt;</button>
                        </div>
                    </div>
                </div>

                <div className="product-info">
                    <h1 className="product-name">{product.name}</h1>
                    <p className="product-description">{product.description}</p>
                    <p className="product-price">{displayCurrency} {displayPrice}</p>

                    <div className="product-attributes">
                        {/* <div className="attribute-item"> */}
                            {/* <span className="attribute-label">Condition:</span> */}
                            {/* <span className="attribute-value">Very good condition</span> Hardcoded from image */}
                        {/* </div> */}
                        <div className="attribute-item">
                            <span className="attribute-label">Colour:</span>
                            <div className="color-options">
                                {product.available_colors.map((color) => (
                                    <button
                                        key={color}
                                        className={`color-dot ${color.toLowerCase().replace(/\s/g, '-')}`}
                                        style={{ backgroundColor: color.toLowerCase().replace('neavy blue', 'navy') }}
                                        onClick={() => setSelectedColor(color)}
                                    >
                                        {selectedColor === color && <span className="selected-indicator">✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="attribute-item">
                            <span className="attribute-label">EU Size:</span>
                            <div className="size-options">
                                {product.available_sizes.map((size) => (
                                    <button
                                        key={size}
                                        className={`size-box ${selectedSize === size ? 'selected' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button
                        className="add-to-cart-button"
                        onClick={handleAddToCart}
                        disabled={!selectedVariant || selectedVariant.stock === 0}
                    >
                        {selectedVariant && selectedVariant.stock === 0 ? 'Out of Stock' : 'Add to cart'}
                    </button>

                    <div className="shipping-returns">
                        <button className="shipping-button active">Shipping</button>
                        <button className="returns-button">Returns</button>
                        <p className="shipping-text">
                            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;