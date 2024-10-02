

const getvalidation = {
    before: async (request) => {
      try {
        console.log(request.event.body);
        if(request.event.body){
            throw new Error("Request body should be empty.");
        }
       /*  const requiredFields = ["firstName", "lastName", "email"];
       
        const isValid = requiredFields.every((field) => 
        Object.keys(request.event.body).includes(field)); */
        
       /*  request.event.isValid = isValid; */
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