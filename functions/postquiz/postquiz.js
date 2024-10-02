import { sendResponse, sendError } from "../../utils/sendResponse.js";
const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("../../services/db.js");
import middy from "@middy/core";
const uuid = require("uuid");
const { validateToken } = require("../../services/auth");

const handler = middy()
  .handler(async (event) => {
    try {
      if (!event?.id || (event?.error && event?.error === "401"))
        return sendError(401, { success: false, message: "Invalid token" });

      const quizTable = process.env.QUIZ_TABLE;
   

      const { name } = JSON.parse(event.body);
      const id = uuid.v4();
      console.log("name", name);
      const newQuiz = {
        TableName: quizTable,
        Item: { name: name, quizId: id, questions: [], userid: event?.id },
      };

      const getParams = {
        TableName: quizTable,
        Key: {
          quizId: id,
          name: name,
        },
      };
     
      const result = await db.send(new GetCommand(getParams));
      
      if (!result.Item) {
        const putResult = await db.send(new PutCommand(newQuiz));
      
        if (putResult) {
          return sendResponse({
            success: true,
            message: `A new quiz added. With id: ${id}`,
          });
        } else {
          return sendResponse({
            success: false,
            message: "No new quiz added.",
          });
        }
      }

      if (event.id != result.Item.userid) {
        return sendResponse({ message: "Wrong account for that quiz." });
      }
      return sendError(400, {
        success: false,
        message: "A quiz with that name already exists.",
      });
    } catch (error) {
      return sendError(500, { success: false, message: error.message });
    }
  })
  .use(validateToken);

module.exports = { handler };
