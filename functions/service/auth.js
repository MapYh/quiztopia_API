const jwt = require("jsonwebtoken");

const validateToken = {
  before: async (request) => {
    try {
      const token = request.event.headers.authorization.replace("Bearer ", "");

      if (!token) throw new Error();

      const data = jwt.verify(
        token,
        process.env.TOKEN_SECRET,
        (error, data) => {
          if (error) {
            return error;
          } else {
            return data;
          }
        }
      );

      request.event.id = data.id;

      return request.response;
    } catch (error) {
      request.event.error = "400";
      return request.response;
    }
  },
  onError: async (request) => {
    request.event.error = "400";
    return request.response;
  },
};

module.exports = { validateToken };
