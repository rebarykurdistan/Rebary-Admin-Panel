'use client';

import { FiAlertTriangle, FiX } from 'react-icons/fi';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', type = 'danger' }) {
  if (!isOpen) return null;

  const typeStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-primary hover:bg-primary-dark',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'} flex items-center justify-center`}>
              <FiAlertTriangle className={type === 'danger' ? 'text-red-600' : 'text-yellow-600'} size={24} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose}>
            <FiX size={24} className="text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        <div className="modal-body">
          <p className="text-gray-700">{message}</p>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }} 
            className={`btn text-white ${typeStyles[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
