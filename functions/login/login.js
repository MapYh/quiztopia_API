import { sendResponse, sendError } from "../../utils/sendResponse";
const { getAccount } = require("../../services/getAccount");
const jwt = require("jsonwebtoken");

exports.handler = async (event) => {
  const { username, password } = JSON.parse(event.body);

  try {
    if (!username)
      return sendError(400, { success: false, message: "Invalid username" });

    const account = await getAccount(username);

    if (!account)
      return sendError(401, { success: false, message: "No account found" });

    if (account.password == password) {
      const token = jwt.sign({ id: account.userId }, process.env.TOKEN_SECRET, {
        expiresIn: 30000,
      });

      console.log("TOKEN", token);

      return sendResponse({
        success: true,
        token: token,
        account: account,
      });
    } else {
      return sendError(400, {
        success: false,
        message: "Wrong password.",
      });
    }
  } catch (error) {
    return sendError(500, {
      success: false,
      message: "Could not get account", error: error.message,
    });
  }
};
