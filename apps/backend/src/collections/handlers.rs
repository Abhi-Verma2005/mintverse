use axum::{
    extract::{Path, Query, State},
    Json,
    response::IntoResponse,
    http::StatusCode,
};
use serde::Deserialize;
use crate::{
    database::DbPool,
    auth::types::ApiResponse,
    collections::types::*,
    nft::types::{NftResponse, NftAttribute},
};
use chrono::{Utc, Duration};

#[derive(Debug, Deserialize)]
pub struct CollectionQuery {
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

pub async fn get_collections_handler(
    State(pool): State<DbPool>,
    Query(query): Query<CollectionQuery>,
) -> impl IntoResponse {
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = query.page.unwrap_or(0) * limit;

    // Generate demo collections
    let collections: Vec<Collection> = (offset..offset + limit)
        .map(|i| Collection {
            id: format!("collection_{}", i + 1),
            name: format!("Ethereal Collection {}", i + 1),
            description: format!("A stunning collection of digital art pieces showcasing the beauty of ethereal dreams and cosmic wonders."),
            image_url: Some(format!("https://picsum.photos/400/400?random={}", i + 1)),
            banner_url: Some(format!("https://picsum.photos/1200/400?random={}", i + 1)),
            creator_wallet: format!("0x{:040x}", i + 1),
            nft_count: (i * 50) + (i % 100) + 10,
            unique_owners: (i * 20) + (i % 50) + 5,
            total_volume: (i as f64 * 10.5) + 5.0,
            floor_price: Some((i as f64 * 0.1) + 0.5),
            created_at: Utc::now() - Duration::days((i % 30) as i64),
            is_featured: i % 5 == 0,
        })
        .collect();

    let response = ApiResponse {
        success: true,
        data: Some(PaginatedResponse {
            data: collections,
            total: 156,
            page: query.page.unwrap_or(0),
            limit,
        }),
        message: "Collections retrieved successfully".to_string(),
    };

    (StatusCode::OK, Json(response))
}

pub async fn get_collection_by_id_handler(
    State(pool): State<DbPool>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    // Generate demo collection
    let collection = Collection {
        id: id.clone(),
        name: format!("Ethereal Collection {}", id),
        description: "A stunning collection of digital art pieces showcasing the beauty of ethereal dreams and cosmic wonders. Each piece is carefully crafted to evoke emotions and inspire creativity.".to_string(),
        image_url: Some(format!("https://picsum.photos/400/400?random={}", id)),
        banner_url: Some(format!("https://picsum.photos/1200/400?random={}", id)),
                    creator_wallet: format!("0x{:040x}", id.parse::<u64>().unwrap_or(1)).to_string(),
        nft_count: 342,
        unique_owners: 156,
        total_volume: 1247.5,
        floor_price: Some(0.85),
        created_at: Utc::now() - Duration::days(15),
        is_featured: true,
    };

    let response = ApiResponse {
        success: true,
        data: Some(collection),
        message: "Collection retrieved successfully".to_string(),
    };

    (StatusCode::OK, Json(response))
}

pub async fn get_collection_nfts_handler(
    State(pool): State<DbPool>,
    Path(id): Path<String>,
    Query(query): Query<CollectionQuery>,
) -> impl IntoResponse {
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = query.page.unwrap_or(0) * limit;

    // Generate demo NFTs for collection
    let nfts: Vec<NftResponse> = (offset..offset + limit)
        .map(|i| NftResponse {
            id: format!("nft_{}", i + 1),
            token_id: format!("NFT-{:06}", i + 1),
            name: format!("Ethereal Dream #{}", i + 1),
            description: Some(format!("A beautiful piece from the {} collection", id)),
            image: format!("https://picsum.photos/400/400?random={}", i + 1),
            minted_at: Utc::now() - Duration::hours((i % 168) as i64),
            transaction_hash: Some(format!("0x{:064x}", i + 1)),
            owner_id: format!("user_{}", (i % 50) + 1),
            attributes: Some(vec![
                NftAttribute {
                    trait_type: "Rarity".to_string(),
                    value: if i % 10 == 0 { "Legendary".to_string() } else if i % 5 == 0 { "Epic".to_string() } else { "Common".to_string() }
                },
                NftAttribute {
                    trait_type: "Element".to_string(),
                    value: if i % 4 == 0 { "Fire".to_string() } else if i % 4 == 1 { "Water".to_string() } else if i % 4 == 2 { "Earth".to_string() } else { "Air".to_string() }
                },
            ]),
            collection_name: Some(format!("Collection {}", id)),
            mint_status: Some(crate::blockchain_sim::MintStatus::Confirmed),
            block_number: Some(12345678 + i as u64),
            gas_used: Some(210000 + (i * 1000) as u64),
            gas_price: Some(20000000000 + (i * 1000000) as u64),
        })
        .collect();

    let response = ApiResponse {
        success: true,
        data: Some(PaginatedResponse {
            data: nfts,
            total: 342,
            page: query.page.unwrap_or(0),
            limit,
        }),
        message: "Collection NFTs retrieved successfully".to_string(),
    };

    (StatusCode::OK, Json(response))
}

pub async fn create_collection_handler(
    State(pool): State<DbPool>,
    Json(payload): Json<CreateCollectionRequest>,
) -> impl IntoResponse {
    let collection = Collection {
        id: format!("collection_{}", cuid::cuid2()),
        name: payload.name,
        description: payload.description,
        image_url: payload.image_url,
        banner_url: payload.banner_url,
        creator_wallet: payload.creator_wallet,
        nft_count: 0,
        unique_owners: 0,
        total_volume: 0.0,
        floor_price: None,
        created_at: Utc::now(),
        is_featured: false,
    };

    let response = ApiResponse {
        success: true,
        data: Some(collection),
        message: "Collection created successfully".to_string(),
    };

    (StatusCode::CREATED, Json(response))
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub total: u64,
    pub page: u64,
    pub limit: u64,
}

use serde::Serialize; 