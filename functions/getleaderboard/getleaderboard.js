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
      const leaderTable = process.env.LEADER_TABLE;
      const params = {
        TableName: leaderTable,
      }
      const result = await db.send(new ScanCommand(params));
     console.log("result", result);
      let leaderArray = []
      result.Items.forEach((object)=>{
      
        leaderArray.push({"Quizname": object.name,"Userid": object.userId, "Highscore": object.points})
        
      })
    
      return sendResponse({success: true, message: leaderArray});
    } catch (error) {
      return sendError(500, { success: false, message: error.message });
    }
  }).use(getvalidation);


module.exports = { handler };