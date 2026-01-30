import express from "express"
import protectRoute from "../middleware/protectRoute.js"
import { startBooking } from "../controllers/booking.controller.js"

const router = express.Router()

router.post("/start", protectRoute, startBooking)

export default router