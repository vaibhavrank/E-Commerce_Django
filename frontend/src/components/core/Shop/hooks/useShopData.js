import { useEffect, useState, useCallback } from 'react';

export const useShopData = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableSizes, setAvailableSizes] = useState([]);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleFilter = (type) => {
    setExpandedFilters(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const buildApiUrl = useCallback(() => {
    const params = new URLSearchParams();
    selectedFilters.categories.forEach(cat => params.append('categories', cat));
    selectedFilters.colors.forEach(col => params.append('colors', col));
    selectedFilters.sizes.forEach(sz => params.append('sizes', sz));
    if (sortBy) params.append('sort_by', sortBy);
    params.append('page', currentPage);
    return `${BASE_URL}/api/auth/products?${params.toString()}`;
  }, [selectedFilters, sortBy, currentPage]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(buildApiUrl());
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        setProducts(data.products || []);
        setAvailableCategories(data.filters_data?.categories.map(c => c.name) || []);
        setAvailableColors(data.filters_data?.colors.map(c => c.name) || []);
        setAvailableSizes(data.filters_data?.sizes.map(s => s.name) || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedFilters, sortBy, buildApiUrl]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilters, sortBy]);

  return {
    products, loading, error,
    sortBy, setSortBy,
    selectedFilters, setSelectedFilters,
    availableCategories, availableColors, availableSizes,
    expandedFilters, toggleFilter,
    isSidebarOpen, setIsSidebarOpen
  };
};
