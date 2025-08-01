#!/bin/bash

echo "Testing Backend API Endpoints"
echo "=============================="

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:8000/api/health | jq .

echo -e "\n2. Testing NFT minting endpoint..."
curl -s -X POST http://localhost:8000/api/nfts/mint \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test NFT",
    "description": "A test NFT for verification",
    "image_url": "https://picsum.photos/400/400",
    "owner_wallet": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "attributes": [
      {"trait_type": "Rarity", "value": "Common"},
      {"trait_type": "Style", "value": "Abstract"}
    ],
    "collection_name": "Test Collection"
  }' | jq .

echo -e "\n3. Testing NFT listing endpoint..."
curl -s http://localhost:8000/api/nfts | jq .

echo -e "\n4. Testing user signup endpoint..."
curl -s -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"public_key": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"}' | jq .

echo -e "\nBackend API test completed!" 