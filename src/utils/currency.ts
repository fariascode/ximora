export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(value);
}

export function getProfitMargin(purchasePrice: number, salePrice: number) {
  if (salePrice <= 0) return 0;
  return ((salePrice - purchasePrice) / salePrice) * 100;
}
