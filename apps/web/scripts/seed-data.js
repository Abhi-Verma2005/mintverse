const API_BASE_URL = 'http://localhost:8000/api';

// Demo collections data
const demoCollections = [
  {
    name: 'Ethereal Dreams',
    description: 'A collection of dreamlike digital art pieces that transport you to otherworldly realms.',
    image_url: 'https://picsum.photos/400/400?random=1',
    banner_url: 'https://picsum.photos/1200/400?random=1',
    creator_wallet: '0x1234567890123456789012345678901234567890'
  },
  {
    name: 'Cosmic Warriors',
    description: 'Epic space warriors and cosmic beings in stunning digital art.',
    image_url: 'https://picsum.photos/400/400?random=2',
    banner_url: 'https://picsum.photos/1200/400?random=2',
    creator_wallet: '0x2345678901234567890123456789012345678901'
  },
  {
    name: 'Neon City',
    description: 'Cyberpunk-inspired cityscapes with neon lights and futuristic vibes.',
    image_url: 'https://picsum.photos/400/400?random=3',
    banner_url: 'https://picsum.photos/1200/400?random=3',
    creator_wallet: '0x3456789012345678901234567890123456789012'
  }
];

// Demo NFTs data
const demoNFTs = [
  {
    name: 'Ethereal Dream #1',
    description: 'A mesmerizing piece that captures the essence of dreams and imagination.',
    image_url: 'https://picsum.photos/400/400?random=101',
    owner_wallet: '0x1234567890123456789012345678901234567890',
    collection_name: 'Ethereal Dreams',
    attributes: [
      { trait_type: 'Rarity', value: 'Legendary' },
      { trait_type: 'Element', value: 'Fire' },
      { trait_type: 'Background', value: 'Space' }
    ]
  },
  {
    name: 'Cosmic Warrior #1',
    description: 'Epic cosmic warrior ready for battle in the vast expanse of space.',
    image_url: 'https://picsum.photos/400/400?random=102',
    owner_wallet: '0x2345678901234567890123456789012345678901',
    collection_name: 'Cosmic Warriors',
    attributes: [
      { trait_type: 'Rarity', value: 'Epic' },
      { trait_type: 'Element', value: 'Lightning' },
      { trait_type: 'Background', value: 'Space' }
    ]
  },
  {
    name: 'Neon City #1',
    description: 'Neon-lit cityscape with futuristic architecture and vibrant colors.',
    image_url: 'https://picsum.photos/400/400?random=103',
    owner_wallet: '0x3456789012345678901234567890123456789012',
    collection_name: 'Neon City',
    attributes: [
      { trait_type: 'Rarity', value: 'Rare' },
      { trait_type: 'Element', value: 'Electric' },
      { trait_type: 'Background', value: 'City' }
    ]
  },
  {
    name: 'Ethereal Dream #2',
    description: 'Dreamlike landscape with floating islands and ethereal beings.',
    image_url: 'https://picsum.photos/400/400?random=104',
    owner_wallet: '0x4567890123456789012345678901234567890123',
    collection_name: 'Ethereal Dreams',
    attributes: [
      { trait_type: 'Rarity', value: 'Common' },
      { trait_type: 'Element', value: 'Water' },
      { trait_type: 'Background', value: 'Dream' }
    ]
  },
  {
    name: 'Cosmic Warrior #2',
    description: 'Cosmic being with celestial powers and otherworldly beauty.',
    image_url: 'https://picsum.photos/400/400?random=105',
    owner_wallet: '0x5678901234567890123456789012345678901234',
    collection_name: 'Cosmic Warriors',
    attributes: [
      { trait_type: 'Rarity', value: 'Epic' },
      { trait_type: 'Element', value: 'Ice' },
      { trait_type: 'Background', value: 'Space' }
    ]
  },
  {
    name: 'Neon City #2',
    description: 'Cyberpunk street scene with neon lights and flying cars.',
    image_url: 'https://picsum.photos/400/400?random=106',
    owner_wallet: '0x6789012345678901234567890123456789012345',
    collection_name: 'Neon City',
    attributes: [
      { trait_type: 'Rarity', value: 'Rare' },
      { trait_type: 'Element', value: 'Fire' },
      { trait_type: 'Background', value: 'City' }
    ]
  }
];

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function seedData() {
  console.log('🌱 Starting to seed demo data...');

  try {
    // Create collections
    console.log('📁 Creating collections...');
    for (const collection of demoCollections) {
      try {
        await makeRequest('/collections', {
          method: 'POST',
          body: JSON.stringify(collection),
        });
        console.log(`✅ Created collection: ${collection.name}`);
      } catch (error) {
        console.log(`⚠️ Collection ${collection.name} might already exist`);
      }
    }

    // Create NFTs
    console.log('🖼️ Creating NFTs...');
    for (const nft of demoNFTs) {
      try {
        await makeRequest('/nfts/mint', {
          method: 'POST',
          body: JSON.stringify(nft),
        });
        console.log(`✅ Created NFT: ${nft.name}`);
      } catch (error) {
        console.log(`⚠️ Failed to create NFT ${nft.name}:`, error.message);
      }
    }

    console.log('🎉 Demo data seeding completed!');
    console.log(`📊 Created ${demoCollections.length} collections and ${demoNFTs.length} NFTs`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
}

// Run the seeding
seedData(); 