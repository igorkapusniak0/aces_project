const API_BASE = "http://185.94.45.58:3000";

// Save user_id in sessionStorage
function saveUserId(id) {
  sessionStorage.setItem("user_id", id);
}

function getUserId() {
  return sessionStorage.getItem("user_id");
}

// Register  
async function register(username) {
  try {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: "POST",  
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

  } catch (error) {
    console.error("Register error:", error);
    alert("Register  failed due to network or server error.");
  }
}


// Login
async function login(username) {
  try {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log(data);
    console.log(data.data.id);
    if (data.data.id) {
      saveUserId(data.data.id);
      window.location.href = "leaderboard.html";
    } else {
      alert("Login failed! Please check your username.");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed due to network or server error.");
  }
}

async function registerAndLogin(username) {
  try {
    await register(username);
    // Registration successful, now log in
    await login(username);
  } catch (error) {
    console.warn("Register failed (possibly user exists), trying login:", error);
    // Try to log in anyway
    try {
      await login(username);
    } catch (loginError) {
      console.error("Login failed:", loginError);
      alert("Could not register or login. Please try again.");
    }
  }
}

async function getUserEvents(){
  try{
    const userId  = getUserId();
    const response = fetch(`${API_BASE}/users/getUserEvents?user_id={userId}`);
    
     if(!response.ok){
       throw new Error("Network error most likely");
     }
     const data = await response.data.json();
     return data
    
  }catch(error){
    return 0
  }
}

// Logout
function logout() {
  sessionStorage.removeItem("user_id");
  window.location.href = "index.html";
}

async function loadLeaderboard() {
  try {
    const response = await fetch(`${API_BASE}/users/getGlobalLeaderboard?limit=15`);
    if (!response.ok) throw new Error("Failed to fetch leaderboard");

    const data = await response.json();
    const table = document.getElementById("leaderboard");

    table.innerHTML = ""; // Clear existing rows

    data.data.forEach((user, i) => {
      const row = `<tr><td>${i + 1}</td><td>${user.name}</td><td>${user.total_points}</td></tr>`;
      table.innerHTML += row;
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    alert("Failed to load leaderboard.");
  }
}

async function addCurrentUserRank() {
  try {
    const user_id = getUserId();
    if (!user_id) return;

    const response = await fetch(`${API_BASE}/users/position?user_id=${user_id}`);
    if (!response.ok) throw new Error("Failed to fetch user position");

    const data = await response.json();
    const user = data.data[0];
    console.log("Current user rank data:", user);

    const table = document.getElementById("leaderboard");
    if (!table) {
      console.error("Leaderboard table not found in DOM.");
      return;
    }

   
    const leaderboardRows = table.querySelectorAll("tr");
    const isUserInTop10 = Array.from(leaderboardRows).some(row =>
      row.children[1]?.textContent === user.name
    );

    if (!isUserInTop10) {
      const row = document.createElement("tr");
      console.log(user.name);
      row.innerHTML = `<td>${user.position}</td><td>${user.name}</td><td>${user.total_points}</td>`;
      row.style.backgroundColor = "#ffffcc";
      table.appendChild(row);
    }

  } catch (error) {
    console.error("Failed to add current user rank:", error);
  }
}


// Get Global leaderboard
// Logout Confirmation
document.addEventListener('DOMContentLoaded', () => {
  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener('click', () => {
      logout();
    });
  }
});

// TODO: Add Favicon
