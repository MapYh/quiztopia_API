import { sendResponse, sendError } from "../../utils/sendResponse.js";
const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { ScanCommand } = require("@aws-sdk/client-dynamodb");
const db = require("../../services/db.js");
import middy from "@middy/core";
const uuid = require("uuid");

const {
  registerpointsvalidation,
} = require("../../services/requestValidation/registerpointsvalidation.js");

const handler = middy()
  .handler(async (event) => {
    try {
      if (event.error == "400")
        return sendError(400, {
          success: false,
          message:
            "Somethings wrong with the request body, check that the points are positive, and that all the keys exist, there should be four keys.",
        });

      const quizTable = process.env.QUIZ_TABLE;
      const userTable = process.env.USER_TABLE;
      const leaderTable = process.env.LEADER_TABLE;
      const { name, points, quizId, userid } = JSON.parse(event.body);
      const leaderBoardId = uuid.v4();
      if (points < 0) {
        return sendError(400, {
          success: false,
          message: "Points cant be negative.",
        });
      }

      const scanParams = {
        TableName: userTable,
      };
      //Checking if the user exists in the userdb.
      const scanResult = await db.send(new ScanCommand(scanParams));

      const isValid = [];
      scanResult.Items.forEach((object) => {
        console.log(object.userId.S);
        if (object.userId.S == userid) {
          return isValid.push(true);
        }
      });

      if (!isValid.length != 0) {
        return sendError(400, {
          success: false,
          message: "Could not find a user with that userid.",
        });
      }

      //Check if the quiz exists.
      const GetParams = {
        TableName: quizTable,
        Key: {
          quizId,
          name,
        },
      };
      const result = await db.send(new GetCommand(GetParams));

      if (!result.Item) {
        return sendError(400, {
          success: false,
          message: "Could not find a quiz with that id/name.",
        });
      }

      //Get the leaderboard
      const GetleaderBoardParams = {
        TableName: leaderTable,
        Key: {
          quizId,
          name,
        },
      };
      const leaderboardresult = await db.send(
        new GetCommand(GetleaderBoardParams)
      );

      if (leaderboardresult.Item) {
        //update highscore if new score is higher than the old score.
        if (points > JSON.parse(leaderboardresult.Item.points)) {
          const putParams = {
            TableName: leaderTable,
            Item: {
              quizId,
              name,
              points,
              userid,
              leaderBoardId,
            },
          };
          const putresult = await db.send(new PutCommand(putParams));

          if (putresult) {
            return sendResponse({
              success: true,
              message: "New leaderboard score registered.",
            });
          }
        } else {
          return sendResponse({ success: true, message: "No new highscore." });
        }
      }
      const putParams = {
        TableName: leaderTable,
        Item: {
          quizId,
          name,
          points,
          userid,
          leaderBoardId,
        },
      };
      const putresult = await db.send(new PutCommand(putParams));

      if (putresult) {
        return sendResponse({
          success: true,
          message: "New leaderboard score registered.",
        });
      }
    } catch (error) {
      return sendError(500, { success: false, message: error.message });
    }
  })
  .use(registerpointsvalidation);

module.exports = { handler };
