import express, { response } from 'express';
import {addEvent} from './functions.js';
import asyncHandler from 'express-async-handler';
const router = express.Router();

// wget --method=POST -header="Content-Type: application/json" --body-data='{"user_id":"25","event_type":"SPEEDGT"}' http://192.168.178.181:3000/event/add
router.post('/add', asyncHandler(async (req, res) => {
    try {
        console.log("Incoming request:", req.query, req.body);
        await addEvent(req.body.user_id, req.body.event_type, req.body.points_change);
        res.status(201).json({success: "Event Added"})
    } catch (error) {
        console.error("Error in adding event:", error);
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
}));




export default router;
