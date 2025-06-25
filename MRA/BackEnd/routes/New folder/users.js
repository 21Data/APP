// myrentabuja-backend/routes/users.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth'); // Assuming you have this middleware
const { query } = require('../config/db'); // Assuming your database query function


// GET /api/users/me - Get Authenticated User's Own Profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        // req.user is populated by the authenticateToken middleware
        const userId = req.user.id;

        const userResult = await query(
            `SELECT id, role, name, date_of_birth, email, phone, address, nin, marital_status, passport_photo_url
             FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        const user = userResult.rows[0]; // Get the first row directly

        // Construct the response object explicitly to ensure consistent keys and handle nulls
        const userProfile = {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            phone: user.phone || null, // Ensure phone is null if not present
            address: user.address || null, // Ensure address is null if not present
            maritalStatus: user.marital_status || null, // Ensure maritalStatus is null if not present
            dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : null,
            nationalIdNumber: user.nin || null, // Assuming 'nin' is National Identification Number, ensure null if not present
            passportPhotoUrl: user.passport_photo_url || null, // Ensure passportPhotoUrl is null if not present
        };

        // If the user is a landlord, fetch their property count
        if (userProfile.role === 'landlord') {
            const propertiesCountQuery = `
                SELECT COUNT(id) AS properties_listed
                FROM properties
                WHERE owner_id = $1;
            `;
            const propertiesCountResult = await query(propertiesCountQuery, [userProfile.id]);
            userProfile.properties_listed = parseInt(propertiesCountResult.rows[0].properties_listed, 10);
        }

        console.log('Backend (GET /api/users/me): Sending user profile:', userProfile); // Debug log

        res.status(200).json(userProfile);

    } catch (error) {
        console.error('Backend (GET /api/users/me): Error fetching user profile:', error); // Specific error log
        res.status(500).json({ error: 'Failed to retrieve user profile.' });
    }
});


// NEW ENDPOINT: GET /api/users/:id - Get basic user profile by any User ID and (if landlord) property count
router.get('/:id', authenticateToken, async (req, res) => { // This route handles requests like /api/users/some-id
    const { id } = req.params; // The ID of the user whose profile is being requested

    try {
        // Fetch basic user details including address
        const userQuery = `
            SELECT id, name, email, role, phone, marital_status, date_of_birth, address
            FROM users
            WHERE id = $1;
        `;
        const userResult = await query(userQuery, [id]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const user = userResult.rows[0];
        const profileData = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            maritalStatus: user.marital_status,
            dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : null,
            address: user.address, // Include address here
        };

        // If the user is a landlord, fetch their property count
        if (user.role === 'landlord') {
            const propertiesCountQuery = `
                SELECT COUNT(id) AS properties_listed
                FROM properties
                WHERE owner_id = $1;
            `;
            const propertiesCountResult = await query(propertiesCountQuery, [id]);
            profileData.properties_listed = parseInt(propertiesCountResult.rows[0].properties_listed, 10);
        }

        res.status(200).json(profileData);

    } catch (error) {
        console.error(`Get user profile error for user ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to retrieve user profile.' });
    }
});
    

module.exports = router;
