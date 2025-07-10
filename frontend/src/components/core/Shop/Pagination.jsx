import React from "react";
import { IoChevronBackCircleOutline, IoChevronForwardCircleOutline } from "react-icons/io5";

const Pagination = ({currentPage, totalPages,setCurrentPage}) => {
  return (
    <div className="flex justify-center mt-8 space-x-2">
      <div
        className={`${
          currentPage == 1 ? "opacity-30" : "opacity-100"
        } text-3xl text-ce`}
        onClick={() => {
          if (currentPage != 1) {
            setCurrentPage(currentPage - 1);
          }
        }}
      >
        <IoChevronBackCircleOutline />
      </div>
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          className={`px-3 py-1 border rounded transition-colors duration-300 ease-in-out ${
            currentPage === index + 1
              ? "bg-blue-600  text-white"
              : "bg-white text-gray-700"
          }`}
          onClick={() => setCurrentPage(index + 1)}
        >
          {index + 1}
        </button>
      ))}
      <div
        className={`${
          currentPage == totalPages ? "opacity-30" : "opacity-100"
        } text-3xl text-ce`}
        onClick={() => {
          if (currentPage != totalPages) {
            setCurrentPage(currentPage + 1);
          }
        }}
      >
        <IoChevronForwardCircleOutline />
      </div>
    </div>
  );
};

export default Pagination;
