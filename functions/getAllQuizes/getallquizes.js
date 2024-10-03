import { sendResponse, sendError } from "../../utils/sendResponse.js";
const { ScanCommand } = require("@aws-sdk/client-dynamodb");
const db = require("../../services/db.js");
import middy from "@middy/core";


const {getvalidation} = require("../../services/requestValidation/getvalidation.js");

const handler = middy()
  .handler(async (event) => {
    try {
      
      if (event.error == "400")
      return sendError(400, { success: false, message: "Invalid event body, it should be empty." });


      const quizTable = process.env.QUIZ_TABLE;
      const params = {
        TableName: quizTable,
      }
      const result = await db.send(new ScanCommand(params));
      let quizArray = []
      result.Items.forEach((object)=>{
      
        quizArray.push({"Quizname": object.name,"Userid": object.userid})
        
      })
    
      return sendResponse({success: true, message: quizArray});
    } catch (error) {
      return sendError(500, { success: false, message: error.message });
    }
  }).use(getvalidation);


module.exports = { handler };