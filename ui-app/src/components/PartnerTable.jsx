import React from 'react';

const PartnerTable = ({ partners, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (partners.length === 0) {
    return (
      <div className="table-container">
        <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
          <h3>No partners found</h3>
          <p>Start by adding your first partner to the system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Partner Code</th>
            <th>User Name</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => (
            <tr key={partner._id}>
              <td>
                <strong style={{ 
                  backgroundColor: '#e3f2fd', 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}>
                  {partner.code}
                </strong>
              </td>
              <td>{partner.userName}</td>
              <td>
                <small>{formatDate(partner.createdAt)}</small>
              </td>
              <td>
                <small>{formatDate(partner.updatedAt)}</small>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button
                    onClick={() => onEdit(partner)}
                    className="btn btn-sm btn-primary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(partner._id)}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PartnerTable;
