/**
 * IO BOS Divine Operating System - Agent Selection Integration
 * 
 * This module handles the UI interactions for selecting agents and integrates
 * with the agent-prompt-loader.js to dynamically load agent data.
 */

document.addEventListener('DOMContentLoaded', () => {
  initializeAgentSelection();
  setupEventListeners();
});

/**
 * Initialize the agent selection interface
 */
function initializeAgentSelection() {
  // Get all agent cards
  const agentCards = document.querySelectorAll('.agent-card');
  
  // Get stored agent selection from localStorage
  const storedAgent = localStorage.getItem('io-bos-selected-agent') || 'GENESIS';
  
  // Initialize the UI with the stored agent
  agentCards.forEach(card => {
    const agentName = card.getAttribute('data-agent');
    if (agentName && agentName.toUpperCase() === storedAgent) {
      // Add active class to the selected agent card
      card.classList.add('active');
      
      // Load the agent data if IOBOSAgentLoader is available
      if (window.IOBOSAgentLoader) {
        window.IOBOSAgentLoader.setActiveAgent(storedAgent);
      }
    }
  });
  
  // If we're on the sandbox page, initialize the agent dropdown
  const agentDropdown = document.getElementById('agent-selector');
  if (agentDropdown) {
    agentDropdown.value = storedAgent.toLowerCase();
    updateSandboxTheme(storedAgent);
  }
}

/**
 * Set up event listeners for agent selection
 */
function setupEventListeners() {
  // Agent card click events
  const agentCards = document.querySelectorAll('.agent-card');
  agentCards.forEach(card => {
    card.addEventListener('click', handleAgentCardClick);
  });
  
  // Agent dropdown change event (for sandbox mode)
  const agentDropdown = document.getElementById('agent-selector');
  if (agentDropdown) {
    agentDropdown.addEventListener('change', handleAgentDropdownChange);
  }
  
  // Submit button for business challenge
  const submitButton = document.getElementById('submit-challenge');
  if (submitButton) {
    submitButton.addEventListener('click', handleChallengeSubmit);
  }
  
  // Enter key in challenge input
  const challengeInput = document.getElementById('business-challenge');
  if (challengeInput) {
    challengeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleChallengeSubmit();
      }
    });
  }
}

/**
 * Handle click on agent card
 * @param {Event} event - Click event
 */
function handleAgentCardClick(event) {
  // Get the clicked card
  const card = event.currentTarget;
  const agentName = card.getAttribute('data-agent');
  
  if (!agentName) return;
  
  // Remove active class from all cards
  const agentCards = document.querySelectorAll('.agent-card');
  agentCards.forEach(c => c.classList.remove('active'));
  
  // Add active class to clicked card
  card.classList.add('active');
  
  // Store selection in localStorage
  localStorage.setItem('io-bos-selected-agent', agentName.toUpperCase());
  
  // Load the agent data
  if (window.IOBOSAgentLoader) {
    window.IOBOSAgentLoader.setActiveAgent(agentName.toUpperCase());
  }
  
  // If we're on the Divine Council dashboard, show the agent panel
  const agentPanel = document.getElementById('agent-panel');
  if (agentPanel) {
    agentPanel.classList.add('active');
    
    // Update panel content with agent info
    updateAgentPanel(agentName.toUpperCase());
  }
}

/**
 * Handle change in agent dropdown (for sandbox mode)
 * @param {Event} event - Change event
 */
function handleAgentDropdownChange(event) {
  const agentName = event.target.value.toUpperCase();
  
  // Store selection in localStorage
  localStorage.setItem('io-bos-selected-agent', agentName);
  
  // Update the sandbox theme
  updateSandboxTheme(agentName);
  
  // Load the agent data
  if (window.IOBOSAgentLoader) {
    window.IOBOSAgentLoader.setActiveAgent(agentName);
  }
}

/**
 * Handle submission of business challenge
 */
function handleChallengeSubmit() {
  const challengeInput = document.getElementById('business-challenge');
  if (!challengeInput || !challengeInput.value.trim()) return;
  
  const challenge = challengeInput.value.trim();
  
  // Get selected agent
  const agentName = localStorage.getItem('io-bos-selected-agent') || 'GENESIS';
  
  // Display user message in chat
  if (window.IOBOSAgentLoader) {
    window.IOBOSAgentLoader.displayMessage(challenge, 'user');
    
    // Display placeholder response from agent
    setTimeout(() => {
      const placeholderResponse = "This is where the agent's divine intelligence will provide strategic guidance based on your business challenge or idea.";
      window.IOBOSAgentLoader.displayMessage(placeholderResponse, 'agent');
    }, 1000);
  } else {
    // Fallback if IOBOSAgentLoader is not available
    addMessageToChat(challenge, 'user');
    
    setTimeout(() => {
      const placeholderResponse = "This is where the agent's divine intelligence will provide strategic guidance based on your business challenge or idea.";
      addMessageToChat(placeholderResponse, 'agent');
    }, 1000);
  }
  
  // Clear input
  challengeInput.value = '';
}

/**
 * Update the agent panel with agent information
 * @param {string} agentName - Name of the selected agent
 */
function updateAgentPanel(agentName) {
  const panelTitle = document.querySelector('#agent-panel .panel-title');
  const panelContent = document.querySelector('#agent-panel .panel-content');
  
  if (panelTitle) {
    panelTitle.textContent = agentName;
  }
  
  if (panelContent) {
    panelContent.textContent = "This is where the agent's divine intelligence will activate.";
  }
  
  // Update panel theme based on agent
  const panel = document.getElementById('agent-panel');
  if (panel) {
    // Remove existing agent classes
    panel.className = panel.className.replace(/agent-\w+/g, '');
    // Add new agent class
    panel.classList.add(`agent-${agentName.toLowerCase()}`);
  }
}

/**
 * Update the sandbox theme based on selected agent
 * @param {string} agentName - Name of the selected agent
 */
function updateSandboxTheme(agentName) {
  // Update submit button color
  const submitButton = document.getElementById('submit-challenge');
  if (submitButton) {
    // Remove existing agent classes
    submitButton.className = submitButton.className.replace(/agent-\w+/g, '');
    // Add new agent class
    submitButton.classList.add(`agent-${agentName.toLowerCase()}`);
  }
  
  // Update header color
  const header = document.querySelector('.sandbox-header');
  if (header) {
    // Remove existing agent classes
    header.className = header.className.replace(/agent-\w+/g, '');
    // Add new agent class
    header.classList.add(`agent-${agentName.toLowerCase()}`);
  }
  
  // Update agent info display
  const agentNameDisplay = document.getElementById('selected-agent-name');
  const agentRoleDisplay = document.getElementById('selected-agent-role');
  
  if (agentNameDisplay) {
    agentNameDisplay.textContent = agentName;
  }
  
  if (agentRoleDisplay) {
    // Set role based on agent
    let role = "";
    switch (agentName) {
      case 'GENESIS':
        role = "Strategic Insight Analyst";
        break;
      case 'EXODUS':
        role = "Bottleneck Eliminator";
        break;
      case 'ORACLE':
        role = "Scale & Tool Architect";
        break;
      case 'BABYLON':
        role = "Asset & Security Advisor";
        break;
      default:
        role = "Divine Agent";
    }
    agentRoleDisplay.textContent = role;
  }
}

/**
 * Add a message to the chat (fallback if IOBOSAgentLoader is not available)
 * @param {string} message - Message text
 * @param {string} sender - Sender type ('user' or 'agent')
 */
function addMessageToChat(message, sender) {
  const chatContainer = document.querySelector('.chat-messages');
  if (!chatContainer) return;
  
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}-message`;
  
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = message;
  
  const timestamp = document.createElement('div');
  timestamp.className = 'message-timestamp';
  timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  messageElement.appendChild(messageContent);
  messageElement.appendChild(timestamp);
  
  chatContainer.appendChild(messageElement);
  
  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
