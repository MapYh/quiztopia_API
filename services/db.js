const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

//Create db and init.
const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
});
const db = DynamoDBDocumentClient.from(client);

module.exports = db;
