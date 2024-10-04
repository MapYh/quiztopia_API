import { sendResponse, sendError } from "../../utils/sendResponse.js";
const { PutCommand } = require("@aws-sdk/lib-dynamodb");
const db = require("../../services/db.js");
const { getAccount } = require("../../services/getAccount.js");
const { v4: uuidv4 } = require("uuid");
import middy from "@middy/core";
const {
  loginsignupvalidation,
} = require("../../services/requestValidation/login_signupvalidation");

async function createAccount(username, password) {
  const userTable = process.env.USER_TABLE;
  console.log("userTable", userTable);
  const userId = uuidv4();
  console.log("userId", userId);
  try {
    const newUser = {
      userId: userId,
      username,
      password,
    };

    //  saving a new user to the database.
    const result = await db.send(
      new PutCommand({
        TableName: userTable,
        Item: newUser,
      })
    );
    if (result) {
      return true;
    } else return false;
  } catch (error) {
    return sendError(500, { success: false, message: error.message });
  }
}

const handler = middy()
  .handler(async (event) => {
    try {
      //Error handling from middleware.
      if (event.error == "400")
        return sendError(400, {
          success: false,
          message:
            "Invalid request body, it should contain the username and password.",
        });
      const { username, password } = JSON.parse(event.body);
      //Checks if an account exists in the database with the user provided username.
      let foundAccount = await getAccount(username);

      if (foundAccount) {
        return sendError(400, {
          success: false,
          message: "A account with that name already exists.",
        });
      }
      const truIfCreatedAccount = await createAccount(username, password);
      if (truIfCreatedAccount) {
        return sendResponse({
          success: true,
          message: `A account was created with the username: ${username}`,
        });
      }
    } catch (error) {
      return sendError(500, { success: false, message: error.message });
    }
  })
  .use(loginsignupvalidation);
module.exports = { handler };
