export function formatPrice(price: bigint): string {
  const priceNum = Number(price);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(priceNum);
}

export function formatPriceCompact(price: bigint): string {
  const priceNum = Number(price);
  if (priceNum >= 100000) {
    return `₹${(priceNum / 100000).toFixed(1)}L`;
  }
  if (priceNum >= 1000) {
    return `₹${(priceNum / 1000).toFixed(1)}K`;
  }
  return `₹${priceNum}`;
}
