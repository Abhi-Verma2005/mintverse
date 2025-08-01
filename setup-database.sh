#!/bin/bash

echo "🚀 Setting up Mintverse Database..."

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://mintverse_user:mintverse_password@localhost:5432/mintverse

# Server Configuration
RUST_LOG=info
EOF
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

# Start PostgreSQL with Docker
echo "🐳 Starting PostgreSQL with Docker..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Check if PostgreSQL is running
if docker ps | grep -q mintverse-postgres; then
    echo "✅ PostgreSQL is running"
    echo ""
    echo "🎉 Database setup complete!"
    echo ""
    echo "📊 Database Details:"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: mintverse"
    echo "   Username: mintverse_user"
    echo "   Password: mintverse_password"
    echo ""
    echo "🔗 Connection URL: postgresql://mintverse_user:mintverse_password@localhost:5432/mintverse"
    echo ""
    echo "🚀 You can now start the backend server!"
else
    echo "❌ Failed to start PostgreSQL"
    exit 1
fi 