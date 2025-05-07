import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import 'reactflow/dist/base.css';

import ColdEmailNode from './components/ColdEmailNode';
import WaitNode from './components/WaitNode';
import LeadSourceNode from './components/LeadSourceNode';

const API_URL = 'http://localhost:5000/api';

const nodeTypes = {
  coldEmail: ColdEmailNode,
  wait: WaitNode,
  leadSource: LeadSourceNode,
};

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [nextId, setNextId] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges]);

  const addNode = (type) => {
    console.log(`Adding ${type} node`);
    const newNode = {
      id: `node-${nextId}`,
      type: type,
      position: { 
        x: 250, 
        y: 100 + (nodes.length * 150) 
      },
      data: { 
        label: `${type} Node`,
        ...(type === 'coldEmail' && { 
          emailContent: '',
          subject: '',
          recipientEmail: ''
        }),
        ...(type === 'leadSource' && { 
          source: '',
          selectedList: ''
        }),
        ...(type === 'wait' && { 
          delay: 1,
          waitType: 'days',
          specificDate: '',
          specificTime: ''
        }),
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    setNextId(nextId + 1);
    setFeedbackMessage(`Added ${type} node`);
    
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  const calculateDelay = (nodeId, currentEdges, currentNodes) => {
    let totalDelay = 0;
    const incomingEdges = currentEdges.filter((edge) => edge.target === nodeId);

    for (const edge of incomingEdges) {
      const sourceNode = currentNodes.find((node) => node.id === edge.source);
      if (sourceNode?.type === 'wait') {
        if (sourceNode.data.waitType === 'days') {
          const delayDays = parseInt(sourceNode.data.delay || 1, 10);
          totalDelay += delayDays * 24 * 60 * 60 * 1000; 
        } else if (sourceNode.data.waitType === 'specific') {
          if (sourceNode.data.specificDate && sourceNode.data.specificTime) {
            const targetDate = new Date(`${sourceNode.data.specificDate}T${sourceNode.data.specificTime}`);
            const now = new Date();
            
            if (targetDate > now) {
              totalDelay += targetDate.getTime() - now.getTime();
            }
          }
        }
      }
      
      if (sourceNode) {
        totalDelay += calculateDelay(sourceNode.id, currentEdges, currentNodes);
      }
    }

    return totalDelay;
  };

  const saveFlow = async () => {
    try {
      setIsLoading(true);
      setFeedbackMessage('Saving flow...');
      
      const saveResponse = await fetch(`${API_URL}/save-flow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      
      if (!saveResponse.ok) {
        const error = await saveResponse.json();
        throw new Error(error.message || 'Failed to save flow');
      }
      
      setFeedbackMessage('Flow saved successfully! Scheduling emails...');
      
      let emailsScheduled = 0;
      for (const node of nodes) {
        if (node.type === 'coldEmail') {
          let scheduleTime;
          
          const delayMs = calculateDelay(node.id, edges, nodes);
          
          scheduleTime = new Date(Date.now() + delayMs + (5 * 60 * 1000));
          
          const incomingEdges = edges.filter(edge => edge.target === node.id);
          for (const edge of incomingEdges) {
            const sourceNode = nodes.find(n => n.id === edge.source);
            
            if (sourceNode?.type === 'wait' && sourceNode.data.waitType === 'specific') {
              if (sourceNode.data.specificDate && sourceNode.data.specificTime) {
                const specificDateTime = new Date(`${sourceNode.data.specificDate}T${sourceNode.data.specificTime}`);
                
                if (specificDateTime > new Date()) {
                  scheduleTime = specificDateTime;
                  break;
                }
              }
            }
          }
          
          const emailResponse = await fetch(`${API_URL}/schedule-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: node.data.recipientEmail || 'yashplw@gmail.com',
              subject: node.data.subject || 'Cold Email',
              body: node.data.body || node.data.emailContent || 'Default email content',
              time: scheduleTime.toISOString()
            }),
          });
          
          if (!emailResponse.ok) {
            const error = await emailResponse.json();
            throw new Error(error.message || 'Failed to schedule email');
          }
          
          emailsScheduled++;
        }
      }
      
      setFeedbackMessage(`Flow saved and ${emailsScheduled} emails scheduled successfully!`);
      
      setTimeout(() => setFeedbackMessage(''), 5000);
    } catch (error) {
      console.error('Error:', error);
      setFeedbackMessage(`Error: ${error.message}`);
      
      setTimeout(() => setFeedbackMessage(''), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      width: '100%', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column'
    }}>
      {feedbackMessage && (
        <div style={{
          padding: '10px',
          backgroundColor: feedbackMessage.includes('Error') ? '#f8d7da' : '#d4edda',
          color: feedbackMessage.includes('Error') ? '#721c24' : '#155724',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {feedbackMessage}
        </div>
      )}
      
      <div style={{ 
        flex: 1, 
        display: 'flex',
        overflow: 'hidden'
      }}>
        <div style={{ 
          width: '200px', 
          padding: '10px', 
          borderRight: '1px solid #ccc', 
          backgroundColor: '#f8f8f8',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <button 
            onClick={() => addNode('leadSource')}
            disabled={isLoading}
            style={{ 
              display: 'block', 
              width: '100%', 
              margin: '5px 0', 
              padding: '8px', 
              background: '#4285f4', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            Add Lead Source
          </button>
          <button 
            onClick={() => addNode('coldEmail')}
            disabled={isLoading}
            style={{ 
              display: 'block', 
              width: '100%', 
              margin: '5px 0', 
              padding: '8px', 
              background: '#4285f4', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            Add Cold Email
          </button>
          <button 
            onClick={() => addNode('wait')}
            disabled={isLoading}
            style={{ 
              display: 'block', 
              width: '100%', 
              margin: '5px 0', 
              padding: '8px', 
              background: '#4285f4', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            Add Wait
          </button>
          <button 
            onClick={saveFlow}
            disabled={isLoading}
            style={{ 
              display: 'block', 
              width: '100%', 
              margin: '5px 0', 
              marginTop: '20px', 
              padding: '8px', 
              background: '#0f9d58', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1
            }}
          >
            {isLoading ? 'Saving...' : 'Save Flow'}
          </button>
          
          <div style={{ 
            marginTop: 'auto',
            padding: '10px', 
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            backgroundColor: 'white' 
          }}>
            <p>Nodes: {nodes.length}</p>
            <p>Connections: {edges.length}</p>
          </div>
        </div>
        
        <div style={{ 
          flex: 1, 
          height: '100%',
          position: 'relative' 
        }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            style={{ 
              background: '#f8f8f8',
              width: '100%',
              height: '100%'
            }}
          >
            <Background color="#aaa" gap={16} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default App;