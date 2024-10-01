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

      const question = JSON.parse(event.body);
      const { name, quizId } = JSON.parse(event.body);
      console.log("name", name);
      console.log("question", question);

      const getParams = {
        TableName: quizTable,
        Key: {
          name,
          quizId,
        },
      };

      console.log("getParams", getParams);
      const result = await db.send(new GetCommand(getParams));
      console.log("result", result);
      if (!result.Item) {
        return sendResponse({
          message: "Could not find a quiz with that name",
        });
      } else {
        console.log("result", result.Item);

        console.log("result", result.Item.userid);
        console.log("event.id", event.id);
        if (event.id != result.Item.userid) {
          return sendResponse({ message: "Wrong account for that quiz." });
        }
        const newquestion = {
          TableName: quizTable,
          Item: {
            name: name,
            quizId: question.quizId,
            questions: [question],
            userid: event?.id,
          },
        };
        const getParamstwo = {
          TableName: quizTable,
          Key: {
            quizId: question.quizId,
            name,
          },
        };

        const putResult = await db.send(new PutCommand(newquestion));
        const getResult = await db.send(new GetCommand(getParamstwo));
        console.log("putResult", putResult);
        console.log("getResult", getResult.Item);
        if (putResult) {
          return sendResponse({
            success: true,
            message: getResult.Item,
          });
        } else {
          return sendResponse({
            success: false,
            message: "No new question added.",
          });
        }
      }
    } catch (error) {
      return sendError(500, { success: false, message: error });
    }
  })
  .use(validateToken);

module.exports = { handler };
