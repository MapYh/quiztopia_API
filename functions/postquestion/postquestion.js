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
    

      const question = JSON.parse(event.body);
      const { name, quizId, userid } = JSON.parse(event.body);
    if(userid != event?.id){
      return sendResponse({ message: "Wrong userid for that quiz." });
    }
   
      const getParams = {
        TableName: quizTable,
        Key: {
          name,
          quizId,
        },
      };

      console.log("getParams", getParams);
      const result = await db.send(new GetCommand(getParams
      ));
      
  
      if (event.id != result.Item.userid) {
        return sendResponse({ message: "Wrong account for that quiz." });
      }
      console.log("result", result.Item);
      if (!result.Item) {
        return sendResponse({
          message: "Could not find a quiz with that name",
        });
      } else {
        for(let i = 0;  i< result.Item.questions.length; i++){
          if(result.Item.questions[i].question == question.question){
            return sendResponse({success: false, message: "That question is already in the quiz."});
          }
        }
        console.log("event?.id", event?.id);
       console.log("result.Item.userid", result.Item.userid);
        
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

        console.log("result.Item.questions first", result.Item.questions);
        result.Item.questions.push(newquestion.Item);
        console.log("result.Item.questions", result.Item.questions);
        console.log("result.Item.userId", result.Item.userId);
        const saveparams = {
          TableName: quizTable,
          Item: {
            quizId,
            name,
            questions: result.Item.questions,
            userid: userid
          },
        }; 
        const getResult = await db.send(new GetCommand(getParamstwo));

        const putResult = await db.send(new PutCommand(saveparams));
        /* const getResult = await db.send(new GetCommand(getParamstwo)); */
         console.log("putResult", putResult);
        console.log("getResult", getResult.Item);
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
  .use(validateToken);

module.exports = { handler };
