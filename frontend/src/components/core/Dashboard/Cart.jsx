import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity, clearCart } from '../../../services/slices/cartSlice';
import { buyOrder} from '../../../services/UserfeatureAPIs';
import { Link, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const Cart = () => {
  const dispatch = useDispatch();
  const { items, totalQuantity, totalPrice } = useSelector((state) => state.cart);
  const {user, accessToken} = useSelector((state)=>state.auth);
  const navigate = useNavigate();

  const handleQuantityChange = (productVariantId, newQuantity) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(productVariantId));
    } else {
      dispatch(updateQuantity({ productVariantId, quantity: newQuantity }));
    }
  };
  const handlePayment = ()=>{
    const productItems = items;
    if(accessToken){
        console.log("Button pressed...........");
        buyOrder(accessToken,productItems,user ,navigate, dispatch)
    }else{
        navigate('/auth')
    }
  }
  const handleRemoveItem = (productVariantId) => {
    dispatch(removeFromCart(productVariantId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart to get started</p>
          <button 
            onClick={()=>navigate('/shop')}
          className="bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Shopping Cart</h1>
        <button 
          onClick={handleClearCart}
          className="text-red-600 hover:text-red-800 underline text-sm"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.productVariantId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex gap-6">
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-xs">No Image</span>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                    <button
                      onClick={() => handleRemoveItem(item.productVariantId)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {item.color && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Colour:</span>
                        <span>{item.color}</span>
                      </div>
                    )}
                    {item.size && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Size:</span>
                        <span>{item.size}</span>
                      </div>
                    )}
                    {item.condition && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Condition:</span>
                        <span>{item.condition}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">Quantity:</span>
                      <div className="flex items-center border border-gray-300 rounded">
                        <button
                          onClick={() => handleQuantityChange(item.productVariantId, item.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border-x border-gray-300">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.productVariantId, item.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">€ {(item.price * item.quantity).toFixed(0)}</div>
                      <div className="text-sm text-gray-600">€ {item.price} each</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span>Items ({totalQuantity})</span>
                <span>€ {totalPrice.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>€ {totalPrice.toFixed(0)}</span>
                </div>
              </div>
            </div>

            <button className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 transition-colors mb-3"
                onClick={()=>handlePayment()}
            >
              Proceed to Checkout
            </button>
            
            <button className="w-full border border-gray-300 text-gray-700 py-3 rounded hover:bg-gray-50 transition-colors">
              Continue Shopping
            </button>

            {/* Shipping Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">Shipping</span>
              </div>
              <p className="text-sm text-gray-600">
                Free shipping on all orders. Expected delivery in 3-5 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;