import { sendResponse, sendError } from "../../utils/sendResponse.js";
const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("../../services/db.js");
import middy from "@middy/core";
const uuid = require("uuid");



const handler = middy()
  .handler(async (event) => {
    try {
    const quizTable = process.env.QUIZ_TABLE;
    const leaderTable = process.env.LEADER_TABLE;
    const {name, points, quizId, userId} = JSON.parse(event.body);
    const leaderBoardId = uuid.v4(); 

    const GetParams = {
    TableName: quizTable,
    Key: {
        quizId,
        name,
    }
    }
    const result = await db.send(new GetCommand( GetParams ));
    console.log("result", result.Item);

    if(!result.Item){
        return sendError(400, { success: false, message: "Could not find a quiz with that id/name." });
    }

    const putParams = {
        TableName: leaderTable,
        Item: {
            quizId,
            name,
            points,
            userId,
            leaderBoardId
        }
    }
    const putresult = await db.send(new PutCommand( putParams ));
    console.log("putresult", putresult);
    if(putresult){
        return sendResponse({success: true, message: "Leaderboard score registered."});
    }
    } catch (error) {
      return sendError(500, { success: false, message: error.message });
    }
})

module.exports = { handler };
