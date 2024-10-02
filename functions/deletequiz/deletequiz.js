import { sendResponse, sendError } from "../../utils/sendResponse.js";
const { DeleteCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("../../services/db.js");
import middy from "@middy/core";

const { validateToken } = require("../../services/auth");

const handler = middy()
  .handler(async (event) => {
    try {
      if (!event?.id || (event?.error && event?.error === "401"))
        return sendError(401, { success: false, message: "Invalid token" });

      const quizTable = process.env.QUIZ_TABLE;


      const { quizId } = event.pathParameters;
      const { name } = JSON.parse(event.body);
    

      const deleteParams = {
        TableName: quizTable,
        Key: {
          quizId,
          name,
        },
      };
    
      const result = await db.send(new GetCommand(deleteParams));
    

      if (!result.Item) {
        return sendResponse({
          message: "Could not find a quiz with that id.",
        });
      }
     
      if (event.id != result.Item.userid) {
        return sendResponse({ message: "Wrong account for that quiz." });
      }

      const deletResult = await db.send(new DeleteCommand(deleteParams));
  
      if (deletResult) {
        return sendResponse({
          message: `Deleted a quiz with the quizId: ${quizId}`,
        });
      }
    } catch (error) {
      return sendError(500, { success: false, message: error });
    }
  })
  .use(validateToken);

module.exports = { handler };
