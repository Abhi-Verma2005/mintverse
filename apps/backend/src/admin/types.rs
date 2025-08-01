use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct AdminStats {
    pub total_users: u64,
    pub total_nfts: u64,
    pub total_collections: u64,
    pub total_transactions: u64,
    pub minting_trends: Vec<MintingTrend>,
    pub popular_collections: Vec<PopularCollection>,
    pub user_engagement: UserEngagement,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MintingTrend {
    pub date: String,
    pub count: u64,
    pub volume: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PopularCollection {
    pub id: String,
    pub name: String,
    pub nft_count: u64,
    pub total_volume: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserEngagement {
    pub active_users_24h: u64,
    pub active_users_7d: u64,
    pub new_users_24h: u64,
    pub new_users_7d: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AdminUser {
    pub id: String,
    pub public_key: String,
    pub nft_count: u64,
    pub created_at: DateTime<Utc>,
    pub last_active: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AdminNFT {
    pub id: String,
    pub token_id: String,
    pub name: String,
    pub owner: String,
    pub collection: Option<String>,
    pub minted_at: DateTime<Utc>,
    pub is_featured: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalyticsData {
    pub daily_mints: Vec<DailyMint>,
    pub collection_performance: Vec<CollectionPerformance>,
    pub user_activity: Vec<UserActivity>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DailyMint {
    pub date: String,
    pub count: u64,
    pub unique_users: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CollectionPerformance {
    pub collection_id: String,
    pub collection_name: String,
    pub nft_count: u64,
    pub unique_owners: u64,
    pub avg_price: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UserActivity {
    pub user_id: String,
    pub wallet_address: String,
    pub nft_count: u64,
    pub last_mint: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct SetFeaturedRequest {
    pub nft_ids: Vec<String>,
}

#[derive(Debug, Deserialize)]
pub struct DemoResetRequest {
    pub reset_type: String,
} 