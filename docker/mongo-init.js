// MongoDB initialization script
db = db.getSiblingDB('agentic-db');

// Create collections if they don't exist
db.createCollection('users');
db.createCollection('conversations');
db.createCollection('agents');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

db.conversations.createIndex({ userId: 1 });
db.conversations.createIndex({ createdAt: -1 });

db.agents.createIndex({ name: 1 });
db.agents.createIndex({ createdAt: -1 });

print('Database initialized successfully!');
