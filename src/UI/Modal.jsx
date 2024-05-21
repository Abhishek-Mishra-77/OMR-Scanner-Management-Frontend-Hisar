import React, { useState } from "react";

const ModalWithLoadingBar = ({ isOpen, onClose, progress }) => {
  return (
    // Modal backdrop and container
    <div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        isOpen ? "block" : "hidden"
      }`}
    >
      {/* Backdrop to block interactions with elements behind the modal */}
      <div className="fixed inset-0 bg-gray-900 opacity-75"></div>

      {/* Modal container */}
      <div className="relative bg-white rounded-lg p-8 max-w-md mx-auto z-50">
        {/* Loading bar container */}
        <div className="relative h-4 bg-gray-200 rounded overflow-hidden mb-4">
          {/* Dynamic loading bar */}
          <div
            className="absolute top-0 left-0 h-full bg-blue-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Modal content */}
        {progress !== 100 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">
              Uploading the files to the server
            </h2>
            <p className="text-gray-700">{progress}</p>
          </div>
        )}
        {progress === 100 && (
          <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">
              Comparing and matching the files...
            </h2>
          </div>
        )}

        {/* Close button */}
        {/* <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button> */}
      </div>
    </div>
  );
};

export default ModalWithLoadingBar;
