document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.email.value.trim();
    const password = loginForm.password.value.trim();
    const invitationCode = loginForm.invitationCode.value.trim();

    try {
      const response = await fetch('/.netlify/functions/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, invitationCode })
      });

      const result = await response.json();

      if (response.ok) {
        // store token or session logic here
        window.location.href = '/dashboard';
      } else {
        alert(result.message || 'Login failed.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Something went wrong.');
    }
  });
});
