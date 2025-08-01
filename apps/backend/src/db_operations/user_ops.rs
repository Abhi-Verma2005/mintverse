use sea_orm::*;
use crate::entities::{User, UserModel, user};
use crate::database::DbPool;
use anyhow::Result;

pub async fn create_user(pool: &DbPool, public_key: String) -> Result<UserModel> {
    let conn = pool.lock().await;
    
    let user = UserModel {
        id: cuid::cuid2(),
        public_key: public_key.clone(),
        created_at: chrono::Utc::now().naive_utc(),
    };

    let user_active = user.clone().into_active_model();
    let result = user_active.insert(&*conn).await?;
    
    Ok(result)
}

pub async fn find_user_by_public_key(pool: &DbPool, public_key: &str) -> Result<Option<UserModel>> {
    let conn = pool.lock().await;
    
    let user = User::find()
        .filter(user::Column::PublicKey.eq(public_key))
        .one(&*conn)
        .await?;
    
    Ok(user)
}

pub async fn get_user_with_nft_count(pool: &DbPool, public_key: &str) -> Result<Option<(UserModel, i64)>> {
    let conn = pool.lock().await;
    
    // First get the user
    let user = User::find()
        .filter(user::Column::PublicKey.eq(public_key))
        .one(&*conn)
        .await?;
    
    if let Some(user) = user {
        // Then count their NFTs
        let nft_count = crate::entities::Nft::find()
            .filter(crate::entities::nft::Column::OwnerId.eq(&user.id))
            .count(&*conn)
            .await?;
        
        Ok(Some((user, nft_count as i64)))
    } else {
        Ok(None)
    }
} 