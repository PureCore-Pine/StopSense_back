const { clipTable, userTable } = require('./mockData')

const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request body

app.get('/', (req,res) => {
    res.send("hello would")
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

//get All Item
app.post('/getAllClips', (req, res) => {
    const { user_id } = req.body; // Extract user_id from request body

    if (!user_id) {
        return res.status(400).json({ error: "Missing user_id in request body" });
    }

    const userClips = clipTable.filter(item => item.user_id === user_id);

    if (userClips.length === 0) {
        return res.status(404).json({ error: "No clips found for this user" });
    }

    res.json(userClips);
});

// Uesr login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    try {

        // console.log(username, password)
        const user = userTable.find(user => user.username === username && user.password === password);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
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
    const {
        email,
        username,
        password,
        comfirmPassword
    } = req.body;

    if (password !== comfirmPassword) {
        return res.status(401).json({ success: false, message: 'password do not match' })
    }

    const d = new Date()

    let year = d.getFullYear();
    let month = d.getMonth() > 9 ? d.getMonth() : '0' + (d.getMonth() + 1)
    let day = d.getDate() > 9 ? d.getDate() : '0' + d.getDate()

    const date = `${year}-${month}-${day}`

    let data = {
        "user_id": "U" + d.getTime(),
        email,
        username,
        password,
        "user_type": "user",
        "create_date": date,
        "modify_date": date
    }

    userTable.push(data)

    console.log('new data added:', userTable)

    return res.status(200).json({ success: true, message: 'create account complete' })

})

app.post('/uploadClip', (req, res) => {
    const {
        user_id,
        name,
        width,
        distance,
        point,
        descripton
    } = req.body;

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
    const { clip_id } = req.body;
    console.log('delete at:', clip_id)
    console.log('old: ', clipTable, "\n\n\n\n\s")

    if (clip_id) {
        const index = clipTable.findIndex(clip => clip.clip_id === clip_id)

        if (index !== -1) {
            clipTable.splice(index, 1);

            console.log('new: ', clipTable)
            return res.status(200).json({ status: "success", message: 'Delete Clip Complete' })
        }

        return res.status(404).json({ status: "error", message: 'clip not found' })
    }

    return res.status(400).json({ status: "error", message: 'clip not found' })


})

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

    res.send()
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
