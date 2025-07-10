// src/services/UserfeatureAPIs.js

import { clearCart } from './slices/cartSlice'; // To clear cart after successful order
import { createStandaloneToast } from '@chakra-ui/toast'   // Assuming you use Chakra UI for toasts
// If not using Chakra UI, replace with your preferred notification system (e.g., react-toastify)
const { toast } = createStandaloneToast(); 

const API_BASE_URL = 'http://localhost:8000/api/auth'; // Your Django backend URL

// Function to dynamically load the Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (document.getElementById('razorpay-checkout-script')) {
            resolve(true); // Script already loaded
            return;
        }
        const script = document.createElement('script');
        script.id = 'razorpay-checkout-script';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => {
            console.error('Failed to load Razorpay script.');
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

export const buyOrder = async (accessToken, cartItems, user, navigate, dispatch) => {
    // 1. Prepare order items for backend
    console.log("Function called/..............")
    const orderItems = cartItems.map(item => ({
        product_variant_id: item.productVariantId,
        quantity: item.quantity,
        price_at_purchase: item.price, // Send the price from cart, server will confirm
    }));

    // Assume shipping_address is taken from user.address, or you could get it from a form
    const shippingAddress = user?.address || "Default User Address from Profile"; // Fallback if user.address is not set

    // For simplicity, let's assume no coupon, default shipping and GST for this flow
    const orderData = {
        items: orderItems,
        shipping_address: shippingAddress,
        coupon_code: "", // You could add a form field for this
        shipping_charge: 0.00, // You could add a form field for this
        gst_percentage: 0.00, // You could add a form field for this
    };

    let orderId = null; // To store the backend order ID
    let razorpayOrderId = null; // To store Razorpay's order ID

    try {
        // Ensure Razorpay script is loaded
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            toast({
                title: 'Payment Error',
                description: 'Failed to load payment script. Please try again.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
            return;
        }
        // console.log(orderData);
        // return;
        // 2. Create Order on your backend
        const createOrderResponse = await fetch(`${API_BASE_URL}/orders/create/`, {
            method: 'POST',
            headers: {
                "Authorization":`Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData),
        });
        // const createOrderResponse = await rr.json();
        // console.log(createOrderResponse);
        // return;
        if (!createOrderResponse.ok) {
            const errorData = await createOrderResponse.json();
            throw new Error(errorData.detail || JSON.stringify(errorData) || 'Failed to create order on backend.');
        }

        const orderDetails = await createOrderResponse.json();
        orderId = orderDetails.id; // Store your backend order ID
        // razorpayOrderId = orderDetails.razorpay_order_id;
        const totalOrderAmount = orderDetails.total_amount; // Get the calculated total amount from backend

        console.log("create order response",orderDetails);
        // 3. Initiate Payment with Razorpay (via your backend)
        // const initiatePaymentHeaders = getAuthHeaders();
        const initiatePaymentResponse = await fetch(`${API_BASE_URL}/orders/${orderId}/payment/initiate/`, {
            method: 'POST',
             headers: {
                "Authorization":`Bearer ${accessToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ method: 'razorpay' }),
        });

        if (!initiatePaymentResponse.ok) {
            const errorData = await initiatePaymentResponse.json();
            throw new Error(errorData.detail || JSON.stringify(errorData) || 'Failed to initiate Razorpay payment.');
        }

        const razorpayPaymentDetails = await initiatePaymentResponse.json();
        console.log("Payment Initiated Respose.............",razorpayPaymentDetails)
        
        razorpayOrderId = razorpayPaymentDetails.razorpay_order_id;
        const razorpayKeyId = razorpayPaymentDetails.key_id;
        const razorpayAmount = razorpayPaymentDetails.amount_paid; // This is the total_amount from your backend
        const razorpayCurrency = razorpayPaymentDetails.currency;
        // console.log(import.meta.env.VITE_RAZORPAY_KEY_ID); // Should print your actual key

        // 4. Open Razorpay Checkout Modal
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: (parseFloat(razorpayAmount) * 100).toFixed(0), // Amount in paisa
            currency: "INR",
            name: "Your Store Name", // Your business name
            description: `Payment for Order #${orderId}`,
            order_id: razorpayOrderId, // Razorpay Order ID
            handler: function(response){
                const { razorpay_payment_id,
                        razorpay_order_id,
                        razorpay_signature
                    } = response
                    console.log("VErisfy payment data.....",response)
                verifyPayment({razorpay_order_id,razorpay_payment_id,razorpay_signature,accessToken});
                dispatch(clearCart())
            } ,
            prefill: {
                name: user?.first_name ? `${user.first_name} ${user.last_name}` : "Customer Name",
                email: user?.email || "customer@example.com",
                contact: user?.phone_number || "9687798433", // Ensure you have phone_number in your User model
            },
            notes: {
                order_id: orderId, // Your backend order ID
            },
            theme: {
                color: "#3399CC",
            },
        };
        console.log("OPTINS..............",options);
        // return;
        const rzp1 = new window.Razorpay(options);

        rzp1.on('payment.failed', function (response) {
            // This handler is for failures directly from Razorpay modal (e.g., user cancels)
            const errorDescription = response.error.description || "Payment was cancelled or failed.";
            toast({
                title: 'Payment Failed',
                description: errorDescription,
                status: 'error',
                duration: 9000,
                isClosable: true,
            });
            // You might want to update the order status on backend to 'FAILED' or 'PENDING' based on this
            // For now, it's assumed the backend order remains 'PENDING' unless webhook or verify succeeds.
            console.error("Razorpay Payment Failed: ", response.error);
        });

        rzp1.open();

    } catch (error) {
        console.error("Order or Payment Error:", error);
        toast({
            title: 'Order/Payment Error',
            description: error.message,
            status: 'error',
            duration: 9000,
            isClosable: true,
        });

        // Optional: If order creation failed, you might want to clean up if partial data was saved
        // This is tricky without transaction management across frontend/backend, which webhooks solve.
        // For now, if initial order creation fails, nothing further happens.
    }
};






import axios from 'axios';

const verifyPayment = async ({razorpay_order_id,
  razorpay_payment_id,
  
  razorpay_signature,
  accessToken
}) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/payments/verify/`,
      {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    console.log("verify respomse",response);
    return response.data;
  } catch (error) {
    console.error("Payment verification error:", error.response?.data || error.message);
    throw error;
  }
};
