import React, { useEffect, useState } from 'react';
import { ArrowLeft, Package, Calendar, CreditCard, MapPin, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Orders = () => {
  // Sample data based on your API response
    const { accessToken } = useSelector((state) => state.auth);
    const [Orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/orders/my', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
            });

            if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch orders');
            }

            const data = await response.json();
            setOrders(data);
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.message);
            toast.error(`Error while fetching orders: ${err.message}`);
        } finally {
            setLoading(false);
        }
        };
         if (accessToken) { // Only fetch if accessToken is available
            fetchOrders();
        } else {
            setLoading(false); // If no token, stop loading and potentially show a message
            toast.warn("Please log in to view your orders.");
        }
    }, [accessToken]); // Re-run effect if accessToken changes


  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 15  ;
  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = Orders?.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(Orders?.length / ordersPerPage);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

   
  const OrderList = () => (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">MY ACCOUNT</h1>
          <h2 className="text-xl font-semibold text-gray-700">ORDERS</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Order No.
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-blue-600">#{order.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full  `}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    € {parseFloat(order.total_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      VIEW
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, Orders?.length)} of {Orders?.length} orders
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? 'bg-gray-800 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const OrderDetail = ({ order }) => (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <button
            onClick={() => setSelectedOrder(null)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK TO OVERVIEW
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Order details (#{order.id})
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Order #{order.id} was placed on {formatDate(order.created_at)} and is currently{' '}
            <span className={`font-medium ${order.status === 'PROCESSING' ? 'text-blue-600' : order.status === 'PENDING' ? 'text-yellow-600' : 'text-gray-600'}`}>
              {order.status.toLowerCase()}
            </span>.
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                PRODUCTS
              </h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          No. {String(index + 1).padStart(2, '0')} | {item.product_name}
                        </h4>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>Size: {item.size_name}</p>
                          <p>Color: {item.color_name}</p>
                          <p>Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          € {parseFloat(item.price_at_purchase).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Order Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Order Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${order.status === 'PROCESSING' ? 'text-blue-600' : order.status === 'PENDING' ? 'text-yellow-600' : 'text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span className={`font-medium ${order.is_paid ? 'text-green-600' : 'text-red-600'}`}>
                      {order.is_paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Shipping Address
                </h3>
                <p className="text-sm text-gray-700">{order.shipping_address}</p>
              </div>

              {/* Order Total */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>€ {parseFloat(order.subtotal_amount).toFixed(2)}</span>
                  </div>
                  {parseFloat(order.discount_amount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-€ {parseFloat(order.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span>€ {parseFloat(order.shipping_charge).toFixed(2)}</span>
                  </div>
                  {parseFloat(order.gst_amount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST ({parseFloat(order.gst_percentage)}%):</span>
                      <span>€ {parseFloat(order.gst_amount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>€ {parseFloat(order.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return selectedOrder ? <OrderDetail order={selectedOrder} /> : <OrderList />;
};

export default Orders;