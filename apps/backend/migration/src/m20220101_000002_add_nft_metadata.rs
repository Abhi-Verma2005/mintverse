use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Add attributes and collection_name columns to nfts table
        manager
            .alter_table(
                Table::alter()
                    .table(Nfts::Table)
                    .add_column(ColumnDef::new(Nfts::Attributes).json().null())
                    .add_column(ColumnDef::new(Nfts::CollectionName).string().null())
                    .to_owned(),
            )
            .await?;

        Ok(())
    }

    async fn down(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        // Remove the added columns
        manager
            .alter_table(
                Table::alter()
                    .table(Nfts::Table)
                    .drop_column(Nfts::Attributes)
                    .drop_column(Nfts::CollectionName)
                    .to_owned(),
            )
            .await?;

        Ok(())
    }
}

#[derive(Iden)]
enum Nfts {
    Table,
    Attributes,
    CollectionName,
} 