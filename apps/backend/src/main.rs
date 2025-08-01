
use axum::{
    Router,
    routing::{post, get},
    extract::{Path, State},
    response::IntoResponse,
    http::StatusCode,
    Json,
};
use reqwest;
use tower_http::cors::{CorsLayer, Any};
use migration::{Migrator, MigratorTrait};

mod auth;
mod database;
mod entities;
mod db_operations;
mod nft;
mod blockchain_sim;
mod minting_queue;
mod admin;
mod collections;

use auth::{signup_handler, user::get_user_handler};
use nft::handlers::*;
use admin::handlers::*;
use collections::handlers::*;
use database::{DbPool, health_check};





#[tokio::main]
async fn main() {
    // Load environment variables
    dotenvy::dotenv().ok();
    
    // Initialize logging
    tracing_subscriber::fmt::init();
    
    println!("Backend server starting...");
    
    // Initialize database connection
    let db_pool = match database::create_connection_pool().await {
        Ok(pool) => {
            println!("Database connection established");
            pool
        }
        Err(e) => {
            eprintln!("Failed to connect to database: {}", e);
            std::process::exit(1);
        }
    };
    
    // Run migrations
    let conn = db_pool.lock().await;
    if let Err(e) = Migrator::up(&*conn, None).await {
        eprintln!("Failed to run migrations: {}", e);
        std::process::exit(1);
    }
    drop(conn);
    println!("Database migrations completed");

    run_server(db_pool).await;
}


// Health check handler
async fn health_handler(State(pool): State<DbPool>) -> impl IntoResponse {
    match health_check(&pool).await {
        Ok(_) => (
            StatusCode::OK,
            Json(serde_json::json!({
                "status": "healthy",
                "database": "connected"
            }))
        ),
        Err(e) => (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(serde_json::json!({
                "status": "unhealthy",
                "database": "disconnected",
                "error": e.to_string()
            }))
        )
    }
}


async fn collection_metrics_handler(Path(collection_id): Path<String>) -> impl IntoResponse {
    let url = format!(
        "https://api.reservoir.tools/collections/v5?id={}",
        collection_id
    );

    let resp = match reqwest::get(&url).await {
        Ok(r) => match r.text().await {
            Ok(body) => (
                axum::http::StatusCode::OK,
                [("content-type", "application/json")],
                body
            ).into_response(),
            Err(_) => (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                "Failed to read response body"
            ).into_response(),
        },
        Err(_) => (
            axum::http::StatusCode::BAD_GATEWAY,
            "Failed to fetch from Reservoir API"
        ).into_response(),
    };
    resp
}


async fn run_server(db_pool: DbPool) {
    println!("Server is ready!");

    // Configure CORS
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        // Health check
        .route("/api/health", get(health_handler))
        // Auth routes
        .route("/api/auth/signup", post(signup_handler))
        .route("/api/auth/user/{wallet_address}", get(get_user_handler))
        // NFT routes
        .route("/api/nfts", get(get_nfts_handler))
        .route("/api/nfts/search", get(search_nfts_handler))
        .route("/api/nfts/{id}", get(get_nft_by_id_handler))
        .route("/api/nfts/mint", post(mint_nft_handler))
        .route("/api/nfts/mint-status/{mint_id}", get(get_mint_status_handler))
        .route("/api/users/{wallet_address}/nfts", get(get_user_nfts_handler))
        // Collection routes
        .route("/api/collections", get(get_collections_handler))
        .route("/api/collections/{id}", get(get_collection_by_id_handler))
        .route("/api/collections/{id}/nfts", get(get_collection_nfts_handler))
        .route("/api/collections", post(create_collection_handler))
        // Admin routes
        .route("/api/admin/stats", get(get_admin_stats_handler))
        .route("/api/admin/users", get(get_admin_users_handler))
        .route("/api/admin/nfts", get(get_admin_nfts_handler))
        .route("/api/admin/analytics", get(get_admin_analytics_handler))
        .route("/api/admin/featured", post(set_featured_nfts_handler))
        .route("/api/admin/demo/reset", post(reset_demo_data_handler))
        // Legacy route
        .route("/api/collections/{collection_id}/metrics", get(collection_metrics_handler))
        .layer(cors)
        .with_state(db_pool);

    let listener = tokio::net::TcpListener::bind("127.0.0.1:8000")
        .await
        .unwrap();

    println!("Server running on http://127.0.0.1:8000");
    axum::serve(listener, app).await.unwrap();
}

