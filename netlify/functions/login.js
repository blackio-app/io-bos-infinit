// Netlify Function for handling login requests with CORS support and custom credentials
exports.handler = async function(event, context) {
  // Set up CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: "Method not allowed" })
    };
  }

  try {
    // Parse the request body
    const data = JSON.parse(event.body);
    const { email, password, invitationCode } = data;
    
    // Basic validation
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Email and password are required" })
      };
    }
    
    // Check for invitation code if required
    if (invitationCode === undefined || invitationCode === '') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Invitation code is required" })
      };
    }
    
    // ===== CUSTOM CREDENTIALS =====
    // Replace these with your own secure credentials
    const validEmail = "your-email@example.com";
    const validPassword = "your-secure-password";
    const validInvitationCode = "YOUR-INVITATION-CODE";
    
    // Check credentials against your custom values
    if (email === validEmail && password === validPassword && invitationCode === validInvitationCode) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token: "io-bos-token-" + Date.now(),
          message: "Login successful"
        })
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Invalid credentials" })
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal server error: " + error.message })
    };
  }
};
