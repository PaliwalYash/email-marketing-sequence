import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

function LeadSourceNode({ data }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedList, setSelectedList] = useState(data.selectedList || '');
  const [searchText, setSearchText] = useState('');
  const [lists, setLists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [showNewListForm, setShowNewListForm] = useState(false);
  
  const API_URL = 'http://localhost:10000/api';
  
  const fetchLists = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/lists`);
      if (!response.ok) {
        throw new Error('Failed to fetch lists');
      }
      const data = await response.json();
      setLists(data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const addNewList = async () => {
    if (!newListName.trim()) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newListName }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create new list');
      }
      
      const newList = await response.json();
      setLists([...lists, newList]);
      setNewListName('');
      setShowNewListForm(false);
      
      setSelectedList(newList.name);
    } catch (error) {
      console.error('Error creating new list:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredLists = searchText 
    ? lists.filter(list => list.name.toLowerCase().includes(searchText.toLowerCase()))
    : lists;
  
  useEffect(() => {
    fetchLists();
  }, []);
  
  useEffect(() => {
    if (data && selectedList) {
      data.selectedList = selectedList;
      data.source = selectedList; 
    }
  }, [selectedList, data]);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);
  
  return (
    <div style={{ 
      width: '280px',
      padding: '10px',
      border: '1px solid #fbbc04',
      borderRadius: '5px',
      background: 'white'
    }}>
      <div>
        <strong>Leads from List(s)</strong>
        <p style={{ fontSize: '12px', margin: '5px 0' }}>
          Connect multiple lists as source for this sequence.
        </p>
        
        <div style={{ marginTop: '10px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            Select your List(s)
          </label>
          
          <div className="dropdown-container" style={{ position: 'relative' }}>
            <div 
              style={{ 
                border: '1px solid #ccc',
                borderRadius: '5px',
                position: 'relative'
              }}
            >
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for lists"
                style={{ 
                  width: '100%',
                  padding: '8px',
                  borderRadius: '5px',
                  border: 'none',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
              />
              <span style={{ 
                position: 'absolute', 
                right: '10px', 
                top: '50%', 
                transform: 'translateY(-50%)'
              }}>
                ▼
              </span>
            </div>
            
            {showDropdown && (
              <div style={{
                position: 'absolute',
                width: '100%',
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid #ccc',
                borderTop: 'none',
                borderRadius: '0 0 5px 5px',
                background: 'white',
                zIndex: 10
              }}>
                {isLoading ? (
                  <div style={{ padding: '10px', textAlign: 'center' }}>
                    Loading...
                  </div>
                ) : filteredLists.length > 0 ? (
                  filteredLists.map((list, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '8px 10px',
                        borderBottom: '1px solid #eee',
                        cursor: 'pointer',
                        backgroundColor: selectedList === list.name ? '#e6f3ff' : 'white'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedList(list.name);
                        setShowDropdown(false);
                      }}
                    >
                      {list.name}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '10px', textAlign: 'center' }}>
                    No lists found
                  </div>
                )}
              </div>
            )}
          </div>
          
          {selectedList && (
            <div style={{
              marginTop: '10px',
              padding: '8px',
              backgroundColor: '#f0f8ff',
              borderRadius: '5px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{selectedList}</span>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedList('');
                }}
              >
                ×
              </button>
            </div>
          )}
          
          <div style={{ 
            marginTop: '10px',
            textAlign: 'right' 
          }}>
            {showNewListForm ? (
              <div style={{
                marginTop: '10px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: '#f9f9f9'
              }}>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Enter list name"
                  style={{
                    width: '100%',
                    padding: '8px',
                    marginBottom: '10px',
                    borderRadius: '3px',
                    border: '1px solid #ccc'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    style={{
                      padding: '6px 12px',
                      marginRight: '8px',
                      backgroundColor: '#f5f5f5',
                      border: '1px solid #ccc',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNewListForm(false);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#2196f3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      opacity: isLoading ? 0.7 : 1
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      addNewList();
                    }}
                    disabled={isLoading || !newListName.trim()}
                  >
                    {isLoading ? 'Adding...' : 'Add List'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNewListForm(true);
                }}
              >
                <span style={{ marginRight: '5px' }}>+</span>
                New List
              </button>
            )}
          </div>
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

export default LeadSourceNode;