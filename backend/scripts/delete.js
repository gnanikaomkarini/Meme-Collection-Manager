const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Meme = require('../models/meme.model');

async function deleteTestData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DATABASE_NAME
        });
        console.log('✓ MongoDB connected');

        // Define test user emails to identify and delete
        const testUserEmails = [
            'testuser1@example.com',
            'testuser2@example.com',
            'testuser3@example.com'
        ];

        // Find test users
        const testUsers = await User.find({ email: { $in: testUserEmails } });
        console.log(`✓ Found ${testUsers.length} test users`);

        if (testUsers.length === 0) {
            console.log('✗ No test users found to delete');
            process.exit(1);
        }

        const testUserIds = testUsers.map(u => u._id);
        console.log('  User IDs to delete:', testUserIds);

        // Find all memes owned by test users
        const testMemes = await Meme.find({ owner: { $in: testUserIds } });
        console.log(`✓ Found ${testMemes.length} test memes`);

        if (testMemes.length > 0) {
            console.log('  Meme IDs to delete:', testMemes.map(m => m._id));
        }

        // Delete memes first (to maintain referential integrity)
        if (testMemes.length > 0) {
            const deleteMemesResult = await Meme.deleteMany({ owner: { $in: testUserIds } });
            console.log(`✓ Deleted ${deleteMemesResult.deletedCount} memes`);
        }

        // Delete users
        const deleteUsersResult = await User.deleteMany({ email: { $in: testUserEmails } });
        console.log(`✓ Deleted ${deleteUsersResult.deletedCount} users`);

        // Display summary
        console.log('\n=== DELETION COMPLETE ===');
        console.log(`Total Users Deleted: ${deleteUsersResult.deletedCount}`);
        console.log(`Total Memes Deleted: ${testMemes.length}`);

        // Verify deletion
        const remainingUsers = await User.find({ email: { $in: testUserEmails } });
        const remainingMemes = await Meme.find({ owner: { $in: testUserIds } });
        
        console.log('\n=== VERIFICATION ===');
        console.log(`Remaining test users: ${remainingUsers.length} (should be 0)`);
        console.log(`Remaining test memes: ${remainingMemes.length} (should be 0)`);

        if (remainingUsers.length === 0 && remainingMemes.length === 0) {
            console.log('\n✓ All test data successfully removed!');
        } else {
            console.log('\n✗ Some test data remains');
        }

        process.exit(0);
    } catch (error) {
        console.error('✗ Error during deletion:', error.message);
        process.exit(1);
    }
}

deleteTestData();
