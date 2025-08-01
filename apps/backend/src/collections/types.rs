use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct Collection {
    pub id: String,
    pub name: String,
    pub description: String,
    pub image_url: Option<String>,
    pub banner_url: Option<String>,
    pub creator_wallet: String,
    pub nft_count: u64,
    pub unique_owners: u64,
    pub total_volume: f64,
    pub floor_price: Option<f64>,
    pub created_at: DateTime<Utc>,
    pub is_featured: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateCollectionRequest {
    pub name: String,
    pub description: String,
    pub image_url: Option<String>,
    pub banner_url: Option<String>,
    pub creator_wallet: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CollectionStats {
    pub total_nfts: u64,
    pub unique_owners: u64,
    pub total_volume: f64,
    pub floor_price: Option<f64>,
    pub avg_price: Option<f64>,
    pub minting_trends: Vec<MintingTrend>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MintingTrend {
    pub date: String,
    pub count: u64,
    pub volume: f64,
} 