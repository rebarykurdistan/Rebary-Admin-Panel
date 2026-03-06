'use client';

import { useState } from 'react';
import { FiTrash2, FiX } from 'react-icons/fi';

// Unified type-to-confirm delete dialog used across the entire app.
//
// Two modes:
//   mode="word"  (default) — user types "Delete" to confirm.
//                            Used for: services, categories, tags.
//   mode="email"           — user types the account email to confirm.
//                            Used for: user account deletion.
//
// Props:
//   isOpen    boolean
//   onClose   function
//   onConfirm function  — called on successful confirmation, dialog resets automatically
//   title     string    — e.g. "Delete Service?"
//   message   string    — description shown above the input
//   mode      "word" | "email"   (default: "word")
//   email     string    — required when mode="email"

export default function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  mode = 'word',
  email = '',
}) {
  const [typed, setTyped] = useState('');

  if (!isOpen) return null;

  const expectedValue = mode === 'email' ? email : 'Delete';
  const isMatch = typed === expectedValue;

  const handleClose = () => {
    setTyped('');
    onClose();
  };

  const handleConfirm = () => {
    if (!isMatch) return;
    setTyped('');
    onConfirm();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>

        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <FiTrash2 className="text-red-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          </div>
          <button onClick={handleClose}>
            <FiX size={24} className="text-gray-600 hover:text-gray-900" />
          </button>
        </div>

        <div className="modal-body space-y-4">
          <p className="text-gray-700">{message}</p>

          {mode === 'email' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-medium text-red-800 break-all">{email}</p>
            </div>
          )}

          <p className="text-sm text-gray-500">
            This action <strong>cannot be undone.</strong>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'email'
                ? 'Type the email address to confirm:'
                : <>Type <span className="font-bold text-red-600">Delete</span> to confirm:</>
              }
            </label>
            <input
              type="text"
              value={typed}
              onChange={e => setTyped(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && isMatch) handleConfirm(); }}
              className="input"
              placeholder={mode === 'email' ? email : 'Delete'}
              autoFocus
            />
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={handleClose} className="btn btn-secondary">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={!isMatch}
            className="btn btn-danger disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm Delete
          </button>
        </div>

      </div>
    </div>
  );
}