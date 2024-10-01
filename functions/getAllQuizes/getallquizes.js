import { sendResponse, sendError } from "../../utils/sendResponse.js";
const { ScanCommand } = require("@aws-sdk/client-dynamodb");
const db = require("../../services/db.js");
import middy from "@middy/core";

const { validateToken } = require("../../services/auth.js");

const handler = middy()
  .handler(async (event) => {
    try {
      

      const quizTable = process.env.QUIZ_TABLE;
      const params = {
        TableName: quizTable,
      }
      const result = await db.send(new ScanCommand(params));
      console.log("result", result.Items);
      let quizArray = []
      result.Items.forEach((object)=>{
        console.log("object", object.name, object.userid);
        quizArray.push({"Quizname": object.name,"Userid": object.userid})
        
      })
      console.log("quizArray",quizArray);
      return sendResponse({success: true, message: quizArray});
    } catch (error) {
      return sendError(500, { success: false, message: error });
    }
  })


module.exports = { handler };