import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

function WaitNode({ data }) {
  const [waitType, setWaitType] = useState(data.waitType || 'days');
  const [showDatePicker, setShowDatePicker] = useState(data.waitType === 'specific');
  
  if (!data.delay) data.delay = 1;
  if (!data.waitType) data.waitType = 'days';
  if (!data.specificDate) data.specificDate = '';
  if (!data.specificTime) data.specificTime = '';
  
  const handleWaitTypeChange = (type) => {
    setWaitType(type);
    data.waitType = type;
    setShowDatePicker(type === 'specific');
  };
  
  return (
    <div style={{ 
      width: '220px',
      padding: '10px',
      border: '1px solid #0f9d58',
      borderRadius: '5px',
      background: 'white'
    }}>
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ background: '#555' }}
      />
      
      <div>
        <strong>Wait</strong>
        
        <div style={{ marginTop: '10px' }}>
          <div style={{ 
            display: 'flex', 
            marginBottom: '10px',
            borderBottom: '1px solid #eee',
            paddingBottom: '5px'
          }}>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                handleWaitTypeChange('days');
              }}
              style={{ 
                flex: 1, 
                textAlign: 'center', 
                padding: '5px', 
                cursor: 'pointer',
                backgroundColor: waitType === 'days' ? '#e6f4ea' : 'transparent',
                borderRadius: '3px',
                fontWeight: waitType === 'days' ? 'bold' : 'normal'
              }}
            >
              Wait Days
            </div>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                handleWaitTypeChange('specific');
              }}
              style={{ 
                flex: 1, 
                textAlign: 'center', 
                padding: '5px', 
                cursor: 'pointer',
                backgroundColor: waitType === 'specific' ? '#e6f4ea' : 'transparent',
                borderRadius: '3px',
                fontWeight: waitType === 'specific' ? 'bold' : 'normal'
              }}
            >
              Specific Time
            </div>
          </div>
          
          {waitType === 'days' && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="number"
                defaultValue={data.delay}
                min="1"
                onChange={(e) => {
                  data.delay = parseInt(e.target.value) || 1;
                }}
                style={{ 
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '3px'
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <span style={{ marginLeft: '5px' }}>Days</span>
            </div>
          )}
          
          {waitType === 'specific' && (
            <div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontSize: '12px' 
                }}>
                  Date
                </label>
                <input
                  type="date"
                  defaultValue={data.specificDate}
                  onChange={(e) => {
                    data.specificDate = e.target.value;
                  }}
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
                <label style={{ 
                  display: 'block', 
                  marginBottom: '5px', 
                  fontSize: '12px' 
                }}>
                  Time
                </label>
                <input
                  type="time"
                  defaultValue={data.specificTime}
                  onChange={(e) => {
                    data.specificTime = e.target.value;
                  }}
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
            </div>
          )}
        </div>
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ background: '#555' }}
      />
    </div>
  );
}

export default WaitNode;