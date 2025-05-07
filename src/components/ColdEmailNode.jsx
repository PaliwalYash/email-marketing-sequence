import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

function ColdEmailNode({ data }) {
  const [activeTab, setActiveTab] = useState('content');

  const initialEmailData = {
    subject: data.subject || '',
    body: data.emailContent || '',
    recipientEmail: data.recipientEmail || ''
  };

  const handleFieldChange = (field, value) => {
    data[field] = value;
    if (field === 'body') {
      data.emailContent = value;
    }
  };

  return (
    <div style={{
      width: '300px',
      padding: '10px',
      border: '1px solid #4285f4',
      borderRadius: '5px',
      background: 'white'
    }}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
      />

      <div>
        <strong>Cold Email</strong>

        <div style={{
          display: 'flex',
          borderBottom: '1px solid #ddd',
          marginTop: '10px',
          marginBottom: '10px'
        }}>
          <div
            style={{
              padding: '5px 10px',
              cursor: 'pointer',
              fontWeight: activeTab === 'content' ? 'bold' : 'normal',
              borderBottom: activeTab === 'content' ? '2px solid #4285f4' : 'none'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab('content');
            }}
          >
            Content
          </div>
        </div>

        {activeTab === 'content' && (
          <div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                Recipient Email
              </label>
              <input
                type="email"
                defaultValue={initialEmailData.recipientEmail}
                onChange={(e) => handleFieldChange('recipientEmail', e.target.value)}
                placeholder="Enter recipient email"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  boxSizing: 'border-box'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                Email Subject
              </label>
              <input
                type="text"
                defaultValue={initialEmailData.subject}
                onChange={(e) => handleFieldChange('subject', e.target.value)}
                placeholder="Enter email subject"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  boxSizing: 'border-box'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                Email Body
              </label>
              <textarea
                defaultValue={initialEmailData.body}
                onChange={(e) => handleFieldChange('body', e.target.value)}
                placeholder="Enter email content"
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>


          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#555' }}
      />
    </div>
  );
}

export default ColdEmailNode;