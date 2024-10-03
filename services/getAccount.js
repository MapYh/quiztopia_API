const db = require("../services/db.js");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");
import { sendError } from "../utils/sendResponse";

async function getAccount(username) {
  const userTable = process.env.USER_TABLE;

  try {
    const params = {
      TableName: userTable,
      Key: {
        username,
      },
    };
    const result = await db.send(new GetCommand(params, () => {}));

    if (!result.Item) return false;
    else return result.Item;
  } catch (error) {
    return sendError({ success: false, message: error.message });
  }
}

module.exports = { getAccount };
