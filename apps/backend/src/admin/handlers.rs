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
    admin::types::*,
    db_operations::{get_nfts_with_owner, find_user_by_public_key, get_nfts_by_owner},
};
use chrono::{Utc, Duration};

#[derive(Debug, Deserialize)]
pub struct AdminQuery {
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

pub async fn get_admin_stats_handler(
    State(pool): State<DbPool>,
) -> impl IntoResponse {
    // Generate demo stats
    let stats = AdminStats {
        total_users: 1247,
        total_nfts: 8923,
        total_collections: 156,
        total_transactions: 15420,
        minting_trends: generate_minting_trends(),
        popular_collections: generate_popular_collections(),
        user_engagement: UserEngagement {
            active_users_24h: 342,
            active_users_7d: 1247,
            new_users_24h: 89,
            new_users_7d: 456,
        },
    };

    let response = ApiResponse {
        success: true,
        data: Some(stats),
        message: "Admin stats retrieved successfully".to_string(),
    };

    (StatusCode::OK, Json(response))
}

pub async fn get_admin_users_handler(
    State(pool): State<DbPool>,
    Query(query): Query<AdminQuery>,
) -> impl IntoResponse {
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = query.page.unwrap_or(0) * limit;

    // Generate demo users
    let users: Vec<AdminUser> = (offset..offset + limit)
        .map(|i| AdminUser {
            id: format!("user_{}", i + 1),
            public_key: format!("0x{:040x}", i + 1),
            nft_count: (i % 10) + 1,
            created_at: Utc::now() - Duration::days((i % 30) as i64),
            last_active: Some(Utc::now() - Duration::hours((i % 24) as i64)),
        })
        .collect();

    let response = ApiResponse {
        success: true,
        data: Some(PaginatedResponse {
            data: users,
            total: 1247,
            page: query.page.unwrap_or(0),
            limit,
        }),
        message: "Admin users retrieved successfully".to_string(),
    };

    (StatusCode::OK, Json(response))
}

pub async fn get_admin_nfts_handler(
    State(pool): State<DbPool>,
    Query(query): Query<AdminQuery>,
) -> impl IntoResponse {
    let limit = query.limit.unwrap_or(20).min(100);
    let offset = query.page.unwrap_or(0) * limit;

    // Generate demo NFTs
    let nfts: Vec<AdminNFT> = (offset..offset + limit)
        .map(|i| AdminNFT {
            id: format!("nft_{}", i + 1),
            token_id: format!("NFT-{:06}", i + 1),
            name: format!("Demo NFT #{}", i + 1),
            owner: format!("0x{:040x}", i % 100),
            collection: Some(format!("Collection {}", (i % 10) + 1)),
            minted_at: Utc::now() - Duration::hours((i % 168) as i64),
            is_featured: i % 20 == 0,
        })
        .collect();

    let response = ApiResponse {
        success: true,
        data: Some(PaginatedResponse {
            data: nfts,
            total: 8923,
            page: query.page.unwrap_or(0),
            limit,
        }),
        message: "Admin NFTs retrieved successfully".to_string(),
    };

    (StatusCode::OK, Json(response))
}

pub async fn get_admin_analytics_handler(
    State(pool): State<DbPool>,
) -> impl IntoResponse {
    let analytics = AnalyticsData {
        daily_mints: generate_daily_mints(),
        collection_performance: generate_collection_performance(),
        user_activity: generate_user_activity(),
    };

    let response = ApiResponse {
        success: true,
        data: Some(analytics),
        message: "Admin analytics retrieved successfully".to_string(),
    };

    (StatusCode::OK, Json(response))
}

pub async fn set_featured_nfts_handler(
    Json(payload): Json<SetFeaturedRequest>,
) -> impl IntoResponse {
    let response = ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "featured_count": payload.nft_ids.len(),
            "nft_ids": payload.nft_ids
        })),
        message: "Featured NFTs updated successfully".to_string(),
    };

    (StatusCode::OK, Json(response))
}

pub async fn reset_demo_data_handler(
    Json(payload): Json<DemoResetRequest>,
) -> impl IntoResponse {
    let response = ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "reset_type": payload.reset_type,
            "timestamp": Utc::now(),
            "status": "completed"
        })),
        message: "Demo data reset successfully".to_string(),
    };

    (StatusCode::OK, Json(response))
}

// Helper functions to generate demo data
fn generate_minting_trends() -> Vec<MintingTrend> {
    (0..30).map(|i| {
        let date = (Utc::now() - Duration::days(i as i64)).format("%Y-%m-%d").to_string();
        MintingTrend {
            date,
            count: (i % 50) + 10,
            volume: (i as f64 * 0.5) + 1.0,
        }
    }).rev().collect()
}

fn generate_popular_collections() -> Vec<PopularCollection> {
    (1..11).map(|i| PopularCollection {
        id: format!("collection_{}", i),
        name: format!("Popular Collection {}", i),
        nft_count: (i * 100) + (i % 50),
        total_volume: (i as f64 * 10.5) + 5.0,
    }).collect()
}

fn generate_daily_mints() -> Vec<DailyMint> {
    (0..30).map(|i| {
        let date = (Utc::now() - Duration::days(i as i64)).format("%Y-%m-%d").to_string();
        DailyMint {
            date,
            count: (i % 100) + 20,
            unique_users: (i % 50) + 10,
        }
    }).rev().collect()
}

fn generate_collection_performance() -> Vec<CollectionPerformance> {
    (1..16).map(|i| CollectionPerformance {
        collection_id: format!("col_{}", i),
        collection_name: format!("Collection {}", i),
        nft_count: (i * 50) + (i % 30),
        unique_owners: (i * 20) + (i % 15),
        avg_price: Some((i as f64 * 0.1) + 0.5),
    }).collect()
}

fn generate_user_activity() -> Vec<UserActivity> {
    (1..21).map(|i| UserActivity {
        user_id: format!("user_{}", i),
        wallet_address: format!("0x{:040x}", i),
        nft_count: (i % 15) + 1,
        last_mint: Some(Utc::now() - Duration::hours((i % 48) as i64)),
    }).collect()
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PaginatedResponse<T> {
    pub data: Vec<T>,
    pub total: u64,
    pub page: u64,
    pub limit: u64,
}

use serde::Serialize; 