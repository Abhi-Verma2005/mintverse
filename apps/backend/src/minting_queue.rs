use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tokio::time::{sleep, Duration};
use crate::blockchain_sim::{BlockchainSimulator, MintingStatus, MintStatus, TransactionStatus};

#[derive(Debug, Clone)]
pub struct MintingQueue {
    pending_mints: Arc<Mutex<HashMap<String, MintingStatus>>>,
}

impl MintingQueue {
    pub fn new() -> Self {
        let queue = Self {
            pending_mints: Arc::new(Mutex::new(HashMap::new())),
        };
        
        // Start the confirmation worker
        queue.start_confirmation_worker();
        
        queue
    }

    /// Add a new mint to the queue
    pub fn add_mint(&self, mint_id: String) -> MintingStatus {
        let transaction_details = BlockchainSimulator::create_transaction_details();
        
        let minting_status = MintingStatus {
            mint_id: mint_id.clone(),
            status: MintStatus::Pending,
            transaction_details: Some(transaction_details),
            created_at: BlockchainSimulator::current_timestamp(),
            confirmed_at: None,
        };

        {
            let mut pending = self.pending_mints.lock().unwrap();
            pending.insert(mint_id, minting_status.clone());
        }

        minting_status
    }

    /// Get mint status by ID
    pub fn get_mint_status(&self, mint_id: &str) -> Option<MintingStatus> {
        let pending = self.pending_mints.lock().unwrap();
        pending.get(mint_id).cloned()
    }

    /// Update mint status
    pub fn update_mint_status(&self, mint_id: &str, status: MintStatus) {
        let mut pending = self.pending_mints.lock().unwrap();
        if let Some(mint) = pending.get_mut(mint_id) {
            mint.status = status;
            if status == MintStatus::Confirmed {
                mint.confirmed_at = Some(BlockchainSimulator::current_timestamp());
                if let Some(ref mut tx) = mint.transaction_details {
                    tx.status = TransactionStatus::Confirmed;
                    tx.confirmations = 12;
                }
            }
        }
    }

    /// Remove confirmed mint from queue
    pub fn remove_mint(&self, mint_id: &str) {
        let mut pending = self.pending_mints.lock().unwrap();
        pending.remove(mint_id);
    }

    /// Get all pending mints
    pub fn get_pending_mints(&self) -> Vec<MintingStatus> {
        let pending = self.pending_mints.lock().unwrap();
        pending.values().map(|v| v.clone()).collect()
    }

    /// Start the background worker that simulates transaction confirmations
    fn start_confirmation_worker(&self) {
        let pending_mints = Arc::clone(&self.pending_mints);
        
        tokio::spawn(async move {
            loop {
                sleep(Duration::from_secs(5)).await; // Check every 5 seconds
                
                let mut to_update = Vec::new();
                let mut to_remove = Vec::new();
                
                {
                    let mut pending = pending_mints.lock().unwrap();
                    
                    for (mint_id, mint_status) in pending.iter_mut() {
                        match mint_status.status {
                            MintStatus::Pending => {
                                // Move to confirming after a short delay
                                let elapsed = BlockchainSimulator::current_timestamp() - mint_status.created_at;
                                if elapsed >= 3 {
                                    mint_status.status = MintStatus::Confirming;
                                    to_update.push((mint_id.clone(), MintStatus::Confirming));
                                }
                            }
                            MintStatus::Confirming => {
                                // Simulate confirmation after random delay
                                let elapsed = BlockchainSimulator::current_timestamp() - mint_status.created_at;
                                let confirmation_delay = BlockchainSimulator::get_confirmation_delay();
                                
                                if elapsed >= confirmation_delay {
                                    mint_status.status = MintStatus::Confirmed;
                                    mint_status.confirmed_at = Some(BlockchainSimulator::current_timestamp());
                                    
                                    if let Some(ref mut tx) = mint_status.transaction_details {
                                        tx.status = TransactionStatus::Confirmed;
                                        tx.confirmations = 12;
                                    }
                                    
                                    to_update.push((mint_id.clone(), MintStatus::Confirmed));
                                    to_remove.push(mint_id.clone());
                                }
                            }
                            MintStatus::Confirmed => {
                                // Keep confirmed mints for a while before removing
                                if let Some(confirmed_at) = mint_status.confirmed_at {
                                    let elapsed = BlockchainSimulator::current_timestamp() - confirmed_at;
                                    if elapsed >= 300 { // Remove after 5 minutes
                                        to_remove.push(mint_id.clone());
                                    }
                                }
                            }
                            MintStatus::Failed => {
                                // Remove failed mints after a delay
                                let elapsed = BlockchainSimulator::current_timestamp() - mint_status.created_at;
                                if elapsed >= 60 { // Remove after 1 minute
                                    to_remove.push(mint_id.clone());
                                }
                            }
                        }
                    }
                    
                    // Remove completed mints
                    for mint_id in to_remove {
                        pending.remove(&mint_id);
                    }
                }
                
                // Log updates
                for (mint_id, status) in to_update {
                    tracing::info!("Mint {} status updated to {:?}", mint_id, status);
                }
            }
        });
    }
}

impl Default for MintingQueue {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_minting_queue() {
        let queue = MintingQueue::new();
        let mint_id = cuid::cuid2();
        
        // Add a mint
        let status = queue.add_mint(mint_id.clone());
        assert_eq!(status.status, MintStatus::Pending);
        assert_eq!(status.mint_id, mint_id);
        
        // Get status
        let retrieved = queue.get_mint_status(&mint_id);
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().status, MintStatus::Pending);
    }
} 