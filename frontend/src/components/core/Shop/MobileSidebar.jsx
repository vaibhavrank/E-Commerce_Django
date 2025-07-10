import { X, ChevronDown, ChevronUp } from 'lucide-react';

const MobileSidebar = ({
  isOpen,
  setIsOpen,
  availableCategories,
  availableColors,
  availableSizes,
  selectedFilters,
  setSelectedFilters,
  expandedFilters,
  toggleFilter,
}) => {
  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => {
      const current = prev[filterType];
      return {
        ...prev,
        [filterType]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value],
      };
    });
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 bg-white w-64 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Filters</h2>
            <button
              className="p-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
              onClick={() => setIsOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-grow overflow-y-auto">
            {/* Categories */}
            <div className="mb-6">
              <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleFilter('categories')}>
                <h3 className="font-semibold text-gray-800">Categories</h3>
                {expandedFilters.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {expandedFilters.categories && (
                <div className="space-y-2">
                  {availableCategories.map((name,index) => (
                    <label key={index} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 w-4 h-4 text-blue-600 rounded"
                        checked={selectedFilters.categories.includes(name)}
                        onChange={() => handleFilterChange('categories', name)}
                      />
                      <span className="text-sm text-gray-700">{name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Colors */}
            <div className="mb-6">
              <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleFilter('color')}>
                <h3 className="font-semibold text-gray-800">Colour</h3>
                {expandedFilters.color ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {expandedFilters.color && (
                <div className="space-y-2">
                  {availableColors.map(name => (
                    <label key={name} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2 w-4 h-4 text-blue-600 rounded"
                        checked={selectedFilters.colors.includes(name)}
                        onChange={() => handleFilterChange('colors', name)}
                      />
                      <span className="text-sm text-gray-700">{name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleFilter('size')}>
                <h3 className="font-semibold text-gray-800">International Size</h3>
                {expandedFilters.size ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
              {expandedFilters.size && (
                <div className="grid grid-cols-4 gap-2">
                  {availableSizes.map((name, index) => (
                    <label key={index} className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={selectedFilters.sizes.includes(name)}
                        onChange={() => handleFilterChange('sizes', name)}
                      />
                      <span className={`text-sm border px-2 py-1 cursor-pointer transition-colors ${
                        selectedFilters.sizes.includes(name)
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}>
                        {name}
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

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default MobileSidebar;
