/**
 * Database Migration Script
 * Sets emailVerified = true for all existing users
 * Run this ONCE after implementing email verification
 * 
 * Usage: node utils/migrateExistingUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const migrateExistingUsers = async () => {
    try {
        // Connect to MongoDB
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Count users that need migration
        const unverifiedCount = await User.countDocuments({
            emailVerified: { $ne: true }
        });

        if (unverifiedCount === 0) {
            console.log('✅ No users need migration. All users are already verified.');
            await mongoose.connection.close();
            process.exit(0);
        }

        console.log(`📊 Found ${unverifiedCount} users that need email verification status.`);
        console.log('');
        console.log('⚠️  This will mark all existing users as email verified.');
        console.log('   Continue? (Ctrl+C to cancel)');

        // Wait 3 seconds for user to cancel if needed
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Update all existing users to verified
        const result = await User.updateMany(
            { emailVerified: { $ne: true } },
            {
                $set: {
                    emailVerified: true,
                    verificationToken: null,
                    verificationExpiry: null
                }
            }
        );

        console.log('');
        console.log(`✅ Successfully updated ${result.modifiedCount} users`);
        console.log('   All existing users can now log in without email verification.');
        console.log('   New users will still need to verify their email.');

        // Close connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
};

// Run migration
migrateExistingUsers();
