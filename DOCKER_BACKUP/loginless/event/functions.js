import pool from "../db/index.js";
import { Points } from "../points_mapping/index.js";

// wget --method=POST -header="Content-Type: application/json" --body-data='{"user_id":"25","event_type":"SPEEDGT"}' http://192.168.178.181:3000/event/add
export async function addEvent(user_id,event_type) {
    try{
        console.log("Creating Event: ".body);
        let points = Points[event_type];
        if (typeof points != "number") {
            points = 0;
        }
        await pool.query(
            "INSERT INTO driving_game.events (user_id, event_type, points_change) VALUES ($1, $2, $3)",
            [user_id, event_type, points]
        );
        calculateTotalPoints(points, user_id);
        console.log(1);
    } catch(err){
        console.log(err);
        console.log(0);    
    }
}

async function calculateTotalPoints(points_change, user_id){
    try{
        await pool.query(
            "UPDATE driving_game.users SET total_points = total_points + $1 WHERE id = $2",
            [points_change, user_id]
        );
        console.log("Total points updated");
    }catch(err){
        console.log(err);
        console.log("Error: Points change failed");
    }
}
