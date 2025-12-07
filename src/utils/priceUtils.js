export const getMinMaxPrice = (product) => {
  const variants = product?.variants || [];

  if (!variants.length) return { min: 0, max: 0 };

  const prices = variants
    .map((v) => Number(v.price))
    .filter((x) => !isNaN(x));

  if (!prices.length) return { min: 0, max: 0 };

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};

// Format tiền Việt với dấu chấm phân cách hàng nghìn
export const formatVND = (price) => {
  if (!price && price !== 0) return '0đ';
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};
