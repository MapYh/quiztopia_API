



const deletevalidation = {
    before: async (request) => {
      try {
        
        
        const requiredFields = ["name"];
     
        const isValid = requiredFields.every((field) => 
        Object.keys(JSON.parse(request.event.body)).includes(field));
       
        request.event.isValid = isValid;
        if(request.event.isValid == falses){
            throw new Error();
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
  
  module.exports = { deletevalidation };