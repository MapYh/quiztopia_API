import { sendResponse, sendError } from "../../utils/sendResponse.js";
const { PutCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("../../services/db.js");
import middy from "@middy/core";

const { validateToken } = require("../../services/auth");
const {
  postquestionvalidation,
} = require("../../services/requestValidation/postquestion_validation.js");

const handler = middy()
  .handler(async (event) => {
    try {
      //Error handling from middleware.
      if (event.error == "400")
        return sendError(400, {
          success: false,
          message:
            "Somethings wrong with the request body, check that there is six keys, and no spelling errors.",
        });
      //Token checker.
      if (!event?.id || (event?.error && event?.error === "401"))
        return sendError(401, { success: false, message: "Invalid token" });

      const quizTable = process.env.QUIZ_TABLE;

      const question = JSON.parse(event.body);
      const { name, quizId, userid } = JSON.parse(event.body);
      if (userid != event?.id) {
        return sendResponse({ message: "Wrong userid for that quiz." });
      }

      const getParams = {
        TableName: quizTable,
        Key: {
          name,
          quizId,
        },
      };

      const result = await db.send(new GetCommand(getParams));
      if (name != result.Item.name) {
        return sendError(400, {
          success: false,
          message: "Wrong name of quiz.",
        });
      }

      if (event.id != result.Item.userid) {
        return sendResponse({ message: "Wrong account for that quiz." });
      }

      if (!result.Item) {
        return sendResponse({
          message: "Could not find a quiz with that name",
        });
      } else {
        //Check if the question is already in the quiz.
        for (let i = 0; i < result.Item.questions.length; i++) {
          if (result.Item.questions[i].question == question.question) {
            return sendResponse({
              success: false,
              message: "That question is already in the quiz.",
            });
          }
        }

        const newquestion = {
          TableName: quizTable,
          Item: {
            question: question.question,
            answer: question.answer,
            location: question.location,
          },
        };
        const getParamstwo = {
          TableName: quizTable,
          Key: {
            quizId: question.quizId,
            name,
          },
        };

        result.Item.questions.push(newquestion.Item);

        const saveparams = {
          TableName: quizTable,
          Item: {
            quizId,
            name,
            questions: result.Item.questions,
            userid: userid,
          },
        };
        //Put new question into quiz.
        const putResult = await db.send(new PutCommand(saveparams));
        //Get the new questions so that they can be displayed in the respons body.
        const getResult = await db.send(new GetCommand(getParamstwo));
        if (putResult) {
          return sendResponse({
            success: true,
            message: getResult.Item,
          });
        } else {
          return sendError(400, {
            success: false,
            message: "No new question added.",
          });
        }
      }
    } catch (error) {
      return sendError(500, { success: false, message: error.message });
    }
  })
  .use(validateToken)
  .use(postquestionvalidation);

module.exports = { handler };
