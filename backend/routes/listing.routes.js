import express from "express"
import { createListing } from "../controllers/listing.controller.js"
import protectRoute from "../middleware/protectRoute.js"

const router = express.Router()

router.post("/create", protectRoute, createListing)

export default router