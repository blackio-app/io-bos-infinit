require('dotenv').config();

exports.handler = async function(event, context) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: "Method not allowed" })
    };
  }

  try {
    const data = JSON.parse(event.body);
    const { email, password, invitationCode } = data;
    
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Email and password are required" })
      };
    }
    
    const invitationCodeRegex = /^[A-Z0-9]{8,12}$/;
    if (!invitationCodeRegex.test(invitationCode)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Invalid invitation code format" })
      };
    }
    
    const validEmail = process.env.VALID_EMAIL;
    const validPassword = process.env.VALID_PASSWORD;
    const validInvitationCode = process.env.VALID_INVITATION_CODE;
    
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
        body: JSON.stringify({ message: "Invalid email, password, or invitation code" })
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
