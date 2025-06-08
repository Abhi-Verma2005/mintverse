export const contractAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

export const contractABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  
  "function tokenCounter() view returns (uint256)",
  "function createNFT(string memory tokenURI) returns (uint256)",

  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)"
];