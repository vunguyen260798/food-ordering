import React, { useState, useEffect } from 'react';
import { partnerAPI } from '../services/api';
import PartnerForm from '../components/PartnerForm';
import PartnerTable from '../components/PartnerTable';

const PartnerManagement = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async (search = '') => {
    try {
      setLoading(true);
      setError('');
      const response = await partnerAPI.getAllPartners(search);
      setPartners(response.data || []);
    } catch (err) {
      setError('Failed to fetch partners');
      console.error('Fetch partners error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPartners(searchTerm);
  };

  const handleCreatePartner = async (partnerData) => {
    try {
      setError('');
      await partnerAPI.createPartner(partnerData);
      setSuccess('Partner created successfully!');
      setShowForm(false);
      fetchPartners(searchTerm);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create partner');
    }
  };

  const handleUpdatePartner = async (partnerData) => {
    try {
      setError('');
      await partnerAPI.updatePartner(editingPartner._id, partnerData);
      setSuccess('Partner updated successfully!');
      setShowForm(false);
      setEditingPartner(null);
      fetchPartners(searchTerm);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update partner');
    }
  };

  const handleDeletePartner = async (partnerId) => {
    if (!window.confirm('Are you sure you want to delete this partner?')) {
      return;
    }

    try {
      setError('');
      await partnerAPI.deletePartner(partnerId);
      setSuccess('Partner deleted successfully!');
      fetchPartners(searchTerm);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete partner');
    }
  };

  const handleEditPartner = (partner) => {
    setEditingPartner(partner);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingPartner(null);
    setError('');
  };

  return (
    <div>
      <div className="page-header">
        <h1>Partner Management</h1>
        <p>Manage your business partners</p>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {!showForm ? (
        <>
          <div className="actions">
            <button 
              className="btn btn-primary" 
              onClick={() => setShowForm(true)}
            >
              + Add New Partner
            </button>
            <button 
              className="btn btn-warning" 
              onClick={() => fetchPartners(searchTerm)}
            >
              🔄 Refresh
            </button>
          </div>

      
          {loading ? (
            <div className="loading">Loading partners...</div>
          ) : (
            <PartnerTable 
              partners={partners}
              onEdit={handleEditPartner}
              onDelete={handleDeletePartner}
            />
          )}
        </>
      ) : (
        <PartnerForm
          partner={editingPartner}
          onSubmit={editingPartner ? handleUpdatePartner : handleCreatePartner}
          onCancel={handleCancelForm}
          isEditing={!!editingPartner}
        />
      )}
    </div>
  );
};

export default PartnerManagement;
