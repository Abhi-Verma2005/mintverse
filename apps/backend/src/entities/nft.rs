use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, PartialEq, DeriveEntityModel, Serialize, Deserialize)]
#[sea_orm(table_name = "nfts")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: String,
    pub token_id: String,
    pub name: String,
    pub description: Option<String>,
    pub image: String,
    pub minted_at: DateTime,
    pub transaction_hash: Option<String>,
    pub owner_id: String,
    pub attributes: Option<Json>,
    pub collection_name: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {
    #[sea_orm(
        belongs_to = "super::user::Entity",
        from = "Column::OwnerId",
        to = "super::user::Column::Id"
    )]
    User,
}

impl Related<super::user::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::User.def()
    }
}

impl ActiveModelBehavior for ActiveModel {} 