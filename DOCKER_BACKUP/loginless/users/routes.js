import express, { response } from 'express';
import {registerUser,getUserEvents,getGlobalLeaderboard,setUserLocation,getAllLocal,calculateWeeklyTotalPoints,weeklyReport,getUserPosition,getLocalLeaderboard} from './functions.js';
import asyncHandler from 'express-async-handler';
const router = express.Router();

// wget --method=POST --header="Content-Type: application/json" --body-data='{"name":"John", "email":"john@example.com", "password":"secure123"}' http://192.168.178.181:3000/users/register
router.post('/register', asyncHandler(async (req, res) => {
    try {
        console.log("Incoming request:", req.query, req.body);
        await registerUser(req.body.name);

    } catch (error) {
        console.error("Error in user registration:", error);
        res.status(500).json({ success: false, msg: 'Internal server error.' });
    }
}));

// wget --method=POST --header="Content-Type: application/json" --body-data='{"email":"john@example.com", "password":"secure1231"}' http://192.168.178.181:3000/users/login
// router.post('/login', asyncHandler(async (req, res) => {
//     try {
//         console.log("Incoming request:", req.query, req.body);
//         const user_id = await authenticateUser(req.body.email, req.body.password);
//         res.status(200).json({ success: true, data: user_id });
//     } catch (error) {
//         console.error("Error in user login:", error);
//         res.status(500).json({ success: false, msg: 'Internal server error' });
//     }
// }));

//wget -qO - "http://192.168.178.181:3000/users/getGlobalLeaderboard?limit=10" | jq
router.get('/getGlobalLeaderboard', asyncHandler(async (req, res) => {
    try {
        console.log("Incoming request:", req.query, req.body);
        const limit = parseInt(req.query.limit) || 10;
        const leaderboard = await getGlobalLeaderboard(limit);
        res.status(200).json({ success: true, data: leaderboard });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
}));

// wget -qO - "http://192.168.178.181:3000/users/getUserEvents?user_id=20" | jq
router.get('/getUserEvents', asyncHandler(async (req, res) => {
    try {
        console.log("Incoming request:", req.query, req.body);
        const user_id = parseInt(req.query.user_id) || 1;

        const userEvents = await getUserEvents(user_id);
        res.status(200).json({ success: true, data: userEvents });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ success: false, msg: 'Internal server error.' });
    }
}));

// wget --method=PUT --header="Content-Type: application/json" --body-data='{"user_id":"20","location":"{12,32}"}' http://192.168.178.181:3000/users/setUserLocation
router.put('/setUserLocation', asyncHandler(async (req, res) => {
    try {
        console.log("Incoming request:", req.query, req.body);
        await setUserLocation(req.body.location, req.body.user_id);
        res.status(200).json({ success: true, message: "Updated User Location" });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ success: false, msg: 'Internal server error.' });
    }
}));

// wget -qO - "http://192.168.178.181:3000/users/weekPoints?user_id=20" | jq
router.get('/weekPoints', asyncHandler(async (req, res) => {
    try{
        console.log("Incoming request:", req.query, req.body);
        const totalPoints = await calculateWeeklyTotalPoints(req.query.user_id) || 0;
        console.log(totalPoints);
        res.status(200).json({ success: true, data:totalPoints });
    } catch (error) {
        console.error("Error in calculation:", error);
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
}));

// wget -qO - "http://192.168.178.181:3000/users/weekReport?user_id=20" | jq
router.get('/weekReport', asyncHandler(async (req, res) => {
    try{
        console.log("Incoming request:", req.query, req.body);
        const totalPoints = await weeklyReport(req.query.user_id);
        res.status(200).json({ success: true, data:totalPoints });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
}));

// wget -qO - "http://192.168.178.181:3000/users/position?user_id=20" | jq
router.get('/position', asyncHandler(async (req, res) => {
    try{
        console.log("Incoming request:", req.query, req.body);
        const userPositions = await getUserPosition(req.query.user_id) || 0;
        res.status(200).json({ success: true, data:userPositions });
    } catch (error) {
        console.error("Error in calculation:", error);
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
}));

// wget -qO - "http://192.168.178.181:3000/users/getAllLocal?user_id=20&range=100" | jq
router.get('/getAllLocal', asyncHandler(async (req, res) => {
    try{
        const userId = parseInt(req.query.user_id, 10);
        const range = parseFloat(req.query.range);
        console.log("Incoming request:", req.query, req.body);
        const locations = await getAllLocal(userId, range) || 0;
        res.status(200).json({ success: true, data:locations });
        console.log(locations);
    } catch (error) {
        console.error("Error in locations:", error);
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
}));

// wget -qO - "http://192.168.178.181:3000/users/getLocalLeaderboard?user_id=20&range=100&limit=5" | jq
router.get('/getLocalLeaderboard', asyncHandler(async (req, res) => {
    try{
        const userId = parseInt(req.query.user_id, 10);
        const limit = parseInt(req.query.limit, 10);
        const range = parseFloat(req.query.range);
        console.log("Incoming request:", req.query, req.body);
        const positions = await getLocalLeaderboard(userId, range, limit) || 0;
        res.status(200).json({ success: true, data:positions });
        console.log(positions);
    } catch (error) {
        console.error("Error in positions:", error);
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
}));

export default router;
