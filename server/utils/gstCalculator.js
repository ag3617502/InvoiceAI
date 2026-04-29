const calculateGST = (items, discountType, discountValue, isInterState) => {
  let subtotal = 0;

  items.forEach((item) => {
    item.amount = item.quantity * item.rate;
    subtotal += item.amount;
  });

  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = (subtotal * discountValue) / 100;
  } else if (discountType === 'flat') {
    discountAmount = discountValue;
  }

  const taxableAmount = subtotal - discountAmount;

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  items.forEach((item) => {
    const itemDiscountProportion = item.amount / subtotal;
    const itemTaxableAmount = item.amount - discountAmount * itemDiscountProportion;
    const itemGstRate = typeof item.gstRate === 'number' ? item.gstRate : 18;

    if (isInterState) {
      igst += (itemTaxableAmount * itemGstRate) / 100;
    } else {
      cgst += (itemTaxableAmount * (itemGstRate / 2)) / 100;
      sgst += (itemTaxableAmount * (itemGstRate / 2)) / 100;
    }
  });

  const total = taxableAmount + cgst + sgst + igst;

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    igst: Math.round(igst * 100) / 100,
    total: Math.round(total * 100) / 100,
    balanceDue: Math.round(total * 100) / 100,
  };
};

module.exports = { calculateGST };
