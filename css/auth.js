// IO BOS Divine Operating System - Authentication Module

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('login-form');
  
  if (loginForm) {
    console.log('Login form detected, initializing authentication handlers');
    
    // Prevent default form submission and handle it with JavaScript
    loginForm.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // Get form values
      const email = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const invitationCode = document.getElementById('invitation-code')?.value || '';
      
      // Basic validation
      if (!email) {
        showError('Please enter your email');
        return;
      }
      
      if (!password) {
        showError('Please enter your password');
        return;
      }
      
      if (document.getElementById('invitation-code') && !invitationCode) {
        showError('Please enter your invitation code');
        return;
      }
      
      // Show loading state
      const submitButton = document.querySelector('.sign-in-btn');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = 'Authenticating...';
      submitButton.disabled = true;
      
      // Simulate authentication process (replace with actual authentication)
      console.log('Authenticating user:', email);
      
      // For testing purposes - simulate successful authentication
      // In production, replace with actual authentication API call
      authenticateUser(email, password, invitationCode)
        .then(response => {
          if (response.success) {
            console.log('Authentication successful');
            // Store auth token
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('userEmail', email);
            
            // Redirect to dashboard
            window.location.href = '/dashboard.html';
          } else {
            console.error('Authentication failed:', response.message);
            showError(response.message || 'Authentication failed. Please check your credentials.');
            
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
          }
        })
        .catch(error => {
          console.error('Authentication error:', error);
          showError('An error occurred during authentication. Please try again.');
          
          // Reset button state
          submitButton.textContent = originalButtonText;
          submitButton.disabled = false;
        });
    });
    
    // Handle create account button
    const createAccountButton = document.querySelector('.create-account-btn');
    if (createAccountButton) {
      createAccountButton.addEventListener('click', function() {
        // Redirect to registration page or show registration form
        console.log('Create account clicked');
        // For now, just show a message
        alert('Registration functionality will be implemented soon.');
      });
    }
  }
  
  // Check if user is already logged in
  const authToken = localStorage.getItem('authToken');
  if (authToken && window.location.pathname === '/') {
    // If user is already logged in and on the login page, redirect to dashboard
    window.location.href = '/dashboard.html';
  }
});

// Function to show error messages
function showError(message) {
  // Check if error element exists, if not create it
  let errorElement = document.querySelector('.auth-error');
  
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.className = 'auth-error';
    errorElement.style.color = '#ff3860';
    errorElement.style.marginTop = '10px';
    errorElement.style.textAlign = 'center';
    
    // Insert after the form
    const loginForm = document.getElementById('login-form');
    loginForm.appendChild(errorElement);
  }
  
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  // Hide error after 5 seconds
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

// Function to authenticate user
// In production, this should make an API call to your authentication endpoint
async function authenticateUser(email, password, invitationCode) {
  // For testing purposes - simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // This is a mock response - replace with actual authentication logic
      // For testing, we'll accept any email that contains "@" and any password with 6+ chars
      if (email.includes('@') && password.length >= 6) {
        resolve({
          success: true,
          token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
          message: 'Authentication successful'
        });
      } else {
        resolve({
          success: false,
          message: 'Invalid email or password'
        });
      }
    }, 1000); // Simulate network delay
  });
  
  // For production with Netlify Functions, use this:
  /*
  try {
    const response = await fetch('/.netlify/functions/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        invitationCode
      })
    });
    
    if (!response.ok) {
      throw new Error('Authentication request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      message: 'Authentication service unavailable'
    };
  }
  */
}

// Function to logout user
function logoutUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  window.location.href = '/';
}

// Expose logout function globally
window.logoutUser = logoutUser;

