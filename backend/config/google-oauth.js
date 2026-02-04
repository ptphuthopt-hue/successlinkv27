const { OAuth2Client } = require('google-auth-library');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google ID token
async function verifyGoogleToken(idToken) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        return {
            googleId: payload['sub'],
            email: payload['email'],
            name: payload['name'],
            picture: payload['picture'],
            emailVerified: payload['email_verified']
        };
    } catch (error) {
        console.error('Error verifying Google token:', error);
        throw new Error('Invalid Google token');
    }
}

module.exports = {
    verifyGoogleToken
};
