'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getAllServices,
  getAllCategories,
  createService,
  updateService,
  deleteService,
  duplicateService,
  bulkDeleteServices,
} from '../../lib/firestore';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import LanguageTabs from '../../components/LanguageTabs';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ServicesPage() {
  const { canAccess } = useAuth();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);

  const [formData, setFormData] = useState({
    name_sor: '',
    name_bad: '',
    name_ar: '',
    name_en: '',
    job_sor: '',
    job_bad: '',
    job_ar: '',
    job_en: '',
    jobtitle_sor: '',
    jobtitle_bad: '',
    jobtitle_ar: '',
    jobtitle_en: '',
    image_sor: '',
    image_bad: '',
    image_ar: '',
    image_en: '',
    categoryref: '',
    visibility_sor: true,
    visibility_bad: true,
    visibility_ar: true,
    visibility_en: true,
    // Contact platforms - storing as simple fields for now
    phone: '',
    phoneText: '',
    whatsapp: '',
    whatsappText: '',
    email: '',
    emailText: '',
    facebook: '',
    instagram: '',
    website: '',
  });

  useEffect(() => {
    if (canAccess('services_new')) {
      loadData();
    }
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchTerm, categoryFilter, services]);

  const loadData = async () => {
    try {
      const [servicesData, categoriesData] = await Promise.all([
        getAllServices(),
        getAllCategories()
      ]);
      setServices(servicesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.name_sor?.toLowerCase().includes(term) ||
        service.name_bad?.toLowerCase().includes(term) ||
        service.name_ar?.toLowerCase().includes(term) ||
        service.name_en?.toLowerCase().includes(term)
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter(service => service.categoryref === categoryFilter);
    }

    setFilteredServices(filtered);
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      
      // Extract phone data from phonedata array if exists
      const phoneEntry = service.phonedata && service.phonedata[0];
      const whatsappEntry = service.whatsappdata && service.whatsappdata[0];
      const emailEntry = service.emaildata && service.emaildata[0];
      const facebookEntry = service.facebookdata && service.facebookdata[0];
      const instagramEntry = service.instagramdata && service.instagramdata[0];
      const websiteEntry = service.websitedata && service.websitedata[0];
      
      setFormData({
        name_sor: service.name_sor || '',
        name_bad: service.name_bad || '',
        name_ar: service.name_ar || '',
        name_en: service.name_en || '',
        job_sor: service.job_sor || '',
        job_bad: service.job_bad || '',
        job_ar: service.job_ar || '',
        job_en: service.job_en || '',
        jobtitle_sor: service.jobtitle_sor || '',
        jobtitle_bad: service.jobtitle_bad || '',
        jobtitle_ar: service.jobtitle_ar || '',
        jobtitle_en: service.jobtitle_en || '',
        image_sor: service.image_sor || '',
        image_bad: service.image_bad || '',
        image_ar: service.image_ar || '',
        image_en: service.image_en || '',
        categoryref: service.categoryref || '',
        visibility_sor: service.visibility_sor ?? true,
        visibility_bad: service.visibility_bad ?? true,
        visibility_ar: service.visibility_ar ?? true,
        visibility_en: service.visibility_en ?? true,
        phone: phoneEntry?.phone_sor || '',
        phoneText: phoneEntry?.phonetext_sor || '',
        whatsapp: whatsappEntry?.whatsapp_sor || '',
        whatsappText: whatsappEntry?.whatsapptext_sor || '',
        email: emailEntry?.email_sor || '',
        emailText: emailEntry?.emailtext_sor || '',
        facebook: facebookEntry?.facebook_sor || '',
        instagram: instagramEntry?.instagram_sor || '',
        website: websiteEntry?.website_sor || '',
      });
    } else {
      setEditingService(null);
      setFormData({
        name_sor: '',
        name_bad: '',
        name_ar: '',
        name_en: '',
        job_sor: '',
        job_bad: '',
        job_ar: '',
        job_en: '',
        jobtitle_sor: '',
        jobtitle_bad: '',
        jobtitle_ar: '',
        jobtitle_en: '',
        image_sor: '',
        image_bad: '',
        image_ar: '',
        image_en: '',
        categoryref: '',
        visibility_sor: true,
        visibility_bad: true,
        visibility_ar: true,
        visibility_en: true,
        phone: '',
        phoneText: '',
        whatsapp: '',
        whatsappText: '',
        email: '',
        emailText: '',
        facebook: '',
        instagram: '',
        website: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data with contact platforms in proper format
      const serviceData = { ...formData };
      
      // Convert contact info to Firebase format
      if (formData.phone) {
        serviceData.phonedata = [{
          phone_sor: formData.phone,
          phone_bad: formData.phone,
          phone_ar: formData.phone,
          phone_en: formData.phone,
          phonetext_sor: formData.phoneText,
          phonetext_bad: formData.phoneText,
          phonetext_ar: formData.phoneText,
          phonetext_en: formData.phoneText,
          phoneclickcount_sor: 0,
          phoneclickcount_bad: 0,
          phoneclickcount_ar: 0,
          phoneclickcount_en: 0,
        }];
      }
      
      if (formData.whatsapp) {
        serviceData.whatsappdata = [{
          whatsapp_sor: formData.whatsapp,
          whatsapp_bad: formData.whatsapp,
          whatsapp_ar: formData.whatsapp,
          whatsapp_en: formData.whatsapp,
          whatsapptext_sor: formData.whatsappText,
          whatsapptext_bad: formData.whatsappText,
          whatsapptext_ar: formData.whatsappText,
          whatsapptext_en: formData.whatsappText,
          whatsappclickcount_sor: 0,
          whatsappclickcount_bad: 0,
          whatsappclickcount_ar: 0,
          whatsappclickcount_en: 0,
        }];
      }
      
      if (formData.email) {
        serviceData.emaildata = [{
          email_sor: formData.email,
          email_bad: formData.email,
          email_ar: formData.email,
          email_en: formData.email,
          emailtext_sor: formData.emailText,
          emailtext_bad: formData.emailText,
          emailtext_ar: formData.emailText,
          emailtext_en: formData.emailText,
          emailclickcount_sor: 0,
          emailclickcount_bad: 0,
          emailclickcount_ar: 0,
          emailclickcount_en: 0,
        }];
      }
      
      if (formData.facebook) {
        serviceData.facebookdata = [{
          facebook_sor: formData.facebook,
          facebook_bad: formData.facebook,
          facebook_ar: formData.facebook,
          facebook_en: formData.facebook,
          facebooktext_sor: '',
          facebooktext_bad: '',
          facebooktext_ar: '',
          facebooktext_en: '',
          facebookclickcount_sor: 0,
          facebookclickcount_bad: 0,
          facebookclickcount_ar: 0,
          facebookclickcount_en: 0,
        }];
      }
      
      if (formData.instagram) {
        serviceData.instagramdata = [{
          instagram_sor: formData.instagram,
          instagram_bad: formData.instagram,
          instagram_ar: formData.instagram,
          instagram_en: formData.instagram,
          instagramtext_sor: '',
          instagramtext_bad: '',
          instagramtext_ar: '',
          instagramtext_en: '',
          instagramclickcount_sor: 0,
          instagramclickcount_bad: 0,
          instagramclickcount_ar: 0,
          instagramclickcount_en: 0,
        }];
      }
      
      if (formData.website) {
        serviceData.websitedata = [{
          website_sor: formData.website,
          website_bad: formData.website,
          website_ar: formData.website,
          website_en: formData.website,
          websitetext_sor: '',
          websitetext_bad: '',
          websitetext_ar: '',
          websitetext_en: '',
          websiteclickcount_sor: 0,
          websiteclickcount_bad: 0,
          websiteclickcount_ar: 0,
          websiteclickcount_en: 0,
        }];
      }
      
      // Remove temp fields
      delete serviceData.phone;
      delete serviceData.phoneText;
      delete serviceData.whatsapp;
      delete serviceData.whatsappText;
      delete serviceData.email;
      delete serviceData.emailText;
      delete serviceData.facebook;
      delete serviceData.instagram;
      delete serviceData.website;

      if (editingService) {
        await updateService(editingService.id, serviceData);
        toast.success('Service updated successfully!');
      } else {
        await createService(serviceData);
        toast.success('Service created successfully!');
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this service?')) return;

    setLoading(true);
    try {
      await deleteService(id);
      toast.success('Service deleted successfully!');
      await loadData();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (id) => {
    setLoading(true);
    try {
      await duplicateService(id);
      toast.success('Service duplicated successfully!');
      await loadData();
    } catch (error) {
      console.error('Error duplicating service:', error);
      toast.error('Failed to duplicate service');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedServices.length} services?`)) return;

    setLoading(true);
    try {
      await bulkDeleteServices(selectedServices);
      toast.success(`${selectedServices.length} services deleted!`);
      setSelectedServices([]);
      await loadData();
    } catch (error) {
      console.error('Error deleting services:', error);
      toast.error('Failed to delete services');
    } finally {
      setLoading(false);
    }
  };

  if (!canAccess('services_new')) {
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
              <h1 className="text-3xl font-bold text-gray-900">Services</h1>
              <p className="text-gray-600 mt-1">Manage all services</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary flex items-center gap-2"
            >
              <FiPlus size={20} />
              Add New Service
            </button>
          </div>

          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 w-full"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="select"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={`categories_new/${cat.id}`}>
                    {cat.name_sor || cat.name_en || cat.id}
                  </option>
                ))}
              </select>
              {selectedServices.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="btn btn-danger flex items-center gap-2"
                >
                  <FiTrash2 />
                  Delete {selectedServices.length}
                </button>
              )}
            </div>
          </div>

          {loading && !services.length ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600">No services found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <div key={service.id} className="card hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(service.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedServices([...selectedServices, service.id]);
                        } else {
                          setSelectedServices(selectedServices.filter(id => id !== service.id));
                        }
                      }}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenModal(service)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                      >
                        <FiEdit2 size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(service.id)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                      >
                        <FiCopy size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-1.5 hover:bg-gray-100 rounded"
                      >
                        <FiTrash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  {service.image_sor && (
                    <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img src={service.image_sor} alt={service.name_sor} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900">{service.name_sor || service.name_en}</h3>
                    {service.jobtitle_sor && (
                      <p className="text-sm text-gray-600">{service.jobtitle_sor}</p>
                    )}
                    {service.job_sor && (
                      <p className="text-xs text-gray-500 line-clamp-2">{service.job_sor}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {service.visibility_sor ? (
                        <FiEye className="text-green-600" size={16} />
                      ) : (
                        <FiEyeOff className="text-gray-400" size={16} />
                      )}
                      <span className="text-xs text-gray-500">
                        Views: {service.pageview_sor || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button onClick={handleCloseModal}>
                <FiX size={24} className="text-gray-600 hover:text-gray-900" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* Category Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.categoryref}
                    onChange={(e) => setFormData({ ...formData, categoryref: e.target.value })}
                    className="select"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={`categories_new/${cat.id}`}>
                        {cat.name_sor || cat.name_en || cat.id}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Multi-language Fields */}
                <LanguageTabs>
                  {(lang) => (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service Name ({lang.toUpperCase()}) *
                        </label>
                        <input
                          type="text"
                          value={formData[`name_${lang}`]}
                          onChange={(e) => setFormData({
                            ...formData,
                            [`name_${lang}`]: e.target.value
                          })}
                          className="input"
                          placeholder="Service name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Title ({lang.toUpperCase()})
                        </label>
                        <input
                          type="text"
                          value={formData[`jobtitle_${lang}`]}
                          onChange={(e) => setFormData({
                            ...formData,
                            [`jobtitle_${lang}`]: e.target.value
                          })}
                          className="input"
                          placeholder="Job title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description ({lang.toUpperCase()})
                        </label>
                        <textarea
                          value={formData[`job_${lang}`]}
                          onChange={(e) => setFormData({
                            ...formData,
                            [`job_${lang}`]: e.target.value
                          })}
                          className="textarea"
                          rows="3"
                          placeholder="Service description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image URL ({lang.toUpperCase()})
                        </label>
                        <input
                          type="url"
                          value={formData[`image_${lang}`]}
                          onChange={(e) => setFormData({
                            ...formData,
                            [`image_${lang}`]: e.target.value
                          })}
                          className="input"
                          placeholder="https://example.com/image.png"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`vis_${lang}`}
                          checked={formData[`visibility_${lang}`]}
                          onChange={(e) => setFormData({
                            ...formData,
                            [`visibility_${lang}`]: e.target.checked
                          })}
                          className="w-4 h-4 text-primary rounded"
                        />
                        <label htmlFor={`vis_${lang}`} className="text-sm font-medium text-gray-700">
                          Visible in {lang.toUpperCase()}
                        </label>
                      </div>
                    </div>
                  )}
                </LanguageTabs>

                {/* Contact Information */}
                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-bold mb-4">Contact Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input"
                        placeholder="07501234567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Label
                      </label>
                      <input
                        type="text"
                        value={formData.phoneText}
                        onChange={(e) => setFormData({ ...formData, phoneText: e.target.value })}
                        className="input"
                        placeholder="Main Office"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp
                      </label>
                      <input
                        type="url"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        className="input"
                        placeholder="http://wa.me/9647501234567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        WhatsApp Label
                      </label>
                      <input
                        type="text"
                        value={formData.whatsappText}
                        onChange={(e) => setFormData({ ...formData, whatsappText: e.target.value })}
                        className="input"
                        placeholder="Customer Service"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input"
                        placeholder="info@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Label
                      </label>
                      <input
                        type="text"
                        value={formData.emailText}
                        onChange={(e) => setFormData({ ...formData, emailText: e.target.value })}
                        className="input"
                        placeholder="Info"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Facebook URL
                      </label>
                      <input
                        type="url"
                        value={formData.facebook}
                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                        className="input"
                        placeholder="https://facebook.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Instagram URL
                      </label>
                      <input
                        type="url"
                        value={formData.instagram}
                        onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                        className="input"
                        placeholder="https://instagram.com/..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website URL
                      </label>
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="input"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingService ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
