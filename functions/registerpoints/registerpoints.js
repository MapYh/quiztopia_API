import { sendResponse, sendError } from "../../utils/sendResponse.js";
const { GetCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("../../services/db.js");
import middy from "@middy/core";
const uuid = require("uuid");

const {registerpointsvalidation} = require("../../services/requestValidation/registerpointsvalidation.js");

const handler = middy()
  .handler(async (event) => {
    try {

        if (event.error == "400")
            return sendError(400, { success: false, message: "Somethings wrong with the request body, check that the points are positive, and that all the keys exist, there should be four keys." });


    const quizTable = process.env.QUIZ_TABLE;
    const leaderTable = process.env.LEADER_TABLE;
    const {name, points, quizId, userId} = JSON.parse(event.body);
    const leaderBoardId = uuid.v4(); 
    if(points<0){
        return sendError(400, { success: false, message: "Points cant be negative." });
    }
    const GetParams = {
    TableName: quizTable,
    Key: {
        quizId,
        name,
    }
    }
    const result = await db.send(new GetCommand( GetParams ));
    

    if(!result.Item){
        return sendError(400, { success: false, message: "Could not find a quiz with that id/name." });
    }
    const GetleaderBoardParams = {
        TableName: leaderTable,
        Key: {
            quizId,
            name,
        }
        }
        const leaderboardresult = await db.send(new GetCommand( GetleaderBoardParams ));
      
        if(leaderboardresult.Item){
           
            if(points > JSON.parse(leaderboardresult.Item.points)){
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
            
            if(putresult){
                return sendResponse({success: true, message: "New leaderboard score registered."});
            }
            }else{
                return sendResponse({success: true, message: "No new highscore."});
            }  
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

if(putresult){
return sendResponse({success: true, message: "New leaderboard score registered."});
}
       

} catch (error) {
      return sendError(500, { success: false, message: error.message });
}
}).use(registerpointsvalidation);

module.exports = { handler };
