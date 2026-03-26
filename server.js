const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup express-session for Admin Auth
app.use(session({
    secret: 'dentpark_super_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using https
}));

// Route Protection Middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.loggedIn) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized access' });
    }
};

const requireAdminPage = (req, res, next) => {
    if (req.session && req.session.loggedIn) {
        next();
    } else {
        res.redirect('/admin-login.html');
    }
};

// Admin Login/Logout Endpoints
app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    // Hardcoded credentials requirement
    if (username === 'admin' && password === 'admin123') {
        req.session.loggedIn = true;
        res.json({ success: true, message: 'Logged in successfully' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.post('/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out' });
});

// Serve Admin Page specifically to protect it
app.get(['/admin', '/admin.html'], requireAdminPage, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Protect static HTML route manually in case of direct access to /admin.html
app.use((req, res, next) => {
    if (req.path === '/admin.html' && (!req.session || !req.session.loggedIn)) {
        return res.redirect('/admin-login.html');
    }
    next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve AI Generated Images directly from the AI artifacts folder
const aiImagePath = path.join('C:', 'Users', 'munna', '.gemini', 'antigravity', 'brain', 'a6fd3b1b-49ae-4e24-8706-75a10002da9b');
app.get('/api/images/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    try {
        const files = fs.readdirSync(aiImagePath);
        const targetFile = files.find(f => f.startsWith(imageName) && f.endsWith('.png'));
        if (targetFile) {
            res.sendFile(path.join(aiImagePath, targetFile));
        } else {
            res.status(404).send('Image not found');
        }
    } catch(err) {
        res.status(404).send('Directory not found');
    }
});

// Setup appointments database file path
const APPOINTMENTS_FILE = path.join(__dirname, 'appointments.json');

// Helper to initialize/load appointments
const getAppointments = () => {
    try {
        if (!fs.existsSync(APPOINTMENTS_FILE)) {
            fs.writeFileSync(APPOINTMENTS_FILE, '[]');
            return [];
        }
        const data = fs.readFileSync(APPOINTMENTS_FILE, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error('Error reading appointments.json:', err);
        return [];
    }
};

// Helper to save appointments
const saveAppointments = (data) => {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(data, null, 2));
};

// API Endpoint for Booking (Public)
app.post('/api/book', (req, res) => {
    const { name, phone, service, date, time, message } = req.body;
    
    // Basic Validation
    if (!name || !phone || !service || !date || !time) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please complete all required fields.' 
        });
    }

    const newAppointment = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        name,
        phone,
        service,
        date,
        time,
        message: message || '',
        status: 'Pending',
        createdAt: new Date().toISOString()
    };
    
    // Read, append, and save
    const appointments = getAppointments();
    appointments.push(newAppointment);
    saveAppointments(appointments);
    
    console.log(`--- New Booking Approved ---`);
    console.log(`Patient: ${name} (${phone})`);
    console.log(`Time: ${date} ${time}`);
    console.log(`---`);
    
    res.status(200).json({ 
        success: true, 
        message: 'Your booking request has been securely received.' 
    });
});

// API Endpoint to get all bookings (Protected)
app.get('/api/appointments', requireAuth, (req, res) => {
    res.json(getAppointments());
});

// API Endpoint to update a booking status (Protected)
app.patch('/api/appointments/:id/status', requireAuth, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['Pending', 'Confirmed', 'Completed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    let appointments = getAppointments();
    const appointmentIndex = appointments.findIndex(app => app.id === id);
    
    if (appointmentIndex !== -1) {
        appointments[appointmentIndex].status = status;
        saveAppointments(appointments);
        res.status(200).json({ success: true, message: `Status updated to ${status}` });
    } else {
        res.status(404).json({ success: false, message: 'Appointment not found' });
    }
});

// API Endpoint to delete a booking (Protected)
app.delete('/api/appointments/:id', requireAuth, (req, res) => {
    const { id } = req.params;
    let appointments = getAppointments();
    const initialLength = appointments.length;
    
    appointments = appointments.filter(app => app.id !== id);
    
    if (appointments.length < initialLength) {
        saveAppointments(appointments);
        res.status(200).json({ success: true, message: 'Appointment deleted successfully' });
    } else {
        res.status(404).json({ success: false, message: 'Appointment not found' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Dentpark Backend running on port ${PORT}`);
    console.log(`Admin Dashboard available at: http://localhost:${PORT}/admin`);
});
