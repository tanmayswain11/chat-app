//check the authentication

import User from "../models/User.js";
import jwt from "jsonwebtoken"

//middleware to protect route
//middleware to protect route
export const protectRoute = async (req,res,next) => {
  try {
    const token = req.headers.token;  // ✅ FIXED

    if (!token) {
      return res.status(401).json({ success: false, message: "JWT must be provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not Found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    res.status(401).json({ success: false, message: error.message });
  }
};