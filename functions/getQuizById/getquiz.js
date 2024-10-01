import { sendResponse, sendError } from "../../utils/sendResponse.js";
const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("../../services/db.js");
import middy from "@middy/core";

const { validateToken } = require("../../services/auth.js");

const handler = middy()
  .handler(async (event) => {
    try {
      if (!event?.id || (event?.error && event?.error === "401"))
        return sendError(401, { success: false, message: "Invalid token" });

      const quizTable = process.env.QUIZ_TABLE;
      const { quizId } = event.pathParameters;
      console.log("quizid", quizId);
      console.log("quizTable", quizTable);
      const queryParams = {
        TableName: quizTable,
        KeyConditionExpression: "quizId = :v1",
        ExpressionAttributeValues: {
          ":v1": quizId,
        },
        ProjectionExpression: "questions",
      };
      console.log("queryParams", queryParams);
      const result = await db.send(new QueryCommand(queryParams));

      console.log("result", result);
      if (!result.Items) {
        return sendResponse({
          success: false,
          message: "Could not find a user with that quiz.",
        });
      }
      return sendResponse({
        success: true,
        message: result.Items,
      });
    } catch (error) {
      return sendError(500, { success: false, message: error });
    }
  })
  .use(validateToken);

module.exports = { handler };
