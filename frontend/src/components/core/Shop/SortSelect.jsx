const SortSelect = ({ sortBy, setSortBy }) => {
  return (
    <div className="sm:flex hidden items-center gap-2">
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
  );
};

export default SortSelect;
