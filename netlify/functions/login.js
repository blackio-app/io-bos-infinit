exports.handler = async (event) => {
  const { email, password, invitationCode } = JSON.parse(event.body || '{}');

  if (
    email === "admin@example.com" &&
    password === "password123" &&
    invitationCode === "IAMTHESOURCE"
  ) {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Login successful", token: "divine-token-001" }),
    };
  }

  return {
    statusCode: 401,
    body: JSON.stringify({ message: "Invalid credentials" }),
  };
};
