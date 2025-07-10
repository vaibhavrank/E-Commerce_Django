import { Link } from 'react-router-dom';
import { formatPrice } from './utility/FormatPrice';
 

const ProductsGrid = ({ products }) => {
  if (!products.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No products found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product,index) => (
          <Link to={`/shop/${product.id}`} key={index} className="min-w-64 bg-white border-2 border-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className="bg-gray-100 relative">
              {product.main_image ? (
                <img
                  src={product.main_image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src="https://via.placeholder.com/300"
                  alt="Placeholder"
                  className="object-fill h-[350px] w-full"
                />
              )}
            </div>
            <div className="p-4">
              <h3 className="font-medium text-gray-800 mb-1">{product.name}</h3>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-gray-900">{formatPrice(product.base_price)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductsGrid;
