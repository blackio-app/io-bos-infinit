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
