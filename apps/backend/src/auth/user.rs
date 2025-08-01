use axum::{extract::{Path, State}, Json, response::IntoResponse, http::StatusCode};
use super::types::ApiResponse;
use crate::database::DbPool;
use crate::db_operations::get_user_with_nft_count;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct UserProfileResponse {
    pub id: String,
    pub wallet_address: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub nft_count: i64,
}

pub async fn get_user_handler(
    State(pool): State<DbPool>,
    Path(wallet_address): Path<String>,
) -> impl IntoResponse {
    match get_user_with_nft_count(&pool, &wallet_address).await {
        Ok(Some((user, nft_count))) => {
            let response = ApiResponse {
                success: true,
                data: Some(UserProfileResponse {
                    id: user.id,
                    wallet_address: user.public_key,
                    created_at: chrono::DateTime::from_naive_utc_and_offset(user.created_at, chrono::Utc),
                    nft_count,
                }),
                message: "User profile retrieved successfully".to_string(),
            };
            (StatusCode::OK, Json(response))
        }
        Ok(None) => {
            let response = ApiResponse::<UserProfileResponse> {
                success: false,
                data: None,
                message: "User not found".to_string(),
            };
            (StatusCode::NOT_FOUND, Json(response))
        }
        Err(e) => {
            let response = ApiResponse::<UserProfileResponse> {
                success: false,
                data: None,
                message: format!("Failed to retrieve user: {}", e),
            };
            (StatusCode::INTERNAL_SERVER_ERROR, Json(response))
        }
    }
} 