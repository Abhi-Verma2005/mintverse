import { apiClient } from '../lib/api-client';

const DEMO_COLLECTIONS = [
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
  },
  {
    name: 'Nature Spirits',
    description: 'Magical nature spirits and forest guardians in beautiful digital art.',
    image_url: 'https://picsum.photos/400/400?random=4',
    banner_url: 'https://picsum.photos/1200/400?random=4',
    creator_wallet: '0x4567890123456789012345678901234567890123'
  },
  {
    name: 'Abstract Minds',
    description: 'Abstract art pieces that challenge perception and inspire creativity.',
    image_url: 'https://picsum.photos/400/400?random=5',
    banner_url: 'https://picsum.photos/1200/400?random=5',
    creator_wallet: '0x5678901234567890123456789012345678901234'
  }
];

const DEMO_NFT_NAMES = [
  'Ethereal Dream #1', 'Cosmic Warrior #1', 'Neon City #1', 'Nature Spirit #1', 'Abstract Mind #1',
  'Ethereal Dream #2', 'Cosmic Warrior #2', 'Neon City #2', 'Nature Spirit #2', 'Abstract Mind #2',
  'Ethereal Dream #3', 'Cosmic Warrior #3', 'Neon City #3', 'Nature Spirit #3', 'Abstract Mind #3',
  'Ethereal Dream #4', 'Cosmic Warrior #4', 'Neon City #4', 'Nature Spirit #4', 'Abstract Mind #4',
  'Ethereal Dream #5', 'Cosmic Warrior #5', 'Neon City #5', 'Nature Spirit #5', 'Abstract Mind #5'
];

const DEMO_DESCRIPTIONS = [
  'A mesmerizing piece that captures the essence of dreams and imagination.',
  'Epic cosmic warrior ready for battle in the vast expanse of space.',
  'Neon-lit cityscape with futuristic architecture and vibrant colors.',
  'Magical nature spirit guardian of the ancient forest.',
  'Abstract composition that challenges perception and reality.',
  'Dreamlike landscape with floating islands and ethereal beings.',
  'Cosmic being with celestial powers and otherworldly beauty.',
  'Cyberpunk street scene with neon lights and flying cars.',
  'Forest guardian with mystical powers and natural wisdom.',
  'Abstract mind-bending artwork that defies conventional thinking.'
];

const DEMO_ATTRIBUTES = [
  { trait_type: 'Rarity', value: 'Legendary' },
  { trait_type: 'Rarity', value: 'Epic' },
  { trait_type: 'Rarity', value: 'Rare' },
  { trait_type: 'Rarity', value: 'Common' },
  { trait_type: 'Element', value: 'Fire' },
  { trait_type: 'Element', value: 'Water' },
  { trait_type: 'Element', value: 'Earth' },
  { trait_type: 'Element', value: 'Air' },
  { trait_type: 'Element', value: 'Lightning' },
  { trait_type: 'Element', value: 'Ice' },
  { trait_type: 'Background', value: 'Space' },
  { trait_type: 'Background', value: 'Forest' },
  { trait_type: 'Background', value: 'City' },
  { trait_type: 'Background', value: 'Abstract' },
  { trait_type: 'Background', value: 'Dream' },
  { trait_type: 'Accessory', value: 'Crown' },
  { trait_type: 'Accessory', value: 'Sword' },
  { trait_type: 'Accessory', value: 'Wings' },
  { trait_type: 'Accessory', value: 'Halo' },
  { trait_type: 'Accessory', value: 'None' }
];

const DEMO_WALLETS = [
  '0x1234567890123456789012345678901234567890',
  '0x2345678901234567890123456789012345678901',
  '0x3456789012345678901234567890123456789012',
  '0x4567890123456789012345678901234567890123',
  '0x5678901234567890123456789012345678901234',
  '0x6789012345678901234567890123456789012345',
  '0x7890123456789012345678901234567890123456',
  '0x8901234567890123456789012345678901234567',
  '0x9012345678901234567890123456789012345678',
  '0xa012345678901234567890123456789012345678'
];

export async function generateDemoData() {
  console.log('🎨 Generating demo data...');

  try {
    // Create collections
    console.log('📁 Creating collections...');
    const collections = [];
    for (const collectionData of DEMO_COLLECTIONS) {
      try {
        const collection = await apiClient.createCollection(collectionData);
        collections.push(collection);
        console.log(`✅ Created collection: ${collection.name}`);
      } catch (error) {
        console.log(`⚠️ Collection ${collectionData.name} might already exist`);
      }
    }

    // Generate NFTs
    console.log('🖼️ Generating NFTs...');
    const nftPromises = [];
    
    for (let i = 0; i < 50; i++) {
      const collectionIndex = i % DEMO_COLLECTIONS.length;
      const walletIndex = i % DEMO_WALLETS.length;
      const nameIndex = i % DEMO_NFT_NAMES.length;
      const descIndex = i % DEMO_DESCRIPTIONS.length;
      
      const nftData = {
        name: DEMO_NFT_NAMES[nameIndex].replace('#1', `#${i + 1}`),
        description: DEMO_DESCRIPTIONS[descIndex],
        image_url: `https://picsum.photos/400/400?random=${i + 100}`,
        owner_wallet: DEMO_WALLETS[walletIndex],
        collection_name: DEMO_COLLECTIONS[collectionIndex].name,
        attributes: [
          DEMO_ATTRIBUTES[i % 5], // Rarity
          DEMO_ATTRIBUTES[4 + (i % 6)], // Element
          DEMO_ATTRIBUTES[10 + (i % 5)], // Background
          DEMO_ATTRIBUTES[15 + (i % 5)] // Accessory
        ]
      };

      nftPromises.push(
        apiClient.mintNFT(nftData)
          .then(() => console.log(`✅ Minted NFT: ${nftData.name}`))
          .catch(error => console.log(`⚠️ Failed to mint ${nftData.name}:`, error.message))
      );
    }

    await Promise.all(nftPromises);
    
    console.log('🎉 Demo data generation completed!');
    console.log(`📊 Generated ${collections.length} collections and ${nftPromises.length} NFTs`);
    
  } catch (error) {
    console.error('❌ Error generating demo data:', error);
  }
}

// Run if called directly
if (require.main === module) {
  generateDemoData();
} 