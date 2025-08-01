use serde::{Deserialize, Serialize};
use crate::blockchain_sim::MintStatus;

#[derive(Debug, Deserialize)]
pub struct MintNftRequest {
    pub name: String,
    pub description: Option<String>,
    pub image_url: String,
    pub owner_wallet: String,
    pub attributes: Option<Vec<NftAttribute>>,
    pub collection_name: Option<String>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct NftAttribute {
    pub trait_type: String,
    pub value: String,
}

#[derive(Debug, Serialize)]
pub struct NftResponse {
    pub id: String,
    pub token_id: String,
    pub name: String,
    pub description: Option<String>,
    pub image: String,
    pub minted_at: chrono::DateTime<chrono::Utc>,
    pub transaction_hash: Option<String>,
    pub owner_id: String,
    pub attributes: Option<Vec<NftAttribute>>,
    pub collection_name: Option<String>,
    pub mint_status: Option<MintStatus>,
    pub block_number: Option<u64>,
    pub gas_used: Option<u64>,
    pub gas_price: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct NftWithOwnerResponse {
    pub id: String,
    pub token_id: String,
    pub name: String,
    pub description: Option<String>,
    pub image: String,
    pub minted_at: chrono::DateTime<chrono::Utc>,
    pub transaction_hash: Option<String>,
    pub owner: UserResponse,
    pub attributes: Option<Vec<NftAttribute>>,
    pub collection_name: Option<String>,
    pub mint_status: Option<MintStatus>,
    pub block_number: Option<u64>,
    pub gas_used: Option<u64>,
    pub gas_price: Option<u64>,
}

#[derive(Debug, Serialize)]
pub struct UserResponse {
    pub id: String,
    pub public_key: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub total: u64,
    pub page: u64,
    pub limit: u64,
}

#[derive(Debug, Serialize)]
pub struct MintResponse {
    pub success: bool,
    pub nft: Option<NftResponse>,
    pub mint_id: Option<String>,
    pub transaction_hash: Option<String>,
    pub block_number: Option<u64>,
    pub gas_used: Option<u64>,
    pub gas_price: Option<u64>,
    pub mint_status: MintStatus,
    pub message: String,
}

#[derive(Debug, Serialize)]
pub struct MintStatusResponse {
    pub mint_id: String,
    pub status: MintStatus,
    pub transaction_hash: Option<String>,
    pub block_number: Option<u64>,
    pub gas_used: Option<u64>,
    pub gas_price: Option<u64>,
    pub confirmations: Option<u32>,
    pub created_at: u64,
    pub confirmed_at: Option<u64>,
} 