import { sendResponse, sendError } from "../../utils/sendResponse.js";
const { DeleteCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("../../services/db.js");
import middy from "@middy/core";

const { validateToken } = require("../../services/auth");
const {
  delete_post_validation,
} = require("../../services/requestValidation/delete_post_validation.js");

const handler = middy()
  .handler(async (event) => {
    try {
      if (!event.body) {
        return sendError(400, {
          success: false,
          message: "The request body cant be empty.",
        });
      }
      //Error handling from middleware.
      if (event.error == "400")
        return sendError(400, {
          success: false,
          message:
            "Request body should only contain the name of the quiz you wish to delete.",
        });
      //Token check.
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
      //Check if the quiz exists in the db.
      const result = await db.send(new GetCommand(deleteParams));

      if (!result.Item) {
        return sendResponse({
          message: "Could not find a quiz with that id/name.",
        });
      }

      if (event.id != result.Item.userid) {
        return sendResponse({ message: "Wrong account for that quiz." });
      }
      //Delete the quiz.
      const deletResult = await db.send(new DeleteCommand(deleteParams));

      if (deletResult) {
        return sendResponse({
          message: `Deleted a quiz with the quizId: ${quizId}`,
        });
      }
    } catch (error) {
      return sendError(500, { success: false, message: error.message });
    }
  })
  .use(validateToken)
  .use(delete_post_validation);

module.exports = { handler };
