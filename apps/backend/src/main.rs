use serde::{Serialize, Deserialize};
use std::collections::HashMap;



#[derive(Debug, Serialize, Deserialize)]
struct Api_Response<T> {
    success: bool,
    data: Option<T>, 
    message: String
}


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

    loop {
        tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
    }
}