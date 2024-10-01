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
      console.log("quizTable", quizTable);

      const { quizId } = event.pathParameters;
      const { name } = JSON.parse(event.body);
      console.log("name", quizId);

      const deleteParams = {
        TableName: quizTable,
        Key: {
          quizId,
          name,
        },
      };
      console.log("deleteParams", deleteParams);
      const result = await db.send(new GetCommand(deleteParams));
      console.log("result", result.Item);
      console.log("event?.id", event?.id);

      if (!result.Item) {
        return sendResponse({
          message: "Could not find a quiz with that id.",
        });
      }
      console.log("result.Item", result.Item);
      if (event.id != result.Item.userid) {
        return sendResponse({ message: "Wrong account for that quiz." });
      }

      console.log("deleteParams", deleteParams);
      const deletResult = await db.send(new DeleteCommand(deleteParams));
      console.log("result", result);
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
