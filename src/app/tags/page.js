'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  duplicateTag,
  bulkDeleteTags,
} from '../../lib/firestore';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import LanguageTabs from '../../components/LanguageTabs';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function TagsPage() {
  const { canAccess } = useAuth();
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);

  const [formData, setFormData] = useState({
    tagsname_sor: '',
    tagsname_bad: '',
    tagsname_ar: '',
    tagsname_en: '',
    image: '',
    name: '',
  });

  useEffect(() => {
    if (canAccess('tags_new')) {
      loadTags();
    }
  }, []);

  useEffect(() => {
    filterTags();
  }, [searchTerm, tags]);

  const loadTags = async () => {
    try {
      const data = await getAllTags();
      setTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const filterTags = () => {
    if (!searchTerm.trim()) {
      setFilteredTags(tags);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = tags.filter(tag =>
      tag.tagsname_sor?.toLowerCase().includes(term) ||
      tag.tagsname_bad?.toLowerCase().includes(term) ||
      tag.tagsname_ar?.toLowerCase().includes(term) ||
      tag.tagsname_en?.toLowerCase().includes(term) ||
      tag.name?.toLowerCase().includes(term)
    );
    setFilteredTags(filtered);
  };

  const handleOpenModal = (tag = null) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        tagsname_sor: tag.tagsname_sor || '',
        tagsname_bad: tag.tagsname_bad || '',
        tagsname_ar: tag.tagsname_ar || '',
        tagsname_en: tag.tagsname_en || '',
        image: tag.image || '',
        name: tag.name || '',
      });
    } else {
      setEditingTag(null);
      setFormData({
        tagsname_sor: '',
        tagsname_bad: '',
        tagsname_ar: '',
        tagsname_en: '',
        image: '',
        name: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTag(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTag) {
        await updateTag(editingTag.id, formData);
        toast.success('Tag updated successfully!');
      } else {
        await createTag(formData);
        toast.success('Tag created successfully!');
      }
      await loadTags();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving tag:', error);
      toast.error('Failed to save tag');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;

    setLoading(true);
    try {
      await deleteTag(id);
      toast.success('Tag deleted successfully!');
      await loadTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id) => {
    setLoading(true);
    try {
      await duplicateTag(id);
      toast.success('Tag duplicated successfully!');
      await loadTags();
    } catch (error) {
      console.error('Error duplicating tag:', error);
      toast.error('Failed to duplicate tag');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedTags.length} tags?`)) return;

    setLoading(true);
    try {
      await bulkDeleteTags(selectedTags);
      toast.success(`${selectedTags.length} tags deleted!`);
      setSelectedTags([]);
      await loadTags();
    } catch (error) {
      console.error('Error deleting tags:', error);
      toast.error('Failed to delete tags');
    } finally {
      setLoading(false);
    }
  };

  if (!canAccess('tags_new')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">You don't have access to this page.</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        
        <main className="flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
              <p className="text-gray-600 mt-1">Manage all tags</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary flex items-center gap-2"
            >
              <FiPlus size={20} />
              Add New Tag
            </button>
          </div>

          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="btn btn-danger flex items-center gap-2"
                >
                  <FiTrash2 />
                  Delete {selectedTags.length} selected
                </button>
              )}
            </div>
          </div>

          {loading && !tags.length ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600">No tags found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTags.map((tag) => (
                <div key={tag.id} className="card hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags([...selectedTags, tag.id]);
                        } else {
                          setSelectedTags(selectedTags.filter(id => id !== tag.id));
                        }
                      }}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenModal(tag)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                      >
                        <FiEdit2 size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(tag.id)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                      >
                        <FiCopy size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                      >
                        <FiTrash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  {tag.image && (
                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img src={tag.image} alt={tag.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-1">
                    {tag.tagsname_sor && (
                      <p className="text-sm"><span className="font-medium">Sorani:</span> {tag.tagsname_sor}</p>
                    )}
                    {tag.tagsname_bad && (
                      <p className="text-sm"><span className="font-medium">Badini:</span> {tag.tagsname_bad}</p>
                    )}
                    {tag.tagsname_ar && (
                      <p className="text-sm"><span className="font-medium">Arabic:</span> {tag.tagsname_ar}</p>
                    )}
                    {tag.tagsname_en && (
                      <p className="text-sm"><span className="font-medium">English:</span> {tag.tagsname_en}</p>
                    )}
                    {tag.name && (
                      <p className="text-sm text-gray-500">ID: {tag.name}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">
                {editingTag ? 'Edit Tag' : 'Add New Tag'}
              </h2>
              <button onClick={handleCloseModal}>
                <FiX size={24} className="text-gray-600 hover:text-gray-900" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <LanguageTabs>
                  {(lang) => (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tag Name ({lang.toUpperCase()})
                        </label>
                        <input
                          type="text"
                          value={formData[`tagsname_${lang}`]}
                          onChange={(e) => setFormData({
                            ...formData,
                            [`tagsname_${lang}`]: e.target.value
                          })}
                          className="input"
                          placeholder={`Enter tag name in ${lang}`}
                        />
                      </div>
                    </div>
                  )}
                </LanguageTabs>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="input"
                    placeholder="https://example.com/image.png"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded" />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Name/ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="tag_identifier"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingTag ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
