const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve AI Generated Images directly from the AI artifacts folder
const aiImagePath = path.join('C:', 'Users', 'munna', '.gemini', 'antigravity', 'brain', 'a6fd3b1b-49ae-4e24-8706-75a10002da9b');
app.get('/api/images/:imageName', (req, res) => {
    // For local dev, loosely serve the files requested if they contain the exact prefix 
    // clinic_hero_, doctor_portrait_, or clinic_room_
    const imageName = req.params.imageName;
    const files = fs.readdirSync(aiImagePath);
    const targetFile = files.find(f => f.startsWith(imageName) && f.endsWith('.png'));
    if (targetFile) {
        res.sendFile(path.join(aiImagePath, targetFile));
    } else {
        res.status(404).send('Image not found');
    }
});

// API Endpoint for Booking
app.post('/api/book', (req, res) => {
    const { name, phone, email, service, date, time, message } = req.body;
    
    // In a real application, you handle DB save or email sending here.
    console.log('--- New Booking Request ---');
    console.log(`Name: ${name}`);
    console.log(`Phone: ${phone}`);
    console.log(`Email: ${email}`);
    console.log(`Service: ${service}`);
    console.log(`Date: ${date} Time: ${time}`);
    console.log(`Message: ${message}`);
    console.log('---------------------------');
    
    // Simulate processing delay
    setTimeout(() => {
        res.status(200).json({ 
            success: true, 
            message: 'Your booking request has been securely received. Our team will contact you shortly.' 
        });
    }, 1500);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Dentpark Backend running on port ${PORT}`);
});
