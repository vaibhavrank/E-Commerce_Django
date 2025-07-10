import { ChevronDown, ChevronUp } from 'lucide-react';

const FiltersSidebar = ({
  isMobile,
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

  const containerClass = isMobile ? 'md:hidden' : 'hidden md:block max-w-64 bg-white rounded-lg shadow-sm p-6 h-fit';

  return (
    <div className={containerClass}>
      {/* Category Filter */}
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

      {/* Color Filter */}
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

      {/* Size Filter */}
      <div className="mb-6">
        <div className="flex justify-between items-center cursor-pointer mb-3" onClick={() => toggleFilter('size')}>
          <h3 className="font-semibold text-gray-800">International Size</h3>
          {expandedFilters.size ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
        {expandedFilters.size && (
          <div className="grid grid-cols-4 gap-2">
            {availableSizes.map((name,index) => (
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

      <button
        onClick={() => setSelectedFilters({ categories: [], colors: [], sizes: [] })}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        Clear all filters
      </button>
    </div>
  );
};

export default FiltersSidebar;
