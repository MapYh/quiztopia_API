

const getvalidation = {
    before: async (request) => {
      try {
       
        if(request.event.body){
            throw new Error("Request body should be empty.");
        }
       
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
  
  module.exports = { getvalidation };