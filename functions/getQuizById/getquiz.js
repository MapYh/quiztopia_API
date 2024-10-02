import { sendResponse, sendError } from "../../utils/sendResponse.js";
const { QueryCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("../../services/db.js");
import middy from "@middy/core";


const {getvalidation} = require("../../services/requestValidation/getvalidation.js");

const handler = middy()
  .handler(async (event) => {
    try {
      if (event.error == "400")
      return sendError(400, { success: false, message: "Invalid event body, it should be empty." });

      const quizTable = process.env.QUIZ_TABLE;
      const { quizId } = event.pathParameters;
    
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
      return sendError(500, { success: false, message: error.message });
    }
  })
  .use(getvalidation);

module.exports = { handler };
