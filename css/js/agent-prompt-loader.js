/**
 * IO BOS Divine Operating System - Agent Prompt Loader
 * 
 * This module handles the dynamic loading of agent prompts from the external JSON file.
 * It provides functions to load agent data, set active agent, and manage agent interactions.
 */

// Cache for storing loaded agent data to improve performance
const agentCache = {};

/**
 * Load agent prompt data from JSON file
 * @param {string} agentName - Name of the agent (GENESIS, EXODUS, ORACLE, BABYLON)
 * @returns {Promise<Object>} - Promise resolving to agent data object
 */
async function loadAgentPrompt(agentName) {
  try {
    // First try to load from cache to improve performance
    if (agentCache[agentName]) {
      console.log(`Loading ${agentName} from cache`);
      return agentCache[agentName];
    }

    // First attempt to load from secure backend route
    try {
      const secureResponse = await fetch(`/api/agent-prompts/${agentName}`, {
        headers: {
          'Authorization': `Bearer ${getSessionToken()}`
        }
      });
      
      if (secureResponse.ok) {
        const data = await secureResponse.json();
        // Cache the result for future use
        agentCache[agentName] = data;
        return data;
      }
    } catch (secureError) {
      console.log('Secure route unavailable, falling back to direct file access');
    }

    // Fallback to direct file access if secure route is unavailable
    const response = await fetch('/css/js/public/agents/agent-prompts.json');
    if (!response.ok) {
      throw new Error(`Failed to load agent prompts: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const agent = data[agentName];

    if (!agent) {
      throw new Error(`Agent "${agentName}" not found in prompts file.`);
    }

    // Cache the result for future use
    agentCache[agentName] = agent;
    
    return agent;
  } catch (error) {
    console.error('Error loading agent prompt:', error);
    // Return a default agent object in case of error
    return {
      role: "Unknown Role",
      color: "gray",
      greeting: `The ${agentName} agent is currently unavailable. Please try again later.`,
      prompt: ""
    };
  }
}

/**
 * Set the active agent in the UI and system
 * @param {string} agentName - Name of the agent to activate
 */
async function setActiveAgent(agentName) {
  try {
    // Load the agent data
    const agent = await loadAgentPrompt(agentName);
    
    // Set agent data in the system
    setAgentPrompt(agent.prompt);
    setAgentGreeting(agent.greeting);
    setAgentRole(agent.role);
    setAgentColor(agent.color);
    
    // Update UI to reflect the active agent
    updateAgentUI(agentName, agent);
    
    // Display greeting in chat
    displayMessage(agent.greeting, "agent");
    
    // Log agent activation
    console.log(`${agentName} agent activated with role: ${agent.role}`);
    
    // Return the agent data for any additional processing
    return agent;
  } catch (error) {
    console.error(`Error activating ${agentName} agent:`, error);
    displayMessage(`Unable to activate ${agentName} agent. Please try again later.`, "system");
  }
}

/**
 * Update UI elements to reflect the active agent
 * @param {string} agentName - Name of the active agent
 * @param {Object} agent - Agent data object
 */
function updateAgentUI(agentName, agent) {
  // Update agent name display
  const agentNameElements = document.querySelectorAll('.agent-name');
  agentNameElements.forEach(el => {
    el.textContent = agentName;
  });
  
  // Update agent role display
  const agentRoleElements = document.querySelectorAll('.agent-role');
  agentRoleElements.forEach(el => {
    el.textContent = agent.role;
  });
  
  // Update agent color theme
  document.body.setAttribute('data-agent-theme', agentName.toLowerCase());
  
  // Update agent avatar if it exists
  const agentAvatar = document.querySelector('.agent-avatar');
  if (agentAvatar) {
    agentAvatar.src = `/images/agents/${agentName.toLowerCase()}-avatar.svg`;
    agentAvatar.alt = agentName;
  }
  
  // Add active class to the selected agent card and remove from others
  const agentCards = document.querySelectorAll('.agent-card');
  agentCards.forEach(card => {
    if (card.getAttribute('data-agent') === agentName.toLowerCase()) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });
}

/**
 * Get the current session token for secure API requests
 * @returns {string} - Session token or empty string if not available
 */
function getSessionToken() {
  return localStorage.getItem('io-bos-session-token') || '';
}

/**
 * Set the agent prompt in the system
 * @param {string} prompt - The agent's prompt text
 */
function setAgentPrompt(prompt) {
  // Store the prompt in session storage for use in API calls
  sessionStorage.setItem('current-agent-prompt', prompt);
  
  // Dispatch event for other components that need to know about prompt changes
  window.dispatchEvent(new CustomEvent('agent-prompt-updated', {
    detail: { prompt }
  }));
}

/**
 * Set the agent greeting in the system
 * @param {string} greeting - The agent's greeting text
 */
function setAgentGreeting(greeting) {
  sessionStorage.setItem('current-agent-greeting', greeting);
}

/**
 * Set the agent role in the system
 * @param {string} role - The agent's role description
 */
function setAgentRole(role) {
  sessionStorage.setItem('current-agent-role', role);
  
  // Update role display in UI if it exists
  const roleDisplay = document.getElementById('agent-role-display');
  if (roleDisplay) {
    roleDisplay.textContent = role;
  }
}

/**
 * Set the agent color theme
 * @param {string} color - The agent's color theme
 */
function setAgentColor(color) {
  // Set a CSS variable that can be used for styling
  document.documentElement.style.setProperty('--agent-color', color);
  
  // Add a class to the body for more specific styling
  document.body.className = document.body.className.replace(/agent-color-\w+/g, '');
  document.body.classList.add(`agent-color-${color}`);
}

/**
 * Display a message in the chat interface
 * @param {string} message - The message text to display
 * @param {string} sender - The sender of the message ('agent', 'user', or 'system')
 */
function displayMessage(message, sender) {
  // Get the chat container
  const chatContainer = document.querySelector('.chat-container') || document.querySelector('.conversation-container');
  
  if (!chatContainer) {
    console.error('Chat container not found in the DOM');
    return;
  }
  
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = `message ${sender}-message`;
  
  // Create message content
  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = message;
  
  // Add timestamp
  const timestamp = document.createElement('div');
  timestamp.className = 'message-timestamp';
  timestamp.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  // Assemble message
  messageElement.appendChild(messageContent);
  messageElement.appendChild(timestamp);
  
  // Add to chat
  chatContainer.appendChild(messageElement);
  
  // Scroll to bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Export functions for use in other modules
window.IOBOSAgentLoader = {
  loadAgentPrompt,
  setActiveAgent,
  displayMessage
};

// Initialize by loading the default agent if specified in URL or localStorage
document.addEventListener('DOMContentLoaded', () => {
  // Check URL parameters for agent selection
  const urlParams = new URLSearchParams(window.location.search);
  const agentParam = urlParams.get('agent');
  
  // Check localStorage for previously selected agent
  const storedAgent = localStorage.getItem('io-bos-selected-agent');
  
  // Determine which agent to load
  const agentToLoad = agentParam || storedAgent || 'GENESIS'; // Default to GENESIS
  
  // Load the agent if we're on a page that uses agents
  if (document.querySelector('.agent-container') || document.querySelector('.chat-container')) {
    setActiveAgent(agentToLoad.toUpperCase());
    
    // Store the selection for future visits
    localStorage.setItem('io-bos-selected-agent', agentToLoad.toUpperCase());
  }
});

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

/**
 * IO BOS Divine Operating System - Demo Features
 * 
 * This module provides special features for demonstration purposes:
 * - One-click installation prompt
 * - Demo account auto-fill
 * - Presentation mode
 * - Shareable deep links
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if this is the first visit
    const hasVisited = localStorage.getItem('io-bos-visited');
    
    // Initialize demo features
    initInstallPrompt();
    initDemoAccount();
    initPresentationMode();
    initShareableLinks();
    
    // Mark as visited
    if (!hasVisited) {
        localStorage.setItem('io-bos-visited', 'true');
        // Show installation prompt on first visit
        setTimeout(showInstallPrompt, 3000);
    }
});

/**
 * Initialize installation prompt functionality
 */
function initInstallPrompt() {
    let deferredPrompt;
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 76+ from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        
        // Add install button if on index page
        if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
            createInstallButton(deferredPrompt);
        }
    });
    
    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
        // Log install to analytics
        console.log('IO BOS Divine OS was installed');
        // Clear the deferredPrompt variable
        deferredPrompt = null;
        // Hide install button
        const installButton = document.getElementById('install-button');
        if (installButton) {
            installButton.style.display = 'none';
        }
    });
}

/**
 * Create and show installation button
 */
function createInstallButton(deferredPrompt) {
    // Create install button if not exists
    if (!document.getElementById('install-button')) {
        const installButton = document.createElement('button');
        installButton.id = 'install-button';
        installButton.className = 'install-button';
        installButton.innerHTML = 'Add to Home Screen <i class="fas fa-download"></i>';
        
        // Add click event
        installButton.addEventListener('click', async () => {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            const { outcome } = await deferredPrompt.userChoice;
            // Log outcome
            console.log(`User ${outcome} the installation`);
            // Clear the deferredPrompt variable
            deferredPrompt = null;
            // Hide button
            installButton.style.display = 'none';
        });
        
        // Add to page
        const authContainer = document.querySelector('.auth-container');
        if (authContainer) {
            authContainer.appendChild(installButton);
        }
    }
}

/**
 * Show installation prompt modal
 */
function showInstallPrompt() {
    // Only show on index page
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        return;
    }
    
    // Create modal if not exists
    if (!document.getElementById('install-modal')) {
        const modal = document.createElement('div');
        modal.id = 'install-modal';
        modal.className = 'install-modal';
        modal.innerHTML = `
            <div class="install-modal-content">
                <div class="install-modal-header">
                    <h3>Install IO BOS Divine OS</h3>
                    <button class="install-modal-close">&times;</button>
                </div>
                <div class="install-modal-body">
                    <p>Add IO BOS to your home screen for the best experience:</p>
                    <ul>
                        <li>Offline access</li>
                        <li>Faster loading</li>
                        <li>Full-screen experience</li>
                    </ul>
                </div>
                <div class="install-modal-footer">
                    <button id="install-modal-button" class="btn-primary">Install Now</button>
                    <button id="install-modal-later" class="btn-secondary">Later</button>
                </div>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(modal);
        
        // Add event listeners
        document.querySelector('.install-modal-close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('install-modal-later').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        document.getElementById('install-modal-button').addEventListener('click', () => {
            // Trigger install button click if exists
            const installButton = document.getElementById('install-button');
            if (installButton) {
                installButton.click();
            }
            modal.style.display = 'none';
        });
        
        // Show modal
        modal.style.display = 'flex';
    }
}

/**
 * Initialize demo account functionality
 */
function initDemoAccount() {
    // Check if on login page
    if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
        // Add demo account button
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            const demoButton = document.createElement('button');
            demoButton.type = 'button';
            demoButton.className = 'demo-account-btn';
            demoButton.textContent = 'Use Demo Account';
            
            demoButton.addEventListener('click', () => {
                // Fill in demo credentials
                document.getElementById('username').value = 'demo@iobos.divine';
                document.getElementById('password').value = 'divinedemo2025';
                document.getElementById('invitation-code').value = 'GENESIS2025';
                
                // Show success message
                const message = document.createElement('div');
                message.className = 'demo-message';
                message.textContent = 'Demo credentials loaded. Click Sign In to continue.';
                message.style.color = 'var(--electric-blue)';
                message.style.marginTop = '10px';
                message.style.fontSize = '0.9rem';
                
                // Remove existing message if any
                const existingMessage = document.querySelector('.demo-message');
                if (existingMessage) {
                    existingMessage.remove();
                }
                
                // Add message after demo button
                demoButton.parentNode.insertBefore(message, demoButton.nextSibling);
                
                // Auto-focus the sign in button
                const signInBtn = document.querySelector('.sign-in-btn');
                if (signInBtn) {
                    signInBtn.focus();
                }
            });
            
            // Add button before the divine council container
            const divineCouncilContainer = document.querySelector('.divine-council-container');
            if (divineCouncilContainer) {
                loginForm.insertBefore(demoButton, divineCouncilContainer);
            } else {
                loginForm.appendChild(demoButton);
            }
        }
    }
}

/**
 * Initialize presentation mode functionality
 */
function initPresentationMode() {
    // Add presentation mode toggle to all pages except login
    if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
        // Create presentation mode button
        const presentationButton = document.createElement('button');
        presentationButton.className = 'presentation-mode-btn';
        presentationButton.innerHTML = '<i class="fas fa-tv"></i> Presentation Mode';
        
        // Add click event
        presentationButton.addEventListener('click', togglePresentationMode);
        
        // Add to header right section if exists
        const headerRight = document.querySelector('.header-right');
        if (headerRight) {
            headerRight.appendChild(presentationButton);
        }
    }
}

/**
 * Toggle presentation mode
 */
function togglePresentationMode() {
    document.body.classList.toggle('presentation-mode');
    
    // If entering presentation mode
    if (document.body.classList.contains('presentation-mode')) {
        // Create presentation controls
        if (!document.getElementById('presentation-controls')) {
            const controls = document.createElement('div');
            controls.id = 'presentation-controls';
            controls.className = 'presentation-controls';
            controls.innerHTML = `
                <div class="presentation-header">
                    <h3>IO BOS Presentation Mode</h3>
                    <button id="exit-presentation" class="exit-presentation-btn">Exit</button>
                </div>
                <div class="presentation-features">
                    <button id="highlight-agents" class="presentation-feature-btn">Highlight Agents</button>
                    <button id="highlight-boardroom" class="presentation-feature-btn">Highlight Boardroom</button>
                    <button id="highlight-sandbox" class="presentation-feature-btn">Highlight Sandbox</button>
                </div>
            `;
            
            // Add to page
            document.body.appendChild(controls);
            
            // Add event listeners
            document.getElementById('exit-presentation').addEventListener('click', togglePresentationMode);
            
            document.getElementById('highlight-agents').addEventListener('click', () => {
                highlightSection('.agent-carousel-section');
            });
            
            document.getElementById('highlight-boardroom').addEventListener('click', () => {
                highlightSection('.boardroom-section');
            });
            
            document.getElementById('highlight-sandbox').addEventListener('click', () => {
                highlightSection('.sandbox-section');
            });
        }
    } else {
        // Remove presentation controls
        const controls = document.getElementById('presentation-controls');
        if (controls) {
            controls.remove();
        }
        
        // Remove any highlights
        removeHighlights();
    }
}

/**
 * Highlight a specific section in presentation mode
 */
function highlightSection(selector) {
    // Remove existing highlights
    removeHighlights();
    
    // Add highlight to selected section
    const section = document.querySelector(selector);
    if (section) {
        section.classList.add('presentation-highlight');
        
        // Scroll to section
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Remove all highlights
 */
function removeHighlights() {
    document.querySelectorAll('.presentation-highlight').forEach(el => {
        el.classList.remove('presentation-highlight');
    });
}

/**
 * Initialize shareable links functionality
 */
function initShareableLinks() {
    // Add share button to agent cards
    document.querySelectorAll('.agent-card').forEach(card => {
        const agentName = card.getAttribute('data-agent');
        if (agentName) {
            const shareButton = document.createElement('button');
            shareButton.className = 'share-agent-btn';
            shareButton.innerHTML = '<i class="fas fa-share-alt"></i>';
            shareButton.title = `Share ${agentName.toUpperCase()} agent`;
            
            shareButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
                shareAgent(agentName);
            });
            
            // Add to agent actions
            const agentActions = card.querySelector('.agent-actions');
            if (agentActions) {
                agentActions.appendChild(shareButton);
            }
        }
    });
}

/**
 * Share agent link
 */
function shareAgent(agentName) {
    // Create shareable link
    const shareUrl = `${window.location.origin}/agent.html?agent=${agentName}&demo=true`;
    
    // Check if Web Share API is available
    if (navigator.share) {
        navigator.share({
            title: `IO BOS - ${agentName.toUpperCase()} Agent`,
            text: `Check out the ${agentName.toUpperCase()} agent in IO BOS Divine Operating System`,
            url: shareUrl
        }).catch(console.error);
    } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            // Show success message
            showToast(`Link to ${agentName.toUpperCase()} copied to clipboard`);
        }).catch(console.error);
    }
}

/**
 * Show toast notification
 */
function showToast(message) {
    // Create toast if not exists
    if (!document.getElementById('toast')) {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    
    // Set message and show
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Service worker for IO BOS Divine Operating System
const CACHE_NAME = 'io-bos-divine-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/profile.html',
  '/css/styles.css',
  '/css/dashboard.css',
  '/js/demo-features.js',
  '/images/ankh-infinity-logo.png',
  '/images/divine-council.png',
  '/images/agents/genesis-avatar.svg',
  '/images/agents/exodus-avatar.svg',
  '/images/agents/oracle-avatar.svg',
  '/images/agents/babylon-avatar.svg',
  '/images/icon-512x512.png',
  '/images/icon-192x192.png'
];

// Install event - cache all required resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          response => {
            // Check if valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone the response
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        );
      })
  );
});

// Background sync for offline functionality
self.addEventListener('sync', event => {
  if (event.tag === 'io-bos-sync') {
    event.waitUntil(syncData());
  }
});

// Function to sync data when back online
async function syncData() {
  // Implementation for syncing data when back online
  console.log('Syncing data after coming back online');
  // Add code to sync any stored offline data with server
}
