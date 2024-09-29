function sendError(statusCode, message) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  };
}

function sendResponse(response) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(response),
  };
}

module.exports = { sendError, sendResponse };
