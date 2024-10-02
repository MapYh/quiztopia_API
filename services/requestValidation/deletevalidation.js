



const deletevalidation = {
    before: async (request) => {
      try {
        
        
        const requiredFields = ["name"];
       console.log("test",request.event.body);
        const isValid = requiredFields.every((field) => 
        Object.keys(JSON.parse(request.event.body)).includes(field));
        console.log("isvalid",isValid);
        console.log("Object.keys(request.event.body)",Object.keys(JSON.parse(request.event.body)));
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
  
  module.exports = { deletevalidation };