use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Create users table
        manager
            .create_table(
                Table::create()
                    .table(Users::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Users::Id).string().not_null().primary_key())
                    .col(ColumnDef::new(Users::PublicKey).string().not_null().unique_key())
                    .col(ColumnDef::new(Users::CreatedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .to_owned(),
            )
            .await?;

        // Create nfts table
        manager
            .create_table(
                Table::create()
                    .table(Nfts::Table)
                    .if_not_exists()
                    .col(ColumnDef::new(Nfts::Id).string().not_null().primary_key())
                    .col(ColumnDef::new(Nfts::TokenId).string().not_null())
                    .col(ColumnDef::new(Nfts::Name).string().not_null())
                    .col(ColumnDef::new(Nfts::Description).string().null())
                    .col(ColumnDef::new(Nfts::Image).string().not_null())
                    .col(ColumnDef::new(Nfts::MintedAt).timestamp().not_null().default(Expr::current_timestamp()))
                    .col(ColumnDef::new(Nfts::TransactionHash).string().null())
                    .col(ColumnDef::new(Nfts::OwnerId).string().not_null())
                    .foreign_key(
                        ForeignKey::create()
                            .name("fk_nft_owner")
                            .from(Nfts::Table, Nfts::OwnerId)
                            .to(Users::Table, Users::Id)
                            .on_delete(ForeignKeyAction::Cascade)
                    )
                    .to_owned(),
            )
            .await?;

        // Create index on owner_id
        manager
            .create_index(
                Index::create()
                    .name("idx_nfts_owner_id")
                    .table(Nfts::Table)
                    .col(Nfts::OwnerId)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        manager.drop_table(Table::drop().table(Nfts::Table).to_owned()).await?;
        manager.drop_table(Table::drop().table(Users::Table).to_owned()).await
    }
}

#[derive(Iden)]
enum Users {
    Table,
    Id,
    PublicKey,
    CreatedAt,
}

#[derive(Iden)]
enum Nfts {
    Table,
    Id,
    TokenId,
    Name,
    Description,
    Image,
    MintedAt,
    TransactionHash,
    OwnerId,
}