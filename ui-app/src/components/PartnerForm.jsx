import React, { useState, useEffect } from 'react';

const PartnerForm = ({ partner, onSubmit, onCancel, isEditing }) => {
  const [formData, setFormData] = useState({
    code: '',
    userName: ''
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        code: partner.code || '',
        userName: partner.userName || ''
      });
    }
  }, [partner]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="form-container">
      <h2>{isEditing ? 'Edit Partner' : 'Add New Partner'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Partner Code *</label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            className="form-control"
            placeholder="e.g., PARTNER001"
            required
            style={{ textTransform: 'uppercase' }}
          />
          <small style={{ color: '#7f8c8d', display: 'block', marginTop: '5px' }}>
            Partner code will be automatically converted to uppercase
          </small>
        </div>

        <div className="form-group">
          <label>User Name *</label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleInputChange}
            className="form-control"
            placeholder="e.g., John Doe"
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {isEditing ? 'Update Partner' : 'Create Partner'}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default PartnerForm;
