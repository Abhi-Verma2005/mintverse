// auth/signup.rs

use axum::{Json, response::IntoResponse};
use super::types::ApiResponse;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct SignupRequest {
    pub email: String,
    pub password: String,
}

#[derive(Debug, Serialize)]
pub struct SignupReply {
    pub id: i32,
    pub email: String,
}

pub async fn signup_handler(
    Json(payload): Json<SignupRequest>,
) -> impl IntoResponse {
    // Janky fake response - normally you'd insert into DB etc.
    let fake_user = SignupReply {
        id: 1,
        email: payload.email,
    };

    let response = ApiResponse {
        success: true,
        data: Some(fake_user),
        message: String::from("User registered successfully (janky version)"),
    };

    Json(response)
}