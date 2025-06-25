const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { query } = require('../config/db'); // Ensure this path is correct

// GET /api/users/me - Get User Profile
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const userResult = await query(
            `SELECT id, role, name, date_of_birth, email, phone, address, nin, marital_status, passport_photo_url
             FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        const userProfile = userResult.rows[0];

        if (userProfile.date_of_birth) {
            userProfile.dateOfBirth = new Date(userProfile.date_of_birth).toISOString().split('T')[0];
        }
        delete userProfile.date_of_birth;
        userProfile.passportPhotoUrl = userProfile.passport_photo_url;
        delete userProfile.passport_photo_url;
        userProfile.maritalStatus = userProfile.marital_status;
        delete userProfile.marital_status;

        res.status(200).json(userProfile);

    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ error: 'Failed to retrieve user profile.' });
    }
});

// PATCH /api/users/me - Update User Profile (Authenticated User Only)
// IMPORTANT: Ensure this route is correctly placed and 'router.patch' is used.
router.patch('/me', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { name, email, phone, address, maritalStatus } = req.body;

    let updateFields = [];
    let queryParams = [userId];
    let paramIndex = 2;

    // Build update query dynamically for provided fields
    if (name !== undefined) { // Check for undefined, not just falsy (empty string is valid)
        updateFields.push(`name = $${paramIndex++}`);
        queryParams.push(name);
    }
    if (email !== undefined) {
        updateFields.push(`email = $${paramIndex++}`);
        queryParams.push(email);
    }
    if (phone !== undefined) {
        updateFields.push(`phone = $${paramIndex++}`);
        queryParams.push(phone);
    }

    if (address !== undefined) { // Address for landlords
        updateFields.push(`address = $${paramIndex++}`);
        queryParams.push(address);
    }
    if (maritalStatus !== undefined) { // Marital status for tenants
        updateFields.push(`marital_status = $${paramIndex++}`);
        queryParams.push(maritalStatus);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields provided for update.' });
    }

    const updateQuery = `
        UPDATE users
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $1
        RETURNING id;
    `;

    try {
        const result = await query(updateQuery, queryParams);

        if (result.rows.length === 0) {
            // This case would happen if the userId from token doesn't match any user
            return res.status(404).json({ error: 'User not found or no changes made.' });
        }

        res.status(200).json({ message: 'Profile updated successfully.' });

    } catch (error) {
        console.error('Update user profile error:', error);
        // Handle unique constraint violation for email if applicable
        if (error.code === '23505' && error.constraint === 'users_email_key') {
            return res.status(409).json({ error: 'Email already in use.' });
        }
        res.status(500).json({ error: 'Failed to update user profile.' });
    }
});


// GET /api/users/:id - Get basic user profile by any User ID and (if landlord) property count
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
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
            phone: user.phone || null,
            maritalStatus: user.marital_status || null,
            dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : null,
            address: user.address || null,
        };

        if (user.role === 'landlord') {
            const propertiesCountQuery = `
                SELECT COUNT(id) AS properties_listed
                FROM properties
                WHERE id = $1;
            `;
            const propertiesCountResult = await query(propertiesCountQuery, [id]);

            if (propertiesCountResult.rows && propertiesCountResult.rows.length > 0) {
                profileData.properties_listed = parseInt(propertiesCountResult.rows[0].properties_listed, 10);
            } else {
                profileData.properties_listed = 0;
            }
        }

        console.log('Backend (GET /api/users/:id): Sending profile data:', profileData);

        res.status(200).json(profileData);

    } catch (error) {
        console.error(`Backend (GET /api/users/:id): Error retrieving user profile for ID ${id}:`, error);
        res.status(500).json({ error: 'Failed to retrieve user profile.' });
    }
});

module.exports = router;
