const db = require("./db");
const { GetCommand } = require("@aws-sdk/lib-dynamodb");

async function getAccount(username, userId) {
  const userTable = process.env.USERS_TABLE;
  console.log("userTable", userTable);
  try {
    const params = {
      TableName: userTable,
      Key: {
        userId,
      },
    };

    const result = await db.send(new GetCommand(params));
    console.log("result", result);
    if (!result.Item) return false;
    else return result.Item;
  } catch (error) {
    return console.log("error", error);
  }
}

module.exports = { getAccount };
