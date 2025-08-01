use sea_orm::{Database, DatabaseConnection, DbErr};
use std::sync::Arc;
use tokio::sync::Mutex;

pub type DbPool = Arc<Mutex<DatabaseConnection>>;

pub async fn establish_connection() -> Result<DatabaseConnection, DbErr> {
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    
    Database::connect(&database_url).await
}

pub async fn create_connection_pool() -> Result<DbPool, DbErr> {
    let connection = establish_connection().await?;
    Ok(Arc::new(Mutex::new(connection)))
}

pub async fn health_check(pool: &DbPool) -> Result<(), DbErr> {
    let conn = pool.lock().await;
    conn.ping().await
} 