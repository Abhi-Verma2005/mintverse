// auth/signup.rs

use axum::{Json, response::IntoResponse, extract::State, http::StatusCode};
use super::types::ApiResponse;
use crate::database::DbPool;
use crate::db_operations::{create_user, find_user_by_public_key};
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct SignupRequest {
    pub wallet_address: String,
}

#[derive(Debug, Serialize)]
pub struct SignupReply {
    pub id: String,
    pub wallet_address: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

pub async fn signup_handler(
    State(pool): State<DbPool>,
    Json(payload): Json<SignupRequest>,
) -> impl IntoResponse {
    // Check if user already exists
    match find_user_by_public_key(&pool, &payload.wallet_address).await {
        Ok(Some(existing_user)) => {
            let response = ApiResponse {
                success: true,
                data: Some(SignupReply {
                    id: existing_user.id,
                    wallet_address: existing_user.public_key,
                    created_at: chrono::DateTime::from_naive_utc_and_offset(existing_user.created_at, chrono::Utc),
                }),
                message: String::from("User already exists"),
            };
            (StatusCode::OK, Json(response))
        }
        Ok(None) => {
            // Create new user
            match create_user(&pool, payload.wallet_address.clone()).await {
                Ok(new_user) => {
                    let response = ApiResponse {
                        success: true,
                        data: Some(SignupReply {
                            id: new_user.id,
                            wallet_address: new_user.public_key,
                            created_at: chrono::DateTime::from_naive_utc_and_offset(new_user.created_at, chrono::Utc),
                        }),
                        message: String::from("User registered successfully"),
                    };
                    (StatusCode::CREATED, Json(response))
                }
                Err(e) => {
                    let response = ApiResponse::<SignupReply> {
                        success: false,
                        data: None,
                        message: format!("Failed to create user: {}", e),
                    };
                    (StatusCode::INTERNAL_SERVER_ERROR, Json(response))
                }
            }
        }
        Err(e) => {
                        let response = ApiResponse::<SignupReply> {
                success: false,
                data: None,
                message: format!("Failed to check user existence: {}", e),
            };
            (StatusCode::INTERNAL_SERVER_ERROR, Json(response))
        }
    }
}