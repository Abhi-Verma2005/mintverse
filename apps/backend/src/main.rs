use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use axum::{
    Router,
    routing::{post, get}
};
mod auth;
use auth::signup_handler;





#[tokio::main]
async fn main() {
    println!("Backend server starting...");
    let mut app_state = AppState::new();

    run_server(app_state).await;

}


struct AppState {
    data: HashMap<String, String>
}

impl AppState {
    fn new() -> Self {
        Self {
            data: HashMap::new()
        }
    }   
}


async fn run_server(mut state: AppState) {
    println!("Server is ready!");

    let app = Router::new()
        .route("/api/signup", post(signup_handler));

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();

    println!("🚀 Server running on http://127.0.0.1:3000");

    axum::serve(listener, app).await.unwrap();
}

