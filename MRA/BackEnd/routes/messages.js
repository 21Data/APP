const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { query } = require('../config/db');

// POST /api/messages - Send Message
router.post('/', authenticateToken, async (req, res) => {
    const { recipientId, propertyId, message } = req.body;
    const senderId = req.user.id; // Sender is the authenticated user

    if (!recipientId || !propertyId || !message) {
        return res.status(400).json({ error: 'Recipient ID, Property ID, and message are required.' });
    }

    try {
        // Optional: Verify recipientId and propertyId exist
        const recipientExists = await query('SELECT id FROM users WHERE id = $1', [recipientId]);
        if (recipientExists.rows.length === 0) {
            return res.status(404).json({ error: 'Recipient user not found.' });
        }

        const propertyExists = await query('SELECT id FROM properties WHERE id = $1', [propertyId]);
        if (propertyExists.rows.length === 0) {
            return res.status(404).json({ error: 'Property not found.' });
        }

        const messageInsertQuery = `
            INSERT INTO messages (sender_id, recipient_id, property_id, message, sent_at)
            VALUES ($1, $2, $3, $4, NOW())
            RETURNING id, sent_at;
        `;
        const newMessage = await query(messageInsertQuery, [senderId, recipientId, propertyId, message]);
        const messageId = newMessage.rows[0].id;
        const timestamp = newMessage.rows[0].sent_at;

        res.status(201).json({ messageId, timestamp: timestamp.toISOString() });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: 'Failed to send message.' });
    }
});

// GET /api/messages - Get Messages (filtered by propertyId and participantId)
router.get('/', authenticateToken, async (req, res) => {
    const { propertyId, participantId } = req.query; // participantId is the other user in the conversation
    const currentUserId = req.user.id;

    if (!propertyId || !participantId) {
        return res.status(400).json({ error: 'propertyId and participantId are required query parameters.' });
    }

    try {
        // Ensure both currentUserId and participantId are involved in messages for this property
        const messagesQuery = `
            SELECT id, sender_id, recipient_id, property_id, message, sent_at
            FROM messages
            WHERE property_id = $1
            AND (
                (sender_id = $2 AND recipient_id = $3) OR
                (sender_id = $3 AND recipient_id = $2)
            )
            ORDER BY sent_at ASC;
        `;
        const messagesResult = await query(messagesQuery, [propertyId, currentUserId, participantId]);

        const messages = messagesResult.rows.map(msg => ({
            id: msg.id,
            senderId: msg.sender_id,
            recipientId: msg.recipient_id,
            propertyId: msg.property_id,
            message: msg.message,
            timestamp: msg.sent_at.toISOString()
        }));

        res.status(200).json(messages);

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ error: 'Failed to retrieve messages.' });
    }
});

// GET /api/messages/my-conversations - Get a list of distinct conversations for the authenticated user
router.get('/my-conversations', authenticateToken, async (req, res) => {
    const currentUserId = req.user.id; // The authenticated user (landlord or tenant)

    try {
        const conversationsQuery = `
            WITH RankedMessages AS (
                SELECT
                    id,
                    sender_id,
                    recipient_id,
                    property_id,
                    message,
                    sent_at,
                    ROW_NUMBER() OVER (
                        PARTITION BY
                            CASE
                                WHEN sender_id = $1 THEN recipient_id
                                ELSE sender_id
                            END,
                            property_id
                        ORDER BY sent_at DESC
                    ) as rn
                FROM
                    messages
                WHERE
                    sender_id = $1 OR recipient_id = $1
            )
            SELECT
                rm.id,
                rm.sender_id,
                rm.recipient_id,
                rm.property_id,
                rm.message AS last_message,
                rm.sent_at AS last_message_time,
                p.title AS property_title,
                CASE
                    WHEN rm.sender_id = $1 THEN u_recipient.name
                    ELSE u_sender.name
                END AS participant_name,
                CASE
                    WHEN rm.sender_id = $1 THEN rm.recipient_id
                    ELSE rm.sender_id
                END AS participant_id -- The ID of the other person in the conversation
            FROM
                RankedMessages rm
            JOIN
                properties p ON rm.property_id = p.id
            LEFT JOIN
                users u_sender ON rm.sender_id = u_sender.id
            LEFT JOIN
                users u_recipient ON rm.recipient_id = u_recipient.id
            WHERE
                rm.rn = 1 -- Select only the latest message for each distinct conversation
            ORDER BY
                rm.sent_at DESC;
        `;

        const result = await query(conversationsQuery, [currentUserId]);

        const conversations = result.rows.map(row => ({
            id: row.id, // ID of the last message in the conversation (can be used as unique conversation ID)
            propertyId: row.property_id,
            participantId: row.participant_id,
            propertyTitle: row.property_title,
            participantName: row.participant_name,
            lastMessage: row.last_message,
            lastMessageTime: row.last_message_time.toISOString(),
        }));

        res.status(200).json(conversations);

    } catch (error) {
        console.error('Get my conversations error:', error);
        res.status(500).json({ error: 'Failed to retrieve conversations.' });
    }
});

module.exports = router;
