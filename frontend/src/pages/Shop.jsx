import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Import useLocation and useNavigate
import { IoChevronBackCircleOutline, IoChevronForwardCircleOutline } from 'react-icons/io5';
import Pagination from '../components/core/Shop/Pagination';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);

  // State for mobile sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [expandedFilters, setExpandedFilters] = useState(() => {
    // Initialize from local storage or default
    const savedExpandedFilters = localStorage.getItem('expandedFilters');
    return savedExpandedFilters ? JSON.parse(savedExpandedFilters) : {
      categories: true,
      color: true,
      size: true
    };
  });

  // Use useLocation and useNavigate hooks
  const location = useLocation();
  const navigate = useNavigate();

  // Initialize state from URL parameters
  const [sortBy, setSortBy] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('sort_by') || '';
  });

  const [currentPage, setCurrentPage] = useState(() => {
    const params = new URLSearchParams(location.search);
    const page = parseInt(params.get('page'), 10);
    return isNaN(page) || page < 1 ? 1 : page; // Ensure page is a valid number and at least 1
  });

  const [selectedFilters, setSelectedFilters] = useState(() => {
    const params = new URLSearchParams(location.search);
    return {
      categories: params.getAll('categories'),
      colors: params.getAll('colors'),
      sizes: params.getAll('sizes')
    };
  });

  // Effect to save expandedFilters to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('expandedFilters', JSON.stringify(expandedFilters));
  }, [expandedFilters]);

  const toggleFilter = (filterType) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  const formatPrice = (price) => {
    return `€ ${parseFloat(price).toFixed(0)}`;
  };

  // Build API URL and update URL parameters
  const buildAndSyncUrl = useCallback(() => {
    const params = new URLSearchParams();

    selectedFilters.categories.forEach(category => params.append('categories', category));
    selectedFilters.colors.forEach(color => params.append('colors', color));
    selectedFilters.sizes.forEach(size => params.append('sizes', size));

    if (sortBy) {
      params.append('sort_by', sortBy);
    }

    // Always include page, even if it's 1, for clarity in URL
    params.append('page', currentPage.toString());

    // Navigate to update the URL
    navigate({
      pathname: location.pathname,
      search: params.toString(),
    }, { replace: true }); // Use replace: true to avoid polluting browser history

    return `${BASE_URL}/api/auth/products?${params.toString()}`;
  }, [selectedFilters, sortBy, currentPage, navigate, location.pathname]);

  // Effect to fetch products when filters, sort, or page changes, or on initial mount
  useEffect(() => {
    const fetchProductsAndFilters = async () => {
      setLoading(true);
      setError(null);
      const url = buildAndSyncUrl(); // Get the URL with current parameters

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.products || []);
        setTotalPages(data.pagination?.total_pages || 1);

        // Only set available filters data once on initial load, or if they change significantly
        // This prevents unnecessary re-renders if backend sends same filter data
        if (data.filters_data) {
          setAvailableCategories(data.filters_data.categories?.map(cat => cat.name) || []);
          setAvailableColors(data.filters_data.colors?.map(col => col.name) || []);
          setAvailableSizes(data.filters_data.sizes?.map(s => s.name) || []);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndFilters();
  }, [buildAndSyncUrl]); // Re-run effect when the URL parameters change (via buildAndSyncUrl)

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
    setCurrentPage(1); // Reset page to 1 when filters change
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1); // Reset page to 1 when sort order changes
  };

  const handleClearFilters = () => {
    setSelectedFilters({ categories: [], colors: [], sizes: [] });
    setSortBy(''); // Also clear sort
    setCurrentPage(1); // Reset page
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
              onChange={handleSortChange} // Use the new handler
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
              onClick={handleClearFilters} // Use the new handler
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
                  onClick={handleClearFilters}
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
        <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
      </div>
    </div>
  );
};

export default Shop;



// import { useState, useEffect, useCallback } from 'react';
// import { ChevronDown, ChevronUp, Menu, X } from 'lucide-react';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { IoChevronBackCircleOutline, IoChevronForwardCircleOutline } from 'react-icons/io5';
// import Pagination from '../components/core/Shop/Pagination';

// const Shop = () => {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [totalPages, setTotalPages] = useState(1);

//   const [availableCategories, setAvailableCategories] = useState([]);
//   const [availableColors, setAvailableColors] = useState([]);
//   const [availableSizes, setAvailableSizes] = useState([]);

//   // State for mobile sidebar visibility
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   const [expandedFilters, setExpandedFilters] = useState(() => {
//     // Initialize from local storage or default
//     const savedExpandedFilters = localStorage.getItem('expandedFilters');
//     return savedExpandedFilters ? JSON.parse(savedExpandedFilters) : {
//       categories: true,
//       color: true,
//       size: true
//     };
//   });

//   // Use useLocation and useNavigate hooks
//   const location = useLocation();
//   const navigate = useNavigate();

//   // Initialize state from URL parameters
//   const [sortBy, setSortBy] = useState(() => {
//     const params = new URLSearchParams(location.search);
//     return params.get('sort_by') || '';
//   });

//   const [currentPage, setCurrentPage] = useState(() => {
//     const params = new URLSearchParams(location.search);
//     const page = parseInt(params.get('page'), 10);
//     return isNaN(page) || page < 1 ? 1 : page;
//   });

//   const [selectedFilters, setSelectedFilters] = useState(() => {
//     const params = new URLSearchParams(location.search);
//     return {
//       categories: params.getAll('categories'),
//       colors: params.getAll('colors'),
//       sizes: params.getAll('sizes')
//     };
//   });

//   // Effect to save expandedFilters to local storage whenever it changes
//   useEffect(() => {
//     localStorage.setItem('expandedFilters', JSON.stringify(expandedFilters));
//   }, [expandedFilters]);

//   const toggleFilter = (filterType) => {
//     setExpandedFilters(prev => ({
//       ...prev,
//       [filterType]: !prev[filterType]
//     }));
//   };

//   const formatPrice = (price) => {
//     return `€ ${parseFloat(price).toFixed(0)}`;
//   };

//   // Build API URL and update URL parameters
//   const buildAndSyncUrl = useCallback(() => {
//     const params = new URLSearchParams();

//     selectedFilters.categories.forEach(category => params.append('categories', category));
//     selectedFilters.colors.forEach(color => params.append('colors', color));
//     selectedFilters.sizes.forEach(size => params.append('sizes', size));

//     if (sortBy) {
//       params.append('sort_by', sortBy);
//     }

//     params.append('page', currentPage.toString());

//     navigate({
//       pathname: location.pathname,
//       search: params.toString(),
//     }, { replace: true });
// const BASE_URL = import.meta.env.VITE_BASE_URL;

//     return `${BASE_URL}/api/auth/products?${params.toString()}`;
//   }, [selectedFilters, sortBy, currentPage, navigate, location.pathname]);

//   // Effect to fetch products when filters, sort, or page changes, or on initial mount
//   useEffect(() => {
//     const fetchProductsAndFilters = async () => {
//       setLoading(true);
//       setError(null);
//       const url = buildAndSyncUrl();

//       try {
//         const response = await fetch(url);
//         if (!response.ok) {
//           throw new Error('Failed to fetch products');
//         }
//         const data = await response.json();
//         setProducts(data.products || []);
//         setTotalPages(data.pagination?.total_pages || 1);

//         if (data.filters_data) {
//           setAvailableCategories(data.filters_data.categories?.map(cat => cat.name) || []);
//           setAvailableColors(data.filters_data.colors?.map(col => col.name) || []);
//           setAvailableSizes(data.filters_data.sizes?.map(s => s.name) || []);
//         }

//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProductsAndFilters();
//   }, [buildAndSyncUrl]);

//   const handleFilterChange = (filterType, value) => {
//     setSelectedFilters(prev => {
//       const currentFilters = prev[filterType];
//       if (currentFilters.includes(value)) {
//         return {
//           ...prev,
//           [filterType]: currentFilters.filter(item => item !== value)
//         };
//       } else {
//         return {
//           ...prev,
//           [filterType]: [...currentFilters, value]
//         };
//       }
//     });
//     setCurrentPage(1);
//   };

//   const handleSortChange = (e) => {
//     setSortBy(e.target.value);
//     setCurrentPage(1);
//   };

//   const handleClearFilters = () => {
//     setSelectedFilters({ categories: [], colors: [], sizes: [] });
//     setSortBy('');
//     setCurrentPage(1);
//   };

//   const displayedProducts = products;

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent mb-4"></div>
//           <div className="text-xl font-serif text-amber-800">Loading our collection...</div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
//         <div className="text-center bg-white p-8 rounded-lg shadow-lg border border-amber-200">
//           <div className="text-red-700 font-serif text-lg">Error: {error}</div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen mt-14 bg-gradient-to-r from-gray-900 to-gray-700">
//       {/* Ornamental pattern overlay */}
//       <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
//         backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23B45309' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
//       }}></div>
      
//       <div className="relative w-[85%] mx-auto pt-8 pb-16">
//         <div className="flex flex-col gap-6 px-6">
//           {/* Elegant Header */}
//           <div className="text-center mb-8">
//             <div className="inline-block">
//               <h1 className="text-5xl md:text-6xl font-serif text-amber-900 mb-4 relative">
//                 Boutique Collection
//                 <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-600 to-transparent"></div>
//               </h1>
//               <p className="text-amber-700 font-light text-lg italic">Curated with timeless elegance</p>
//             </div>
//           </div>

//           {/* Controls Bar */}
//           <div className="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-amber-200/50">
//             <div className="hidden md:flex items-center">
//               <span className="text-amber-900 font-serif text-lg mr-4">Refine Selection:</span>
//             </div>
            
//             <div className="flex items-center gap-4">
//               <div className="hidden sm:flex items-center gap-3">
//                 <span className="text-amber-800 font-serif">Arrange by:</span>
//                 <select
//                   value={sortBy}
//                   onChange={handleSortChange}
//                   className="bg-white border-2 border-amber-300 rounded-lg px-4 py-2 text-amber-900 font-serif focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 shadow-sm"
//                 >
//                   <option value="">Featured</option>
//                   <option value="price-low">Price: Ascending</option>
//                   <option value="price-high">Price: Descending</option>
//                   <option value="name">Alphabetical</option>
//                 </select>
//               </div>
              
//               {/* Mobile Filter Button */}
//               <button
//                 className="md:hidden p-3 rounded-xl text-amber-900 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all duration-200 border border-amber-300"
//                 onClick={() => setIsSidebarOpen(true)}
//               >
//                 <Menu size={24} />
//               </button>
//             </div>
//           </div>

//           {/* Decorative divider */}
//           <div className="flex items-center justify-center mb-8">
//             <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent w-full max-w-md"></div>
//             <div className="mx-4 w-2 h-2 bg-amber-500 rounded-full"></div>
//             <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent w-full max-w-md"></div>
//           </div>

//           <div className="flex gap-8">
//             {/* Desktop Sidebar */}
//             <div className="hidden md:block w-80 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 h-fit border border-amber-200/50">
//               <h2 className="text-2xl font-serif text-amber-900 mb-6 text-center relative">
//                 Filters
//                 <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-amber-500"></div>
//               </h2>
              
//               {/* Categories Filter */}
//               <div className="mb-8">
//                 <div
//                   className="flex justify-between items-center cursor-pointer mb-4 p-3 rounded-lg hover:bg-amber-50 transition-colors"
//                   onClick={() => toggleFilter('categories')}
//                 >
//                   <h3 className="font-serif text-lg text-amber-900">Categories</h3>
//                   <div className="text-amber-600">
//                     {expandedFilters.categories ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//                   </div>
//                 </div>
//                 {expandedFilters.categories && (
//                   <div className="space-y-3 pl-4">
//                     {availableCategories.map((categoryName) => (
//                       <label key={categoryName} className="flex items-center group cursor-pointer">
//                         <input
//                           type="checkbox"
//                           className="mr-3 w-5 h-5 text-amber-600 rounded border-2 border-amber-300 focus:ring-amber-500"
//                           checked={selectedFilters.categories.includes(categoryName)}
//                           onChange={() => handleFilterChange('categories', categoryName)}
//                         />
//                         <span className="text-amber-800 font-light group-hover:text-amber-900 transition-colors">
//                           {categoryName}
//                         </span>
//                       </label>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Color Filter */}
//               <div className="mb-8">
//                 <div
//                   className="flex justify-between items-center cursor-pointer mb-4 p-3 rounded-lg hover:bg-amber-50 transition-colors"
//                   onClick={() => toggleFilter('color')}
//                 >
//                   <h3 className="font-serif text-lg text-amber-900">Colours</h3>
//                   <div className="text-amber-600">
//                     {expandedFilters.color ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//                   </div>
//                 </div>
//                 {expandedFilters.color && (
//                   <div className="space-y-3 pl-4">
//                     {availableColors.map((colorName) => (
//                       <label key={colorName} className="flex items-center group cursor-pointer">
//                         <input
//                           type="checkbox"
//                           className="mr-3 w-5 h-5 text-amber-600 rounded border-2 border-amber-300 focus:ring-amber-500"
//                           checked={selectedFilters.colors.includes(colorName)}
//                           onChange={() => handleFilterChange('colors', colorName)}
//                         />
//                         <span className="text-amber-800 font-light group-hover:text-amber-900 transition-colors">
//                           {colorName}
//                         </span>
//                       </label>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Size Filter */}
//               <div className="mb-8">
//                 <div
//                   className="flex justify-between items-center cursor-pointer mb-4 p-3 rounded-lg hover:bg-amber-50 transition-colors"
//                   onClick={() => toggleFilter('size')}
//                 >
//                   <h3 className="font-serif text-lg text-amber-900">Sizes</h3>
//                   <div className="text-amber-600">
//                     {expandedFilters.size ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//                   </div>
//                 </div>
//                 {expandedFilters.size && (
//                   <div className="grid grid-cols-3 gap-3 pl-4">
//                     {availableSizes.map((sizeName) => (
//                       <label key={sizeName} className="flex items-center justify-center cursor-pointer">
//                         <input
//                           type="checkbox"
//                           className="sr-only"
//                           checked={selectedFilters.sizes.includes(sizeName)}
//                           onChange={() => handleFilterChange('sizes', sizeName)}
//                         />
//                         <span className={`text-sm font-serif border-2 px-3 py-2 cursor-pointer transition-all duration-200 rounded-lg ${
//                             selectedFilters.sizes.includes(sizeName)
//                               ? 'bg-amber-600 text-white border-amber-600 shadow-md'
//                               : 'bg-white text-amber-800 border-amber-300 hover:border-amber-500 hover:bg-amber-50'
//                           }`}>
//                           {sizeName}
//                         </span>
//                       </label>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Clear Filters */}
//               <div className="text-center pt-4 border-t border-amber-200">
//                 <button
//                   onClick={handleClearFilters}
//                   className="text-amber-700 hover:text-amber-900 font-serif underline decoration-amber-400 underline-offset-4 hover:decoration-amber-600 transition-colors"
//                 >
//                   Clear all selections
//                 </button>
//               </div>
//             </div>

//             {/* Mobile Sidebar */}
//             <div
//               className={`fixed inset-y-0 left-0 bg-white w-80 z-50 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
//                 isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
//               }`}
//             >
//               <div className="p-6 h-full flex flex-col bg-gradient-to-b from-amber-50 to-white">
//                 <div className="flex justify-between items-center mb-6 pb-4 border-b border-amber-200">
//                   <h2 className="text-2xl font-serif text-amber-900">Filters</h2>
//                   <button
//                     className="p-2 rounded-lg text-amber-900 bg-amber-100 hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
//                     onClick={() => setIsSidebarOpen(false)}
//                   >
//                     <X size={24} />
//                   </button>
//                 </div>
                
//                 <div className="flex-grow overflow-y-auto">
//                   {/* Mobile filter content - same structure as desktop */}
//                   <div className="mb-6">
//                     <div
//                       className="flex justify-between items-center cursor-pointer mb-3 p-3 rounded-lg hover:bg-amber-50"
//                       onClick={() => toggleFilter('categories')}
//                     >
//                       <h3 className="font-serif text-lg text-amber-900">Categories</h3>
//                       <div className="text-amber-600">
//                         {expandedFilters.categories ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//                       </div>
//                     </div>
//                     {expandedFilters.categories && (
//                       <div className="space-y-3 pl-4">
//                         {availableCategories.map((categoryName) => (
//                           <label key={categoryName} className="flex items-center group cursor-pointer">
//                             <input
//                               type="checkbox"
//                               className="mr-3 w-5 h-5 text-amber-600 rounded border-2 border-amber-300"
//                               checked={selectedFilters.categories.includes(categoryName)}
//                               onChange={() => handleFilterChange('categories', categoryName)}
//                             />
//                             <span className="text-amber-800 font-light group-hover:text-amber-900">
//                               {categoryName}
//                             </span>
//                           </label>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   <div className="mb-6">
//                     <div
//                       className="flex justify-between items-center cursor-pointer mb-3 p-3 rounded-lg hover:bg-amber-50"
//                       onClick={() => toggleFilter('color')}
//                     >
//                       <h3 className="font-serif text-lg text-amber-900">Colours</h3>
//                       <div className="text-amber-600">
//                         {expandedFilters.color ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//                       </div>
//                     </div>
//                     {expandedFilters.color && (
//                       <div className="space-y-3 pl-4">
//                         {availableColors.map((colorName) => (
//                           <label key={colorName} className="flex items-center group cursor-pointer">
//                             <input
//                               type="checkbox"
//                               className="mr-3 w-5 h-5 text-amber-600 rounded border-2 border-amber-300"
//                               checked={selectedFilters.colors.includes(colorName)}
//                               onChange={() => handleFilterChange('colors', colorName)}
//                             />
//                             <span className="text-amber-800 font-light group-hover:text-amber-900">
//                               {colorName}
//                             </span>
//                           </label>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   <div className="mb-6">
//                     <div
//                       className="flex justify-between items-center cursor-pointer mb-3 p-3 rounded-lg hover:bg-amber-50"
//                       onClick={() => toggleFilter('size')}
//                     >
//                       <h3 className="font-serif text-lg text-amber-900">Sizes</h3>
//                       <div className="text-amber-600">
//                         {expandedFilters.size ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//                       </div>
//                     </div>
//                     {expandedFilters.size && (
//                       <div className="grid grid-cols-3 gap-2 pl-4">
//                         {availableSizes.map((sizeName) => (
//                           <label key={sizeName} className="flex items-center justify-center cursor-pointer">
//                             <input
//                               type="checkbox"
//                               className="sr-only"
//                               checked={selectedFilters.sizes.includes(sizeName)}
//                               onChange={() => handleFilterChange('sizes', sizeName)}
//                             />
//                             <span className={`text-sm font-serif border-2 px-2 py-1 cursor-pointer transition-all rounded ${
//                                   selectedFilters.sizes.includes(sizeName)
//                                     ? 'bg-amber-600 text-white border-amber-600'
//                                     : 'bg-white text-amber-800 border-amber-300 hover:border-amber-500'
//                                 }`}>
//                               {sizeName}
//                             </span>
//                           </label>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
                
//                 <div className="mt-auto pt-4 border-t border-amber-200">
//                   <button
//                     onClick={handleClearFilters}
//                     className="text-amber-700 hover:text-amber-900 font-serif underline w-full text-center"
//                   >
//                     Clear all selections
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Overlay for mobile sidebar */}
//             {isSidebarOpen && (
//               <div
//                 className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
//                 onClick={() => setIsSidebarOpen(false)}
//               ></div>
//             )}

//             {/* Products Grid */}
//             <div className="flex-1">
//               {displayedProducts.length === 0 && !loading ? (
//                 <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-xl border border-amber-200">
//                   <div className="text-6xl mb-4">🔍</div>
//                   <p className="text-amber-800 font-serif text-xl">No treasures match your refined taste.</p>
//                   <p className="text-amber-600 font-light mt-2">Perhaps adjust your selection criteria?</p>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                   {displayedProducts.map((product) => (
//                     <Link 
//                       to={`/shop/${product.id}`} 
//                       key={product.id} 
//                       className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-amber-200/50"
//                     >
//                       <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
//                         {product.main_image ? (
//                           <img
//                             src={product.main_image}
//                             alt={product.name}
//                             className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
//                           />
//                         ) : (
//                           <div className="w-full h-80 bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
//                             <div className="text-amber-400 text-6xl">👗</div>
//                           </div>
//                         )}
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                       </div>
                      
//                       <div className="p-6">
//                         <h3 className="font-serif text-xl text-amber-900 mb-3 group-hover:text-amber-700 transition-colors line-clamp-2">
//                           {product.name}
//                         </h3>
//                         <div className="flex items-center justify-between">
//                           <span className="font-bold text-2xl text-amber-800 font-serif">
//                             {formatPrice(product.base_price)}
//                           </span>
//                           <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
//                             <span className="text-amber-700 text-lg">→</span>
//                           </div>
//                         </div>
//                       </div>
//                     </Link>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
          
//           <div className="mt-12">
//             <Pagination 
//               currentPage={currentPage} 
//               totalPages={totalPages} 
//               setCurrentPage={setCurrentPage} 
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Shop;