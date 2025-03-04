const { clipTable, userTable } = require('./mockData')

const express = require('express');
const cors = require('cors');


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request body




app.get('/', (req, res) => {
    res.send('Hello World!');
});

// get only 1 item
app.get('/getDataID/:clip_id', (req, res) => {
    const { clip_id } = req.params;

    // Find the clip with the matching clip_id
    const clip = clipTable.find(item => item.clip_id === clip_id);

    if (!clip) {
        return res.status(404).json({ error: "Clip not found" });
    }

    console.log(clip);  // Log the found clip

    res.json(clip);  // Send the clip as JSON response
});

// get only 1 item

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

app.post('/createUser', (req, res) => {
    const { username, email } = req.body;
    res.json({ message: `User Created: ${username}, Email: ${email}` });
});







////////////////////////////////// Test ///////////////////////////////////////////////

app.get('/getAllClip', (req, res) => {
    const { user_id } = req.query; // Extract query param
    if (!user_id) {
        return res.status(400).json({ error: "Missing user_id" });
    }
    res.json({ message: `Received user_id: ${user_id}` });
});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
