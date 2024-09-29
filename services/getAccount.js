const db = require("../services/db.js");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
import { sendError } from "../utils/sendResponse";

async function getAccount(username) {
  const userTable = process.env.USER_TABLE;
  console.log("userTable", userTable);
  try {
    const params = {
      TableName: userTable,
      Key: {
        username,
      },
    };
    console.log("username", username);
    console.log("params", params);
    const result = await db.send(new GetCommand(params, () => {}));
    console.log("result", result);
    console.log("result", result.Item);
    if (!result.Item) return false;
    else return result.Item;
  } catch (error) {
    return sendError({ success: false, message: error });
  }
}

module.exports = { getAccount };
