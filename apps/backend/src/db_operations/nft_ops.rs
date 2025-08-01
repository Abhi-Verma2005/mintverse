use sea_orm::*;
use crate::entities::{Nft, NftModel, nft};
use crate::database::DbPool;
use anyhow::Result;

pub async fn create_nft(
    pool: &DbPool,
    token_id: String,
    name: String,
    description: Option<String>,
    image: String,
    owner_id: String,
    transaction_hash: Option<String>,
    attributes: Option<serde_json::Value>,
    collection_name: Option<String>,
) -> Result<NftModel> {
    let conn = pool.lock().await;
    
    let nft = NftModel {
        id: cuid::cuid2(),
        token_id,
        name,
        description,
        image,
        minted_at: chrono::Utc::now().naive_utc(),
        transaction_hash,
        owner_id,
        attributes,
        collection_name,
    };

    let nft_active = nft.clone().into_active_model();
    let result = nft_active.insert(&*conn).await?;
    
    Ok(result)
}

pub async fn find_nft_by_id(pool: &DbPool, id: &str) -> Result<Option<NftModel>> {
    let conn = pool.lock().await;
    
    let nft = Nft::find()
        .filter(nft::Column::Id.eq(id))
        .one(&*conn)
        .await?;
    
    Ok(nft)
}

pub async fn get_nfts_with_owner(
    pool: &DbPool,
    limit: Option<u64>,
    offset: Option<u64>,
) -> Result<Vec<(NftModel, crate::entities::UserModel)>> {
    let conn = pool.lock().await;
    
    let mut query = Nft::find()
        .inner_join(crate::entities::User);
    
    if let Some(limit) = limit {
        query = query.limit(limit);
    }
    
    if let Some(offset) = offset {
        query = query.offset(offset);
    }
    
    let nfts = query.all(&*conn).await?;
    
    // For now, let's return just the NFTs and fetch owners separately
    // This is a simplified approach - in production you'd want to optimize this
    let mut results = Vec::new();
    for nft in nfts {
        if let Some(owner) = crate::entities::User::find_by_id(&nft.owner_id).one(&*conn).await? {
            results.push((nft, owner));
        }
    }
    
    Ok(results)
}

pub async fn get_nfts_by_owner(
    pool: &DbPool,
    owner_id: &str,
    limit: Option<u64>,
    offset: Option<u64>,
) -> Result<Vec<NftModel>> {
    let conn = pool.lock().await;
    
    let mut query = Nft::find()
        .filter(nft::Column::OwnerId.eq(owner_id))
        .order_by_desc(nft::Column::MintedAt);
    
    if let Some(limit) = limit {
        query = query.limit(limit);
    }
    
    if let Some(offset) = offset {
        query = query.offset(offset);
    }
    
    let results = query.all(&*conn).await?;
    Ok(results)
} 