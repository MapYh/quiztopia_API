



const delete_post_validation = {
    before: async (request) => {
      try {
        
        if(Object.keys(JSON.parse(request.event.body)).length != 1){
          throw new Error();
        }
        const requiredFields = ["name"];
     
        const isValid = requiredFields.every((field) => 
        Object.keys(JSON.parse(request.event.body)).includes(field));
       
        request.event.isValid = isValid;
        if(request.event.isValid == false){
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
  
  module.exports = { delete_post_validation };