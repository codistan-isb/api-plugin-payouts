export default async function commissionCharges(parent, args, context) {
  console.log("commissionCharges resolver called for payout:", parent._id);
  console.log("parent.commissionCharges:", parent.commissionCharges);
  console.log("parent.totalPrice:", parent.totalPrice);
  
  // If commissionCharges already exists in the database, return it
  if (parent.commissionCharges !== undefined && parent.commissionCharges !== null) {
    console.log("Returning existing commissionCharges:", parent.commissionCharges);
    return parent.commissionCharges;
  }
  
  // Calculate commissionCharges on-the-fly for existing records that don't have this field
  // This uses the same logic as in startup.js
  
  // Check if we have the required fields to calculate
  if (!parent.totalPrice) {
    console.log("No totalPrice found, returning 0");
    return 0; // Return 0 if totalPrice is not available
  }
  
  try {
    // Try to fetch product details to determine if it has special tags
    const { collections } = context;
    const { Catalog } = collections;
    
    if (parent.productId) {
      const productDetails = await Catalog.findOne({
        "product._id": parent.productId,
      });
      
      if (productDetails?.product?.tagIds) {
        // Check if product has special tag
        const hasSpecialTag = productDetails.product.tagIds.includes("sSwaEF8XvAHLx4m4F");
        const commission = hasSpecialTag ? parent.totalPrice * 0.3 : parent.totalPrice * 0.2;
        console.log("Calculated commission with product details:", commission);
        return commission;
      }
    }
    
    // Fallback: Default commission calculation (20% for regular products)
    const commission = parent.totalPrice * 0.2;
    console.log("Calculated default commission:", commission);
    return commission;
    
  } catch (error) {
    console.log("Error calculating commissionCharges:", error);
    // Fallback: Default commission calculation (20% for regular products)
    const commission = parent.totalPrice * 0.2;
    console.log("Error fallback commission:", commission);
    return commission;
  }
}
