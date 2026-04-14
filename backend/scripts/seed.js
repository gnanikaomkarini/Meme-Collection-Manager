const dotenv = require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Meme = require('../models/meme.model');

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DATABASE_NAME
        });
        console.log('✓ MongoDB connected');

        // Create test users
        const testUsers = [
            {
                googleId: 'test-user-1',
                displayName: 'Test User One',
                email: 'testuser1@example.com',
                profileImage: 'https://lh3.googleusercontent.com/a/test1'
            },
            {
                googleId: 'test-user-2',
                displayName: 'Test User Two',
                email: 'testuser2@example.com',
                profileImage: 'https://lh3.googleusercontent.com/a/test2'
            },
            {
                googleId: 'test-user-3',
                displayName: 'Test User Three',
                email: 'testuser3@example.com',
                profileImage: 'https://lh3.googleusercontent.com/a/test3'
            }
        ];

        // Insert users
        const insertedUsers = await User.insertMany(testUsers);
        console.log(`✓ Inserted ${insertedUsers.length} test users`);
        console.log('  User IDs:', insertedUsers.map(u => u._id));

        // Create test memes
        const testMemes = [
            {
                title: 'First Test Meme',
                caption: 'This is the first test meme for Experiment 3',
                imageUrl: 'http://localhost:3000/uploads/test-meme-1.jpg',
                category: 'funny',
                owner: insertedUsers[0]._id,
                isPublic: true,
                likes: [insertedUsers[1]._id],
                comments: [
                    {
                        author: insertedUsers[1]._id,
                        text: 'Great meme!',
                        createdAt: new Date()
                    }
                ]
            },
            {
                title: 'Second Test Meme',
                caption: 'This is the second test meme for Experiment 3',
                imageUrl: 'http://localhost:3000/uploads/test-meme-2.jpg',
                category: 'funny',
                owner: insertedUsers[1]._id,
                isPublic: true,
                likes: [insertedUsers[0]._id, insertedUsers[2]._id],
                comments: []
            },
            {
                title: 'Third Test Meme',
                caption: 'This is the third test meme for Experiment 3',
                imageUrl: 'http://localhost:3000/uploads/test-meme-3.jpg',
                category: 'political',
                owner: insertedUsers[2]._id,
                isPublic: true,
                likes: [],
                comments: [
                    {
                        author: insertedUsers[0]._id,
                        text: 'Interesting!',
                        createdAt: new Date()
                    },
                    {
                        author: insertedUsers[1]._id,
                        text: 'Love this!',
                        createdAt: new Date()
                    }
                ]
            },
            {
                title: 'Fourth Test Meme',
                caption: 'This is the fourth test meme for Experiment 3',
                imageUrl: 'http://localhost:3000/uploads/test-meme-4.jpg',
                category: 'motivational',
                owner: insertedUsers[0]._id,
                isPublic: true,
                likes: [insertedUsers[1]._id, insertedUsers[2]._id],
                comments: []
            },
            {
                title: 'Fifth Test Meme',
                caption: 'This is the fifth test meme for Experiment 3',
                imageUrl: 'http://localhost:3000/uploads/test-meme-5.jpg',
                category: 'reaction',
                owner: insertedUsers[1]._id,
                isPublic: true,
                likes: [insertedUsers[0]._id],
                comments: []
            }
        ];

        // Insert memes
        const insertedMemes = await Meme.insertMany(testMemes);
        console.log(`✓ Inserted ${insertedMemes.length} test memes`);
        console.log('  Meme IDs:', insertedMemes.map(m => m._id));

        // Display summary
        console.log('\n=== SEEDING COMPLETE ===');
        console.log(`Total Users Created: ${insertedUsers.length}`);
        console.log(`Total Memes Created: ${insertedMemes.length}`);
        console.log('\nSeeded Data Summary:');
        console.log('─'.repeat(50));
        
        insertedMemes.forEach((meme, index) => {
            console.log(`\nMeme ${index + 1}:`);
            console.log(`  ID: ${meme._id}`);
            console.log(`  Title: ${meme.title}`);
            console.log(`  Owner: ${meme.owner}`);
            console.log(`  Category: ${meme.category}`);
            console.log(`  Likes: ${meme.likes.length}`);
            console.log(`  Comments: ${meme.comments.length}`);
        });

        console.log('\n' + '─'.repeat(50));
        console.log('Use these IDs for deletion or testing');

        process.exit(0);
    } catch (error) {
        console.error('✗ Error during seeding:', error.message);
        process.exit(1);
    }
}

seedDatabase();
