import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatPrice(price: number): string {
  return `${price.toFixed(2)} ETH`
}

export function getRarityColor(rarity: string): string {
  switch (rarity.toLowerCase()) {
    case 'legendary':
      return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
    case 'epic':
      return 'text-purple-400 border-purple-400/30 bg-purple-400/10'
    case 'rare':
      return 'text-blue-400 border-blue-400/30 bg-blue-400/10'
    case 'common':
      return 'text-gray-400 border-gray-400/30 bg-gray-400/10'
    default:
      return 'text-gray-400 border-gray-400/30 bg-gray-400/10'
  }
}

export function getRarityPercentage(rarity: string): number {
  switch (rarity.toLowerCase()) {
    case 'legendary':
      return 1
    case 'epic':
      return 5
    case 'rare':
      return 15
    case 'common':
      return 79
    default:
      return 100
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateDemoNFTs(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `nft_${i + 1}`,
    token_id: `NFT-${String(i + 1).padStart(6, '0')}`,
    name: `Ethereal Dream #${i + 1}`,
    description: `A beautiful piece from the Ethereal Dreams collection`,
    image: `https://picsum.photos/400/400?random=${i + 1}`,
    minted_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    transaction_hash: `0x${Math.random().toString(16).slice(2, 66)}`,
    owner_id: `user_${(i % 50) + 1}`,
    attributes: [
      {
        trait_type: "Rarity",
        value: i % 10 === 0 ? "Legendary" : i % 5 === 0 ? "Epic" : "Common"
      },
      {
        trait_type: "Element",
        value: ["Fire", "Water", "Earth", "Air"][i % 4]
      }
    ],
    collection_name: `Collection ${(i % 10) + 1}`,
    mint_status: "Confirmed" as const,
    block_number: 12345678 + i,
    gas_used: 210000 + (i * 1000),
    gas_price: 20000000000 + (i * 1000000)
  }))
}

export const animationVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const cardHover = {
  scale: 1.05,
  transition: { duration: 0.2 }
}

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
} 