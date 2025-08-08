//import bcrypt from 'bcrypt';
import pool from "../db/index.js";

export async function registerUser(name) {
    try{
        console.log("Registering User: ", name);
        //const password_hash = await bcrypt.hash(password,5);
        await pool.query(
            "INSERT INTO driving_game.users (name) VALUES ($1)",
            [name]
        );
        return 1;
    } catch(err){
        return err;
        
    }
}

export async function authenticateUser(name) {
  try {
    console.log("Authenticating User:", name);

    const result = await pool.query(
      "SELECT id FROM driving_game.users WHERE name = $1",
      [name]
    );

    // if (result.rows.length === 0) {
    //   return 0;
    // }

    const user = result.rows[0];

    //const passwordMatch = await bcrypt.compare(password, user.password);

    // if (!passwordMatch) {
    //   return 0;
    // }

    return user;

  } catch (err) {
    console.error("Login error:", err);
    return 0;
  }
}

export async function getUserEvents(user_id){
    try{
        const events = await pool.query(
            "SELECT * FROM driving_game.events WHERE user_id = $1",[user_id]);
        return events.rows;
    }catch(err){
        return err;
    }
}

export async function getGlobalLeaderboard(limit){
    try{
        const leaderboard = await pool.query(
          "SELECT name, total_points FROM driving_game.users ORDER BY total_points DESC LIMIT $1",[limit]);
        return leaderboard.rows;
    }catch(err){
        return err;   
    }
}

export async function setUserLocation(location,user_id) {
  try{
      const ret = await pool.query(
          "UPDATE driving_game.users SET location = $1 WHERE id = $2",[location,user_id]);
      console.log(ret);
  }catch(err){
    return err;   
  } 
}

export async function getAllLocal(user_id,range) {
  try{
       const result = await pool.query(
            `
            SELECT name, total_points, location
            FROM driving_game.users
            WHERE location[1] BETWEEN
                      (SELECT location[1] - $2 FROM driving_game.users WHERE id = $1)
                  AND (SELECT location[1] + $2 FROM driving_game.users WHERE id = $1)
              AND location[2] BETWEEN
                      (SELECT location[2] - $2 FROM driving_game.users WHERE id = $1)
                  AND (SELECT location[2] + $2 FROM driving_game.users WHERE id = $1)
            `,
            [user_id,range]
        );
      return result.rows;
  }catch(err){
    return err;   
  } 
}

export async function calculateWeeklyTotalPoints(user_id){
    try{
        const weeklyPoints = await pool.query(
            `SELECT SUM(points_change) AS total_points
            FROM driving_game.events WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '7 days'`,
            [user_id]
        );

        const totalPoints = weeklyPoints.rows[0].total_points || 0;
        console.log(totalPoints);
        return totalPoints;
    }catch(err){
        console.error("Error in fetching weekly data:", err);
        return err;
    }
}

export async function weeklyReport(user_id){
    try{
        const weeklyReport = await pool.query(
            `SELECT event_type, points_change, timestamp FROM driving_game.events WHERE user_id = $1 AND timestamp >= NOW() - INTERVAL '7 days'`,
            [user_id]
        );

        return weeklyReport.rows;
    }catch(err){
        console.error("Error in fetching weekly data:", err);
        return err;
    }
}

export async function getUserPosition(user_id){
    try{
        const result = await pool.query(
            `
            SELECT name, total_points, position FROM (
                SELECT id, name, total_points,
                       RANK() OVER (ORDER BY total_points DESC) AS position
                FROM driving_game.users
            ) ranked_users
            WHERE id = $1
            `,
            [user_id]
        );
        return result.rows;
    }catch(err){
        return err;
    }
}

export async function getLocalLeaderboard(user_id,range, limit) {
  try{
       const result = await pool.query(
            `
            SELECT name, total_points
            FROM driving_game.users
            WHERE location[1] BETWEEN
                      (SELECT location[1] - $2 FROM driving_game.users WHERE id = $1)
                  AND (SELECT location[1] + $2 FROM driving_game.users WHERE id = $1)
              AND location[2] BETWEEN
                      (SELECT location[2] - $2 FROM driving_game.users WHERE id = $1)
                  AND (SELECT location[2] + $2 FROM driving_game.users WHERE id = $1)
              AND id != $1 ORDER BY total_points DESC LIMIT $3
            `,
            [user_id, range, limit]
        );
      return result.rows;
  }catch(err){
    return err;   
  } 
}
