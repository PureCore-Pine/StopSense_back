const bcrypt = require('bcrypt'); // Ensure this is at the top
const express = require('express');
const cors = require('cors');

const { clipTable, userTable } = require('./mockData');

const mongoose = require('mongoose');
const User = require('./models/User.js');
const Clip = require('./models/Clip.js')


const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Middleware to parse JSON request body

// local
const mongoURI = "mongodb://localhost:27017/StopSense"; // or MongoDB Atlas URI
// cloud
// const mongoURI = "mongodb+srv://admin:admin@cluste1.9ae6v.mongodb.net/?retryWrites=true&w=majority&appName=Cluste1"; // or MongoDB Atlas URI

// Connect to MongoDB
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));


// Create create a new user
app.post('/crateUsers', async (req, res) => {
    try {
        const newUser = new User(req.body); // 🛠 Use `User` (capitalized)
        const savedUser = await newUser.save();
        res.json(savedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// get user
app.get('/users', async (req, res) => {
    try {
        const allUsers = await User.find(); // Retrieves all users from the database

        res.json(allUsers);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/*
main API
*/

app.get('/', (req, res) => {
    res.send('hello')
})

app.get('/test', async (req, res) => {
    const mailQuery = { email: "test01@mail.com" }
    const checkUser = await User.findOne(mailQuery)
    console.log(checkUser.email)

    return res.json(checkUser)
})

// orgin register
// app.post('/register', (req, res) => {
//     const { email, username, password, confirmPassword } = req.body;

//     console.log(req.body);

//     if (password != confirmPassword || password === '') {
//         return res.status(401).json({ success: false, message: 'Passwords do not match' });
//     }

//     if (!username || !email) {
//         return res.status(401).json({ success: false, message: 'Invalid email or username' });
//     }

//     if (userTable.some(item => item.email === email)) {
//         return res.status(401).json({ success: false, message: 'This email is already used' });
//     }

//     if (userTable.some(item => item.username === username)) {
//         return res.status(401).json({ success: false, message: 'Username is already used' });
//     }

//     const d = new Date();
//     let year = d.getFullYear();
//     let month = (d.getMonth() + 1).toString().padStart(2, '0'); // Corrected month formatting
//     let day = d.getDate().toString().padStart(2, '0');

//     const date = `${year}-${month}-${day}`;

//     let data = {
//         user_id: "U" + d.getTime(),
//         email,
//         username,
//         password, // Consider hashing the password before storing
//         user_type: "user",
//         create_date: date,
//         modify_date: date
//     };

//     userTable.push(data);
//     console.log('New user added:', data);
//     return res.status(200).json({ success: true, message: 'Account created successfully' });
// });
app.post('/register', async (req, res) => {
    const { email, username, password, confirmPassword } = req.body;

    console.log(req.body);

    if (password != confirmPassword || password === '') {
        return res.status(401).json({ success: false, message: 'Passwords do not match' });
    }

    if (!username || !email) {
        return res.status(401).json({ success: false, message: 'Invalid email or username' });
    }

    const checkMail = await User.findOne({ email: email })
    console.log('checkmail: ', checkMail)
    if (checkMail !== null && checkMail?.email === email) {
        return res.status(401).json({ success: false, message: 'This email is already used' });
    }

    if (userTable.some(item => item.username === username)) {
        return res.status(401).json({ success: false, message: 'Username is already used' });
    }
    const checkUsername = await User.findOne({ username })
    console.log('check username: ', checkUsername)
    if (checkUsername?.username === username || checkUsername !== null) {
        return res.status(401).json({ success: false, message: 'Username is already used' });
    }

    console.log('pass: ', checkMail)

    const d = new Date();
    let year = d.getFullYear();
    let month = (d.getMonth() + 1).toString().padStart(2, '0'); // Corrected month formatting
    let day = d.getDate().toString().padStart(2, '0');

    const date = `${year}-${month}-${day}`;
    const hashedPassword = await bcrypt.hash(password, 10); // 10 rounds of salt

    let data = {
        user_id: "U" + d.getTime(),
        email,
        username,
        password: hashedPassword, // Consider hashing the password before storing
        user_type: "user",
        create_date: date,
        modify_date: date
    };
    const newUser = new User(data)
    const savedUser = await newUser.save();

    // userTable.push(data);
    console.log('New user added:', savedUser);
    return res.status(200).json({ success: true, message: 'Account created successfully' });
});


// Example POST route to create a new user
// app.post('/users', async (req, res) => {
//     try {
//       const newUser = new User(req.body);
//       const savedUser = await newUser.save();
//       res.json(savedUser);
//     } catch (err) {
//       res.status(500).json({ message: err.message });
//     }
//   });

// Uesr login
// app.post('/login', (req, res) => {
//     const { username, password } = req.body;

//     // username also equal email

//     try {
//         // console.log(username, password)
//         const user = userTable.find(user => user.username === username || user.email === username && user.password === password);

//         if (!user) {
//             return res.status(401).json({ success: false, message: 'Invalid user or password' });
//         }

//         user.status = "active";

//         console.log('new:', userTable)
//         return res.json({ success: true, message: 'Login successful', user_id: user.user_id })
//     } catch {
//         return res.status(401).json({ success: false, message: 'Invalid user or password', user_id: null })
//     }
// })
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // ค้นหาจาก username หรือ email
        const user = await User.findOne({
            $or: [{ username: username }, { email: username }]
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // เช็ครหัสผ่านที่ผู้ใช้กรอก กับที่ hash ไว้
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        // เปลี่ยน status เป็น active
        user.status = 'active';
        user.modify_date = new Date();
        await user.save();

        return res.json({
            success: true,
            message: 'Login successful',
            user_id: user.user_id
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: 'Server error', user_id: null });
    }
});


// app.put('/logout', (req, res) => {
//     const { user_id } = req.body;

//     if (!user_id) {
//         return res.status(400).json({ success: false, message: "Missing user_id" });
//     }

//     try {
//         // Find the user in the userTable
//         const user = userTable.find(user => user.user_id === user_id);

//         if (!user) {
//             return res.status(404).json({ success: false, message: "User not found" });
//         }

//         user.status = "inactive";

//         return res.json({ success: true, message: "Logout successful", user });

//     } catch (error) {
//         console.error("Error during logout:", error);
//         return res.status(500).json({ success: false, message: "Internal server error" });
//     }
// });
app.put('/logout', async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ success: false, message: "Missing user_id" });
    }

    try {
        // อัปเดตสถานะเป็น inactive และอัปเดตวันที่
        const user = await User.findOneAndUpdate(
            { user_id: user_id },
            { status: "inactive", modify_date: new Date() },
            { new: true } // return ค่าที่อัปเดตแล้ว
        );

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.json({ success: true, message: "Logout successful", user });

    } catch (error) {
        console.error("Error during logout:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});



// get only 1 item mockup 
// app.get('/getClipID/:clip_id', (req, res) => {
//     const { clip_id } = req.params;

//     // Find the clip with the matching clip_id
//     const clip = clipTable.find(item => item.clip_id === clip_id);

//     if (!clip) {
//         return res.status(404).json({ error: "Clip not found" });
//     }

//     console.log(clip);  // Log the found clip

//     res.json(clip);  // Send the clip as JSON response
// });
app.get('/getClipID/:clip_id', async (req, res) => {
    const { clip_id } = req.params;

    try {
        const clip = await Clip.findOne({ clip_id });

        if (!clip) {
            return res.status(404).json({ success: false, error: "Clip not found" });
        }

        console.log('Clip found:', clip);
        // แปลง upload_date ให้เป็น YYYY-MM-DD
        const formattedClip = {
            ...clip.toObject(), // แปลง clip จาก mongoose document เป็น JS Object
            upload_date: clip.upload_date.toISOString().split('T')[0] // ตัดเอาแค่วันที่
        };

        // ✅ ต้องมีการส่ง response กลับ
        return res.status(200).json({ success: true, clip: formattedClip });

    } catch (error) {
        console.error('Error retrieving clip:', error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});



// Get All Clips
// app.post('/getAllClips', (req, res) => {
//     const { user_id } = req.body; // Extract user_id from request body

//     if (!user_id) {
//         return res.status(400).json({ error: "Missing user_id in request body" });
//     }

//     const userClips = clipTable.filter(item => item.user_id === user_id);

//     if (userClips.length === 0) {
//         return res.status(404).json({ error: "No clips found for this user" });
//     }

//     return res.status(200).json({ success: true, clips: userClips });
// });
app.post('/getAllClips', async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ success: false, error: "Missing user id" });
    }

    try {
        // ค้นหา clip ทั้งหมดที่เป็นของ user_id นี้
        const userClips = await Clip.find({ user_id: user_id });

        if (userClips.length === 0) {
            return res.status(404).json({ success: false, error: "No clips found" });
        }

        console.log({ userClips })
        // ✅ แปลง upload_date ของทุก clip เป็น YYYY-MM-DD
        const formattedClips = userClips.map(clip => {
            const obj = clip.toObject(); // แปลงเป็น JS object
            obj.upload_date = obj.upload_date.toISOString().split('T')[0]; // Format วันที่
            return obj;
        });

        return res.status(200).json({ success: true, clips: formattedClips });
    } catch (error) {
        console.error('Error getting clips:', error);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
});



// app.post('/uploadClip', (req, res) => {
//     const {
//         user_id,
//         name,
//         width,
//         distance,
//         point,
//         descripton
//     } = req.body;

//     if (!user_id || !name || width === 0 || distance === 0) {
//         return res.status(401).json({ success: false, message: 'Invalid input data' });
//     }

//     if (!Array.isArray(point) || point.length !== 4) {
//         return res.status(401).json({ success: false, message: 'require 4 points' });
//     }

//     const d = new Date()

//     let year = d.getFullYear();
//     let month = d.getMonth() > 9 ? d.getMonth() : '0' + (d.getMonth() + 1)
//     let day = d.getDate() > 9 ? d.getDate() : '0' + d.getDate()

//     const date = `${year}-${month}-${day}`

//     let data = {
//         "clip_id": "C" + d.getTime(),
//         user_id,
//         name,
//         "video_path": "/video/",
//         "upload_date": date,

//         "number_conflict": 20,
//         width,
//         distance,
//         point,
//         descripton
//     }

//     clipTable.push(data)
//     console.log('new data added:', clipTable)

//     return res.status(200).json({ success: true, message: 'Upload Clip Complete' })
// })
app.post('/uploadClip', async (req, res) => {
    const {
        user_id,
        name,
        width,
        distance,
        point,
        descripton
    } = req.body;

    if (!user_id || !name || width === 0 || distance === 0) {
        return res.status(400).json({ success: false, message: 'Invalid input data' });
    }

    if (!Array.isArray(point) || point.length !== 4) {
        return res.status(400).json({ success: false, message: 'Require 4 points' });
    }

    const now = new Date();

    const clipData = {
        clip_id: "C" + now.getTime(),
        user_id,
        name,
        video_path: "/video/", // แนะนำให้จัดการ path จริงในอนาคต
        upload_date: now,
        number_conflict: 0, // สมมุติ
        width,
        distance,
        point,
        descripton
    };

    console.log('data: ', clipData)
    try {
        const newClip = new Clip(clipData);
        const savedClip = await newClip.save();
        console.log('New clip added:', savedClip);

        return res.status(200).json({ success: true, message: 'Upload Clip Complete', clip_id: savedClip.clip_id });
    } catch (error) {
        console.error('Error uploading clip:', error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


// app.delete('/deleteClip', (req, res) => {
//     const { clip_id } = req.body; // Correctly extract clip_id

//     console.log('Received delete request for clip_id:', clip_id);
//     console.log('Old ClipTable:', clipTable);

//     // Validate if clip_id is provided
//     if (!clip_id) {
//         return res.status(400).json({ status: "error", message: 'Missing clip_id in request' });
//     }

//     // Find index of the clip to delete
//     const index = clipTable.findIndex(clip => clip.clip_id === clip_id);

//     if (index !== -1) {
//         clipTable.splice(index, 1); // Remove the clip

//         console.log('Updated ClipTable:', clipTable);
//         return res.status(200).json({ status: "success", message: 'Clip deleted successfully' });
//     }
//     return res.status(404).json({ status: "error", message: 'Clip not found' });
// });
app.delete('/deleteClip', async (req, res) => {
    const { clip_id } = req.body;

    console.log('Received delete request for clip_id:', clip_id);

    if (!clip_id) {
        return res.status(400).json({ status: "error", message: 'Missing clip_id in request' });
    }

    try {
        const deleted = await Clip.findOneAndDelete({ clip_id });

        if (!deleted) {
            return res.status(404).json({ status: "error", message: 'Clip not found' });
        }

        console.log('Deleted clip:', deleted);
        return res.status(200).json({ status: "success", message: 'Clip deleted successfully', deleted });
    } catch (error) {
        console.error('Error deleting clip:', error);
        return res.status(500).json({ status: "error", message: 'Internal server error' });
    }
});


// app.get('/dataOverView/:user_id', (req, res) => {
//     const { user_id } = req.params;

//     const userClips = clipTable.filter(item => item.user_id === user_id);
//     let conflictCount = 0;
//     let activeUser = 0;
//     let clipsCount = 0;

//     userClips.map(item => {
//         conflictCount += item.number_conflict
//     })
//     userTable.map(item => {
//         activeUser += item.status === 'active';
//     })

//     clipsCount = userClips.length

//     return res.status(200).json({
//         status: "success", message: 'get data complete', data: {
//             conflictCount, clipsCount, activeUser
//         }
//     })
// })
app.get('/dataOverView/:user_id', async (req, res) => {
    const { user_id } = req.params;

    try {
        // 1. ดึงคลิปทั้งหมดที่เป็นของ user_id นี้
        const userClips = await Clip.find({ user_id });

        // 2. รวม number_conflict ของ user นี้
        let conflictCount = 0;
        userClips.forEach(clip => {
            conflictCount += clip.number_conflict;
        });

        // 3. นับจำนวน user ที่ active ทั้งระบบ
        const activeUser = await User.countDocuments({ status: 'active' });

        // 4. นับจำนวนคลิปทั้งหมดของ user นี้
        const clipsCount = userClips.length;

        return res.status(200).json({
            status: "success",
            message: 'Get data complete',
            data: {
                conflictCount,
                clipsCount,
                activeUser
            }
        });
    } catch (error) {
        console.error('Error getting data overview:', error);
        return res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
