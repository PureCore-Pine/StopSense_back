const { clipTable, userTable } = require('./mockData')

const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request body

app.get('/', (req, res) => {
    res.send('hello')
})

// get only 1 item
app.get('/getClipID/:clip_id', (req, res) => {
    const { clip_id } = req.params;

    // Find the clip with the matching clip_id
    const clip = clipTable.find(item => item.clip_id === clip_id);

    if (!clip) {
        return res.status(404).json({ error: "Clip not found" });
    }


    console.log(clip);  // Log the found clip

    res.json(clip);  // Send the clip as JSON response
});

// Get All Clips
app.post('/getAllClips', (req, res) => {
    const { user_id } = req.body; // Extract user_id from request body

    if (!user_id) {
        return res.status(400).json({ error: "Missing user_id in request body" });
    }

    const userClips = clipTable.filter(item => item.user_id === user_id);

    if (userClips.length === 0) {
        return res.status(404).json({ error: "No clips found for this user" });
    }

    return res.status(200).json({ success: true, clips: userClips });
});

// app.post('/createUser', (req, res) => {
//     const { username, email } = req.body;
//     res.json({ message: `User Created: ${username}, Email: ${email}` });
// });

// Uesr login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    try {
        // console.log(username, password)
        const user = userTable.find(user => user.username === username && user.password === password);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid user or password' });
        }

        // Change status to "inactive"
        user.status = "active";
        console.log('new:', userTable)
        return res.json({ success: true, message: 'Login successful', user_id: user.user_id })

    } catch {

        return res.status(401).json({ success: false, message: 'Invalid user or password', user_id: null })
    }
})

app.put('/logout', (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ success: false, message: "Missing user_id" });
    }

    try {
        // Find the user in the userTable
        const user = userTable.find(user => user.user_id === user_id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Change status to "inactive"
        user.status = "inactive";

        return res.json({ success: true, message: "Logout successful", user });
    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.post('/register', (req, res) => {
    const { email, username, password, confirmPassword } = req.body;

    console.log(req.body);

    if (password != confirmPassword || password === '') {
        return res.status(401).json({ success: false, message: 'Passwords do not match' });
    }

    if (!username || !email) {
        return res.status(401).json({ success: false, message: 'Invalid email or username' });
    }

    if (userTable.some(item => item.email === email)) {
        return res.status(401).json({ success: false, message: 'This email is already used' });
    }

    if (userTable.some(item => item.username === username)) {
        return res.status(401).json({ success: false, message: 'Username is already used' });
    }

    const d = new Date();
    let year = d.getFullYear();
    let month = (d.getMonth() + 1).toString().padStart(2, '0'); // Corrected month formatting
    let day = d.getDate().toString().padStart(2, '0');

    const date = `${year}-${month}-${day}`;

    let data = {
        user_id: "U" + d.getTime(),
        email,
        username,
        password, // Consider hashing the password before storing
        user_type: "user",
        create_date: date,
        modify_date: date
    };

    userTable.push(data);

    console.log('New user added:', data);

    return res.status(200).json({ success: true, message: 'Account created successfully' });
});

app.post('/uploadClip', (req, res) => {
    const {
        user_id,
        name,
        width,
        distance,
        point,
        descripton
    } = req.body;

    if (!user_id || !name || width === 0 || distance === 0) {
        return res.status(401).json({ success: false, message: 'Invalid input data' });
    }

    if (!Array.isArray(point) || point.length !== 4) {
        return res.status(401).json({ success: false, message: 'require 4 points' });
    }

    const d = new Date()

    let year = d.getFullYear();
    let month = d.getMonth() > 9 ? d.getMonth() : '0' + (d.getMonth() + 1)
    let day = d.getDate() > 9 ? d.getDate() : '0' + d.getDate()

    const date = `${year}-${month}-${day}`

    let data = {
        "clip_id": "C" + d.getTime(),
        user_id,
        name,
        "video_path": "/video/",
        "upload_date": date,

        "number_conflict": 20,
        width,
        distance,
        point,
        descripton
    }

    clipTable.push(data)
    console.log('new data added:', clipTable)

    return res.status(200).json({ success: true, message: 'Upload Clip Complete' })
})

app.delete('/deleteClip', (req, res) => {
    const { clip_id } = req.body; // Correctly extract clip_id

    console.log('Received delete request for clip_id:', clip_id);
    console.log('Old ClipTable:', clipTable);

    // Validate if clip_id is provided
    if (!clip_id) {
        return res.status(400).json({ status: "error", message: 'Missing clip_id in request' });
    }

    // Find index of the clip to delete
    const index = clipTable.findIndex(clip => clip.clip_id === clip_id);

    if (index !== -1) {
        clipTable.splice(index, 1); // Remove the clip

        console.log('Updated ClipTable:', clipTable);
        return res.status(200).json({ status: "success", message: 'Clip deleted successfully' });
    }

    return res.status(404).json({ status: "error", message: 'Clip not found' });
});



app.get('/dataOverView/:user_id', (req, res) => {
    const { user_id } = req.params;

    const userClips = clipTable.filter(item => item.user_id === user_id);
    let conflictCount = 0;
    let activeUser = 0;
    let clipsCount = 0;

    userClips.map(item => {
        conflictCount += item.number_conflict
    })
    userTable.map(item => {
        activeUser += item.status === 'active';
    })

    clipsCount = userClips.length

    // console.log(conflictCount)
    // console.log(clipsCount)
    // console.log(activeUser)
    return res.status(200).json({
        status: "success", message: 'get data complete', data: {
            conflictCount, clipsCount, activeUser
        }
    })


})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
