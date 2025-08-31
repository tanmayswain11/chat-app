import express from "express"
import { checkAuth, login, signup, updateProfile } from "../controller/userController.js";
import { protectRoute } from "../middleware/auth.js";

const useRouter = express.Router();

useRouter.post("/signup",signup);
useRouter.post("/login",login);
useRouter.put("/update-profile",protectRoute,updateProfile);
useRouter.get("/check",protectRoute,checkAuth)

export default useRouter;