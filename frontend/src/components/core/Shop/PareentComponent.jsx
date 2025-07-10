import React, { useState, useEffect } from "react";
import Pagination from "./Pagination"; // Assuming your Pagination component is in a separate file

const ITEMS_PER_PAGE = 10; // Example
const TOTAL_ITEMS = 100; // Example, replace with your actual total items

const ParentComponent = ({ allItems }) => {
  // State for current page
  const [currentPage, setCurrentPage] = useState(() => {
    // Initialize from localStorage on mount
    const savedPage = localStorage.getItem("currentPage");
    return savedPage ? parseInt(savedPage, 10) : 1;
  });

  // State for filters (example)
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const savedCategory = localStorage.getItem("selectedCategory");
    return savedCategory || "All"; // Default filter
  });

  const [searchTerm, setSearchTerm] = useState(() => {
    const savedSearchTerm = localStorage.getItem("searchTerm");
    return savedSearchTerm || "";
  });

  // Effect to save currentPage to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("currentPage", currentPage.toString());
  }, [currentPage]);

  // Effect to save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("selectedCategory", selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    localStorage.setItem("searchTerm", searchTerm);
  }, [searchTerm]);

  // --- Filtering Logic (simplified example) ---
  const filteredItems = allItems.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearchTerm = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearchTerm;
  });

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  // Get items for the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // --- Render your UI ---
  return (
    <div>
      {/* Filter UI */}
      <div>
        <label>Category:</label>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1); // Reset page when filter changes
          }}
        >
          <option value="All">All</option>
          <option value="Electronics">Electronics</option>
          <option value="Books">Books</option>
        </select>
      </div>
      <div>
        <label>Search:</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset page when filter changes
          }}
        />
      </div>

      {/* Display your filtered and paginated items here */}
      {currentItems.length > 0 ? (
        <ul>
          {currentItems.map((item) => (
            <li key={item.id}>{item.name} - {item.category}</li>
          ))}
        </ul>
      ) : (
        <p>No items found.</p>
      )}

      {/* Pagination component */}
      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
        />
      )}
    </div>
  );
};

export default ParentComponent;