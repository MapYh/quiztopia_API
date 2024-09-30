import { sendResponse, sendError } from "../../utils/sendResponse.js";
const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
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

      const { name } = JSON.parse(event.body);
      console.log("name", name);
      console.log("question", question);

      const getParams = {
        TableName: quizTable,
        Key: {
          name,
        },
      };
      console.log("getParams", getParams);
      const result = await db.send(new GetCommand(getParams));
      console.log("result", result);

      if (!result.Item) {
        return sendResponse({
          message: "Could not find a quiz with that name",
        });
      }
    } catch (error) {
      return sendError(500, { success: false, message: error });
    }
  })
  .use(validateToken);

module.exports = { handler };
