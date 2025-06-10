import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Menu, X } from 'lucide-react'; // Import Menu and X icons
import { Link } from 'react-router-dom';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('');

  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);

  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    colors: [],
    sizes: []
  });

  const [expandedFilters, setExpandedFilters] = useState({
    categories: true,
    color: true,
    size: true
  });

  // State for mobile sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleFilter = (filterType) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const formatPrice = (price) => {
    return `€ ${parseFloat(price).toFixed(0)}`;
  };

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();

    selectedFilters.categories.forEach(category => params.append('categories', category));
    selectedFilters.colors.forEach(color => params.append('colors', color));
    selectedFilters.sizes.forEach(size => params.append('sizes', size));

    if (sortBy) {
      params.append('sort_by', sortBy);
    }

    return `http://localhost:8000/api/auth/products?${params.toString()}`;
  }, [selectedFilters, sortBy]);

  useEffect(() => {
    const fetchProductsAndFilters = async () => {
      setLoading(true);
      setError(null);
      const url = buildApiUrl();

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.products || []);

        if (data.filters_data) {
          setAvailableCategories(data.filters_data.categories.map(cat => cat.name) || []);
          setAvailableColors(data.filters_data.colors.map(col => col.name) || []);
          setAvailableSizes(data.filters_data.sizes.map(s => s.name) || []);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndFilters();
  }, [selectedFilters, sortBy, buildApiUrl]);

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => {
      const currentFilters = prev[filterType];
      if (currentFilters.includes(value)) {
        return {
          ...prev,
          [filterType]: currentFilters.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          [filterType]: [...currentFilters, value]
        };
      }
    });
  };

  const displayedProducts = products;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="w-[80%] mx-auto mt-10 bg-gray-50">
      <div className="flex flex-col items-between gap-3 mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold md:block hidden text-gray-800">Shop</h1>
          <div className="sm:flex hidden  items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </select>
          </div>
          {/* Mobile Filter Button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
        </div>
        <div className='h-[1px] w-full blur-[0.1px] bg-black '></div>
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden md:block max-w-64 bg-white rounded-lg shadow-sm p-6 h-fit">
            {/* Filter content (Categories, Color, Size, Clear Filters) */}
            {/* Categories Filter */}
            <div className="mb-6">
              <div
                className="flex justify-between items-center cursor-pointer mb-3"
                onClick={() => toggleFilter('categories')}
              >
                <h3 className="font-semibold text-gray-800">Categories</h3>
                {expandedFilters.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {expandedFilters.categories && (
                <div className="space-y-2">
                  {availableCategories.map((categoryName) => (
                    <label key={categoryName} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 w-4 h-4 text-blue-600 rounded"
                        checked={selectedFilters.categories.includes(categoryName)}
                        onChange={() => handleFilterChange('categories', categoryName)}
                      />
                      <span className="text-sm text-gray-700">{categoryName}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Color Filter */}
            <div className="mb-6">
              <div
                className="flex justify-between items-center cursor-pointer mb-3"
                onClick={() => toggleFilter('color')}
              >
                <h3 className="font-semibold text-gray-800">Colour</h3>
                {expandedFilters.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {expandedFilters.color && (
                <div className="space-y-2">
                  {availableColors.map((colorName) => (
                    <label key={colorName} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 w-4 h-4 text-blue-600 rounded"
                        checked={selectedFilters.colors.includes(colorName)}
                        onChange={() => handleFilterChange('colors', colorName)}
                      />
                      <span className="text-sm text-gray-700">{colorName}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Size Filter */}
            <div className="mb-6">
              <div
                className="flex justify-between items-center cursor-pointer mb-3"
                onClick={() => toggleFilter('size')}
              >
                <h3 className="font-semibold text-gray-800">International Size</h3>
                {expandedFilters.size ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {expandedFilters.size && (
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map((sizeName) => (
                    <label key={sizeName} className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedFilters.sizes.includes(sizeName)}
                        onChange={() => handleFilterChange('sizes', sizeName)}
                      />
                      <span className={`text-sm border px-2 py-1 cursor-pointer transition-colors ${
                          selectedFilters.sizes.includes(sizeName)
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}>
                        {sizeName}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => setSelectedFilters({ categories: [], colors: [], sizes: [] })}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear all filters
            </button>
          </div>

          {/* Mobile Sidebar */}
          <div
            className={`fixed inset-y-0 left-0 bg-white w-64 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                <button
                  className="p-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex-grow overflow-y-auto">
                {/* Filter content (Categories, Color, Size, Clear Filters) - Duplicated for mobile for now */}
                {/* Categories Filter */}
                <div className="mb-6">
                  <div
                    className="flex justify-between items-center cursor-pointer mb-3"
                    onClick={() => toggleFilter('categories')}
                  >
                    <h3 className="font-semibold text-gray-800">Categories</h3>
                    {expandedFilters.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  {expandedFilters.categories && (
                    <div className="space-y-2">
                      {availableCategories.map((categoryName) => (
                        <label key={categoryName} className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2 w-4 h-4 text-blue-600 rounded"
                            checked={selectedFilters.categories.includes(categoryName)}
                            onChange={() => handleFilterChange('categories', categoryName)}
                          />
                          <span className="text-sm text-gray-700">{categoryName}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Color Filter */}
                <div className="mb-6">
                  <div
                    className="flex justify-between items-center cursor-pointer mb-3"
                    onClick={() => toggleFilter('color')}
                  >
                    <h3 className="font-semibold text-gray-800">Colour</h3>
                    {expandedFilters.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  {expandedFilters.color && (
                    <div className="space-y-2">
                      {availableColors.map((colorName) => (
                        <label key={colorName} className="flex items-center">
                          <input
                            type="checkbox"
                            className="mr-2 w-4 h-4 text-blue-600 rounded"
                            checked={selectedFilters.colors.includes(colorName)}
                            onChange={() => handleFilterChange('colors', colorName)}
                          />
                          <span className="text-sm text-gray-700">{colorName}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Size Filter */}
                <div className="mb-6">
                  <div
                    className="flex justify-between items-center cursor-pointer mb-3"
                    onClick={() => toggleFilter('size')}
                  >
                    <h3 className="font-semibold text-gray-800">International Size</h3>
                    {expandedFilters.size ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  {expandedFilters.size && (
                    <div className="grid grid-cols-4 gap-2">
                      {availableSizes.map((sizeName) => (
                        <label key={sizeName} className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={selectedFilters.sizes.includes(sizeName)}
                            onChange={() => handleFilterChange('sizes', sizeName)}
                          />
                          <span className={`text-sm border px-2 py-1 cursor-pointer transition-colors ${
                              selectedFilters.sizes.includes(sizeName)
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                            }`}>
                            {sizeName}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedFilters({ categories: [], colors: [], sizes: [] })}
                  className="text-sm text-blue-600 hover:text-blue-800 underline w-full text-left"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>

          {/* Overlay for mobile sidebar */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {displayedProducts.length === 0 && !loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProducts.map((product) => (
                  <Link to={`/shop/${product.id}`} key={product.id} className="min-w-64 bg-white border-2 border-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-gray-100 relative">
                      {product.main_image ? (
                        <img
                          src={product.main_image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src="https://via.placeholder.com/300" // Fallback image if main_image is null
                          alt="Placeholder"
                          className="object-fill h-[350px] w-full"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-800 mb-1">{product.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-gray-900">
                          {formatPrice(product.base_price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;