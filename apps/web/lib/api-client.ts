const API_BASE_URL = 'http://localhost:8000/api';

export interface NFTMetadata {
  name: string;
  description?: string;
  image_url: string;
  owner_wallet: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  collection_name?: string;
}

export interface NFTResponse {
  id: string;
  token_id: string;
  name: string;
  description?: string;
  image: string;
  minted_at: string;
  transaction_hash?: string;
  owner_id: string;
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
  collection_name?: string;
  mint_status?: string;
  block_number?: number;
  gas_used?: number;
  gas_price?: number;
}

export interface MintResponse {
  success: boolean;
  nft?: NFTResponse;
  mint_id?: string;
  transaction_hash?: string;
  block_number?: number;
  gas_used?: number;
  gas_price?: number;
  mint_status: string;
  message: string;
}

export interface MintStatusResponse {
  mint_id: string;
  status: string;
  transaction_hash?: string;
  block_number?: number;
  gas_used?: number;
  gas_price?: number;
  confirmations?: number;
  created_at: number;
  confirmed_at?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
}

// Admin types
export interface AdminStats {
  total_users: number;
  total_nfts: number;
  total_collections: number;
  total_transactions: number;
  minting_trends: Array<{
    date: string;
    count: number;
    volume: number;
  }>;
  popular_collections: Array<{
    id: string;
    name: string;
    nft_count: number;
    total_volume: number;
  }>;
  user_engagement: {
    active_users_24h: number;
    active_users_7d: number;
    new_users_24h: number;
    new_users_7d: number;
  };
}

export interface AdminUser {
  id: string;
  public_key: string;
  nft_count: number;
  created_at: string;
  last_active?: string;
}

export interface AdminNFT {
  id: string;
  token_id: string;
  name: string;
  owner: string;
  collection?: string;
  minted_at: string;
  is_featured: boolean;
}

export interface AnalyticsData {
  daily_mints: Array<{
    date: string;
    count: number;
    unique_users: number;
  }>;
  collection_performance: Array<{
    collection_id: string;
    collection_name: string;
    nft_count: number;
    unique_owners: number;
    avg_price?: number;
  }>;
  user_activity: Array<{
    user_id: string;
    wallet_address: string;
    nft_count: number;
    last_mint?: string;
  }>;
}

// Collection types
export interface Collection {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  banner_url?: string;
  creator_wallet: string;
  nft_count: number;
  unique_owners: number;
  total_volume: number;
  floor_price?: number;
  created_at: string;
  is_featured: boolean;
}

export interface CreateCollectionRequest {
  name: string;
  description: string;
  image_url?: string;
  banner_url?: string;
  creator_wallet: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<{ status: string; database: string }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.json();
  }

  // NFT endpoints
  async getNFTs(page: number = 0, limit: number = 20): Promise<PaginatedResponse<NFTResponse>> {
    const response = await this.request<PaginatedResponse<NFTResponse>>(
      `/nfts?page=${page}&limit=${limit}`
    );
    return response.data!;
  }

  async getNFTById(id: string): Promise<NFTResponse> {
    const response = await this.request<NFTResponse>(`/nfts/${id}`);
    return response.data!;
  }

  async mintNFT(metadata: NFTMetadata): Promise<MintResponse> {
    const response = await this.request<MintResponse>('/nfts/mint', {
      method: 'POST',
      body: JSON.stringify(metadata),
    });
    return response.data!;
  }

  async getMintStatus(mintId: string): Promise<MintStatusResponse> {
    const response = await this.request<MintStatusResponse>(`/nfts/mint-status/${mintId}`);
    return response.data!;
  }

  async getUserNFTs(walletAddress: string, page: number = 0, limit: number = 20): Promise<PaginatedResponse<NFTResponse>> {
    const response = await this.request<PaginatedResponse<NFTResponse>>(
      `/users/${walletAddress}/nfts?page=${page}&limit=${limit}`
    );
    return response.data!;
  }

  // Auth endpoints
  async signup(walletAddress: string): Promise<any> {
    const response = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ public_key: walletAddress }),
    });
    return response.data;
  }

  async getUser(walletAddress: string): Promise<any> {
    const response = await this.request(`/auth/user/${walletAddress}`);
    return response.data;
  }

  // Collection metrics (legacy)
  async getCollectionMetrics(collectionId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/collections/${collectionId}/metrics`);
    return response.json();
  }

  // Search NFTs
  async searchNFTs(params: {
    query?: string;
    rarity?: string;
    collection?: string;
    owner?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<NFTResponse>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) searchParams.append(key, value.toString());
    });
    
    const response = await this.request<PaginatedResponse<NFTResponse>>(
      `/nfts/search?${searchParams.toString()}`
    );
    return response.data!;
  }

  // Collection endpoints
  async getCollections(page: number = 0, limit: number = 20): Promise<PaginatedResponse<Collection>> {
    const response = await this.request<PaginatedResponse<Collection>>(
      `/collections?page=${page}&limit=${limit}`
    );
    return response.data!;
  }

  async getCollectionById(id: string): Promise<Collection> {
    const response = await this.request<Collection>(`/collections/${id}`);
    return response.data!;
  }

  async getCollectionNFTs(id: string, page: number = 0, limit: number = 20): Promise<PaginatedResponse<NFTResponse>> {
    const response = await this.request<PaginatedResponse<NFTResponse>>(
      `/collections/${id}/nfts?page=${page}&limit=${limit}`
    );
    return response.data!;
  }

  async createCollection(data: CreateCollectionRequest): Promise<Collection> {
    const response = await this.request<Collection>('/collections', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data!;
  }

  // Admin endpoints
  async getAdminStats(): Promise<AdminStats> {
    const response = await this.request<AdminStats>('/admin/stats');
    return response.data!;
  }

  async getAdminUsers(page: number = 0, limit: number = 20): Promise<PaginatedResponse<AdminUser>> {
    const response = await this.request<PaginatedResponse<AdminUser>>(
      `/admin/users?page=${page}&limit=${limit}`
    );
    return response.data!;
  }

  async getAdminNFTs(page: number = 0, limit: number = 20): Promise<PaginatedResponse<AdminNFT>> {
    const response = await this.request<PaginatedResponse<AdminNFT>>(
      `/admin/nfts?page=${page}&limit=${limit}`
    );
    return response.data!;
  }

  async getAdminAnalytics(): Promise<AnalyticsData> {
    const response = await this.request<AnalyticsData>('/admin/analytics');
    return response.data!;
  }

  async setFeaturedNFTs(nftIds: string[]): Promise<any> {
    const response = await this.request('/admin/featured', {
      method: 'POST',
      body: JSON.stringify({ nft_ids: nftIds }),
    });
    return response.data;
  }

  async resetDemoData(resetType: string): Promise<any> {
    const response = await this.request('/admin/demo/reset', {
      method: 'POST',
      body: JSON.stringify({ reset_type: resetType }),
    });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient(); 