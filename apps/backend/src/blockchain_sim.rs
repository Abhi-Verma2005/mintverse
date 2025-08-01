use std::time::{SystemTime, UNIX_EPOCH};
use rand::Rng;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TransactionDetails {
    pub transaction_hash: String,
    pub block_number: u64,
    pub gas_used: u64,
    pub gas_price: u64,
    pub status: TransactionStatus,
    pub timestamp: u64,
    pub confirmations: u32,
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone, Copy)]
pub enum TransactionStatus {
    Pending,
    Confirmed,
    Failed,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MintingStatus {
    pub mint_id: String,
    pub status: MintStatus,
    pub transaction_details: Option<TransactionDetails>,
    pub created_at: u64,
    pub confirmed_at: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize, PartialEq, Clone, Copy)]
pub enum MintStatus {
    Pending,
    Confirming,
    Confirmed,
    Failed,
}

pub struct BlockchainSimulator;

impl BlockchainSimulator {
    /// Generate a realistic Ethereum transaction hash
    pub fn generate_transaction_hash() -> String {
        let mut rng = rand::thread_rng();
        let hash: String = (0..64)
            .map(|_| {
                let hex_chars = "0123456789abcdef";
                hex_chars.chars().nth(rng.gen_range(0..16)).unwrap()
            })
            .collect();
        format!("0x{}", hash)
    }

    /// Generate a realistic block number (current block + random offset)
    pub fn generate_block_number() -> u64 {
        let mut rng = rand::thread_rng();
        // Current Ethereum block is around 19,000,000+
        let current_block = 19_000_000;
        current_block + rng.gen_range(1..1000)
    }

    /// Generate realistic gas usage for NFT minting
    pub fn generate_gas_used() -> u64 {
        let mut rng = rand::thread_rng();
        // NFT minting typically uses 150,000 - 300,000 gas
        rng.gen_range(150_000..300_000)
    }

    /// Generate realistic gas price
    pub fn generate_gas_price() -> u64 {
        let mut rng = rand::thread_rng();
        // Gas price in wei (typically 20-50 gwei)
        rng.gen_range(20_000_000_000..50_000_000_000)
    }

    /// Get current timestamp
    pub fn current_timestamp() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs()
    }

    /// Simulate transaction confirmation delay
    pub fn get_confirmation_delay() -> u64 {
        let mut rng = rand::thread_rng();
        // 30-60 seconds for confirmation
        rng.gen_range(30..60)
    }

    /// Create a complete transaction details object
    pub fn create_transaction_details() -> TransactionDetails {
        TransactionDetails {
            transaction_hash: Self::generate_transaction_hash(),
            block_number: Self::generate_block_number(),
            gas_used: Self::generate_gas_used(),
            gas_price: Self::generate_gas_price(),
            status: TransactionStatus::Pending,
            timestamp: Self::current_timestamp(),
            confirmations: 0,
        }
    }

    /// Simulate transaction confirmation
    pub fn confirm_transaction(mut tx: TransactionDetails) -> TransactionDetails {
        tx.status = TransactionStatus::Confirmed;
        tx.confirmations = 12; // Standard confirmation count
        tx
    }

    /// Calculate gas cost in ETH
    pub fn calculate_gas_cost(gas_used: u64, gas_price: u64) -> f64 {
        let cost_wei = gas_used * gas_price;
        cost_wei as f64 / 1_000_000_000_000_000_000.0 // Convert wei to ETH
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_transaction_hash_format() {
        let hash = BlockchainSimulator::generate_transaction_hash();
        assert!(hash.starts_with("0x"));
        assert_eq!(hash.len(), 66); // 0x + 64 hex chars
    }

    #[test]
    fn test_block_number_range() {
        let block = BlockchainSimulator::generate_block_number();
        assert!(block >= 19_000_000);
        assert!(block < 19_001_000);
    }

    #[test]
    fn test_gas_usage_range() {
        let gas = BlockchainSimulator::generate_gas_used();
        assert!(gas >= 150_000);
        assert!(gas < 300_000);
    }
} 