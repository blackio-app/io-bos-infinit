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
      
      // Send authentication request to Netlify function
      fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password,
          invitationCode: invitationCode
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Authentication failed');
        }
        return response.json();
      })
      .then(data => {
        if (data.token) {
          console.log('Authentication successful');
          // Store auth token
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userEmail', email);
          
          // Redirect to dashboard
          window.location.href = '/dashboard.html';
        } else {
          console.error('Authentication failed:', data.message);
          showError(data.message || 'Authentication failed. Please check your credentials.');
          
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

// Function to logout user
function logoutUser() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  window.location.href = '/';
}

// Expose logout function globally
window.logoutUser = logoutUser;
