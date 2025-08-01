use axum::{
    extract::{Path, Query, State},
    Json,
    response::IntoResponse,
    http::StatusCode,
};
use serde::Deserialize;
use crate::{
    database::DbPool,
    db_operations::{create_nft, find_nft_by_id, get_nfts_with_owner, get_nfts_by_owner, find_user_by_public_key},
    auth::types::ApiResponse,
    nft::types::*,
    blockchain_sim::MintStatus,
    minting_queue::MintingQueue,
};
use std::sync::Arc;

#[derive(Debug, Deserialize)]
pub struct PaginationQuery {
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
pub struct SearchQuery {
    pub query: Option<String>,
    pub rarity: Option<String>,
    pub collection: Option<String>,
    pub owner: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

// Global minting queue instance
lazy_static::lazy_static! {
    static ref MINTING_QUEUE: Arc<MintingQueue> = Arc::new(MintingQueue::new());
}

pub async fn get_nfts_handler(
    State(pool): State<DbPool>,
    Query(query): Query<PaginationQuery>,
) -> impl IntoResponse {
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = query.page.unwrap_or(0) * limit;

    match get_nfts_with_owner(&pool, Some(limit), Some(offset)).await {
        Ok(nfts) => {
            let nft_responses: Vec<NftWithOwnerResponse> = nfts
                .into_iter()
                .map(|(nft, user)| {
                    // Convert stored JSON attributes back to NftAttribute structs
                    let attributes = nft.attributes.as_ref().and_then(|attrs| {
                        serde_json::from_value::<Vec<crate::nft::types::NftAttribute>>(attrs.clone()).ok()
                    });
                    
                    NftWithOwnerResponse {
                        id: nft.id,
                        token_id: nft.token_id,
                        name: nft.name,
                        description: nft.description,
                        image: nft.image,
                        minted_at: chrono::DateTime::from_naive_utc_and_offset(nft.minted_at, chrono::Utc),
                        transaction_hash: nft.transaction_hash,
                        owner: UserResponse {
                            id: user.id,
                            public_key: user.public_key,
                            created_at: chrono::DateTime::from_naive_utc_and_offset(user.created_at, chrono::Utc),
                        },
                        attributes,
                        collection_name: nft.collection_name,
                        mint_status: Some(MintStatus::Confirmed), // All existing NFTs are confirmed
                        block_number: None,
                        gas_used: None,
                        gas_price: None,
                    }
                })
                .collect();

            let total = nft_responses.len() as u64;
            let response = ApiResponse {
                success: true,
                data: Some(PaginatedResponse {
                    data: nft_responses,
                    total,
                    page: query.page.unwrap_or(0),
                    limit,
                }),
                message: "NFTs retrieved successfully".to_string(),
            };

            (StatusCode::OK, Json(response))
        }
        Err(e) => {
            let response = ApiResponse::<PaginatedResponse<NftWithOwnerResponse>> {
                success: false,
                data: None,
                message: format!("Failed to retrieve NFTs: {}", e),
            };
            (StatusCode::INTERNAL_SERVER_ERROR, Json(response))
        }
    }
}

pub async fn search_nfts_handler(
    State(pool): State<DbPool>,
    Query(query): Query<SearchQuery>,
) -> impl IntoResponse {
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = query.page.unwrap_or(0) * limit;

    // Generate demo search results based on query parameters
    let nfts: Vec<NftWithOwnerResponse> = (offset..offset + limit)
        .map(|i| {
            let rarity = if i % 10 == 0 { "Legendary" } else if i % 5 == 0 { "Epic" } else { "Common" };
            let collection = format!("Collection {}", (i % 10) + 1);
            let owner = format!("0x{:040x}", i % 100);
            
            // Filter based on search criteria
            let should_include = query.query.as_ref().map_or(true, |q| {
                format!("NFT-{:06}", i + 1).contains(q) || 
                format!("Ethereal Dream #{}", i + 1).contains(q)
            }) && query.rarity.as_ref().map_or(true, |r| rarity == r) &&
            query.collection.as_ref().map_or(true, |c| collection.contains(c)) &&
            query.owner.as_ref().map_or(true, |o| owner.contains(o));

            if should_include {
                Some(NftWithOwnerResponse {
                    id: format!("nft_{}", i + 1),
                    token_id: format!("NFT-{:06}", i + 1),
                    name: format!("Ethereal Dream #{}", i + 1),
                    description: Some(format!("A beautiful piece from the {} collection", collection)),
                    image: format!("https://picsum.photos/400/400?random={}", i + 1),
                    minted_at: chrono::DateTime::from_naive_utc_and_offset(
                        chrono::Utc::now().naive_utc() - chrono::Duration::hours((i % 168) as i64),
                        chrono::Utc
                    ),
                    transaction_hash: Some(format!("0x{:064x}", i + 1)),
                    owner: crate::nft::types::UserResponse {
                        id: format!("user_{}", i % 100),
                        public_key: owner,
                        created_at: chrono::DateTime::from_naive_utc_and_offset(
                            chrono::Utc::now().naive_utc() - chrono::Duration::days((i % 30) as i64),
                            chrono::Utc
                        ),
                    },
                    attributes: Some(vec![
                        crate::nft::types::NftAttribute {
                            trait_type: "Rarity".to_string(),
                            value: rarity.to_string(),
                        },
                        crate::nft::types::NftAttribute {
                            trait_type: "Element".to_string(),
                            value: if i % 4 == 0 { "Fire".to_string() } else if i % 4 == 1 { "Water".to_string() } else if i % 4 == 2 { "Earth".to_string() } else { "Air".to_string() },
                        },
                    ]),
                    collection_name: Some(collection),
                    mint_status: Some(crate::blockchain_sim::MintStatus::Confirmed),
                    block_number: Some(12345678 + i as u64),
                    gas_used: Some(210000 + (i * 1000) as u64),
                    gas_price: Some(20000000000 + (i * 1000000) as u64),
                })
            } else {
                None
            }
        })
        .filter_map(|nft| nft)
        .collect();

    let total = nfts.len() as u64;
    let response = ApiResponse {
        success: true,
        data: Some(PaginatedResponse {
            data: nfts,
            total,
            page: query.page.unwrap_or(0),
            limit,
        }),
        message: "NFTs search completed successfully".to_string(),
    };

    (StatusCode::OK, Json(response))
}

pub async fn get_nft_by_id_handler(
    State(pool): State<DbPool>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    match find_nft_by_id(&pool, &id).await {
        Ok(Some(nft)) => {
            let response = ApiResponse {
                success: true,
                data: Some(NftResponse {
                    id: nft.id,
                    token_id: nft.token_id,
                    name: nft.name,
                    description: nft.description,
                    image: nft.image,
                    minted_at: chrono::DateTime::from_naive_utc_and_offset(nft.minted_at, chrono::Utc),
                    transaction_hash: nft.transaction_hash,
                    owner_id: nft.owner_id,
                    attributes: None,
                    collection_name: None,
                    mint_status: Some(MintStatus::Confirmed),
                    block_number: None,
                    gas_used: None,
                    gas_price: None,
                }),
                message: "NFT retrieved successfully".to_string(),
            };
            (StatusCode::OK, Json(response))
        }
        Ok(None) => {
            let response = ApiResponse::<NftResponse> {
                success: false,
                data: None,
                message: "NFT not found".to_string(),
            };
            (StatusCode::NOT_FOUND, Json(response))
        }
        Err(e) => {
            let response = ApiResponse::<NftResponse> {
                success: false,
                data: None,
                message: format!("Failed to retrieve NFT: {}", e),
            };
            (StatusCode::INTERNAL_SERVER_ERROR, Json(response))
        }
    }
}

pub async fn mint_nft_handler(
    State(pool): State<DbPool>,
    Json(payload): Json<MintNftRequest>,
) -> impl IntoResponse {
    // First, find or create the user
    let user = match find_user_by_public_key(&pool, &payload.owner_wallet).await {
        Ok(Some(user)) => user,
        Ok(None) => {
            // Create new user if doesn't exist
            match crate::db_operations::create_user(&pool, payload.owner_wallet.clone()).await {
                Ok(user) => user,
                Err(e) => {
                    let response = ApiResponse::<MintResponse> {
                        success: false,
                        data: None,
                        message: format!("Failed to create user: {}", e),
                    };
                    return (StatusCode::INTERNAL_SERVER_ERROR, Json(response));
                }
            }
        }
        Err(e) => {
            let response = ApiResponse::<MintResponse> {
                success: false,
                data: None,
                message: format!("Failed to find user: {}", e),
            };
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(response));
        }
    };

    // Generate a unique token ID and mint ID
    let token_id = format!("NFT-{}", cuid::cuid2());
    let mint_id = cuid::cuid2();

    // Add to minting queue for blockchain simulation
    let minting_status = MINTING_QUEUE.add_mint(mint_id.clone());
    
    // Get transaction details from the minting status
    let transaction_details = minting_status.transaction_details.as_ref().unwrap();
    
    // Create the NFT in database
    match create_nft(
        &pool,
        token_id.clone(),
        payload.name.clone(),
        payload.description.clone(),
        payload.image_url.clone(),
        user.id.clone(),
        Some(transaction_details.transaction_hash.clone()),
        payload.attributes.as_ref().map(|attrs| serde_json::to_value(attrs).unwrap_or_default()),
        payload.collection_name.clone(),
    ).await {
        Ok(nft) => {
            let response = ApiResponse {
                success: true,
                data: Some(MintResponse {
                    success: true,
                    nft: Some(NftResponse {
                        id: nft.id,
                        token_id: nft.token_id,
                        name: nft.name,
                        description: nft.description,
                        image: nft.image,
                        minted_at: chrono::DateTime::from_naive_utc_and_offset(nft.minted_at, chrono::Utc),
                        transaction_hash: nft.transaction_hash,
                        owner_id: nft.owner_id,
                        attributes: payload.attributes,
                        collection_name: payload.collection_name,
                                            mint_status: Some(minting_status.status),
                    block_number: Some(transaction_details.block_number),
                    gas_used: Some(transaction_details.gas_used),
                    gas_price: Some(transaction_details.gas_price),
                }),
                mint_id: Some(mint_id),
                transaction_hash: Some(transaction_details.transaction_hash.clone()),
                block_number: Some(transaction_details.block_number),
                gas_used: Some(transaction_details.gas_used),
                gas_price: Some(transaction_details.gas_price),
                mint_status: minting_status.status.clone(),
                    message: "NFT minting initiated successfully".to_string(),
                }),
                message: "NFT minting initiated successfully".to_string(),
            };
            (StatusCode::CREATED, Json(response))
        }
        Err(e) => {
            let response = ApiResponse::<MintResponse> {
                success: false,
                data: None,
                message: format!("Failed to mint NFT: {}", e),
            };
            (StatusCode::INTERNAL_SERVER_ERROR, Json(response))
        }
    }
}

pub async fn get_mint_status_handler(
    Path(mint_id): Path<String>,
) -> impl IntoResponse {
    match MINTING_QUEUE.get_mint_status(&mint_id) {
        Some(minting_status) => {
            let transaction_details = minting_status.transaction_details.as_ref();
            
            let response = ApiResponse {
                success: true,
                data: Some(MintStatusResponse {
                    mint_id: minting_status.mint_id,
                    status: minting_status.status,
                    transaction_hash: transaction_details.map(|tx| tx.transaction_hash.clone()),
                    block_number: transaction_details.map(|tx| tx.block_number),
                    gas_used: transaction_details.map(|tx| tx.gas_used),
                    gas_price: transaction_details.map(|tx| tx.gas_price),
                    confirmations: transaction_details.map(|tx| tx.confirmations),
                    created_at: minting_status.created_at,
                    confirmed_at: minting_status.confirmed_at,
                }),
                message: "Mint status retrieved successfully".to_string(),
            };
            (StatusCode::OK, Json(response))
        }
        None => {
            let response = ApiResponse::<MintStatusResponse> {
                success: false,
                data: None,
                message: "Mint not found".to_string(),
            };
            (StatusCode::NOT_FOUND, Json(response))
        }
    }
}

pub async fn get_user_nfts_handler(
    State(pool): State<DbPool>,
    Path(wallet_address): Path<String>,
    Query(query): Query<PaginationQuery>,
) -> impl IntoResponse {
    // First find the user
    let user = match find_user_by_public_key(&pool, &wallet_address).await {
        Ok(Some(user)) => user,
        Ok(None) => {
            let response = ApiResponse::<PaginatedResponse<NftResponse>> {
                success: false,
                data: None,
                message: "User not found".to_string(),
            };
            return (StatusCode::NOT_FOUND, Json(response));
        }
        Err(e) => {
            let response = ApiResponse::<PaginatedResponse<NftResponse>> {
                success: false,
                data: None,
                message: format!("Failed to find user: {}", e),
            };
            return (StatusCode::INTERNAL_SERVER_ERROR, Json(response));
        }
    };

    let limit = query.limit.unwrap_or(20).min(100);
    let offset = query.page.unwrap_or(0) * limit;

    match get_nfts_by_owner(&pool, &user.id, Some(limit), Some(offset)).await {
        Ok(nfts) => {
            let nft_responses: Vec<NftResponse> = nfts
                .into_iter()
                .map(|nft| {
                    // Convert stored JSON attributes back to NftAttribute structs
                    let attributes = nft.attributes.as_ref().and_then(|attrs| {
                        serde_json::from_value::<Vec<crate::nft::types::NftAttribute>>(attrs.clone()).ok()
                    });
                    
                    NftResponse {
                        id: nft.id,
                        token_id: nft.token_id,
                        name: nft.name,
                        description: nft.description,
                        image: nft.image,
                        minted_at: chrono::DateTime::from_naive_utc_and_offset(nft.minted_at, chrono::Utc),
                        transaction_hash: nft.transaction_hash,
                        owner_id: nft.owner_id,
                        attributes,
                        collection_name: nft.collection_name,
                        mint_status: Some(MintStatus::Confirmed),
                        block_number: None,
                        gas_used: None,
                        gas_price: None,
                    }
                })
                .collect();

            let total = nft_responses.len() as u64;
            let response = ApiResponse {
                success: true,
                data: Some(PaginatedResponse {
                    data: nft_responses,
                    total,
                    page: query.page.unwrap_or(0),
                    limit,
                }),
                message: "User NFTs retrieved successfully".to_string(),
            };

            (StatusCode::OK, Json(response))
        }
        Err(e) => {
            let response = ApiResponse::<PaginatedResponse<NftResponse>> {
                success: false,
                data: None,
                message: format!("Failed to retrieve user NFTs: {}", e),
            };
            (StatusCode::INTERNAL_SERVER_ERROR, Json(response))
        }
    }
} 