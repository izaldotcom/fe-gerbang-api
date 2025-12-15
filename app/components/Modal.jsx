"use client";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    // Overlay dengan backdrop blur
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity">
      {/* Container Modal */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg transform transition-all scale-100">
        {/* Header Modal */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>

          {/* Tombol Close dengan Icon SVG */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
