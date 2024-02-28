async function hasPassedDuration(accountCreatedAt, duration) {
  const currentDate = new Date();
  const createdAt = new Date(accountCreatedAt);
  
  const diffInMonths =
    (currentDate.getFullYear() - createdAt.getFullYear()) * 12 +
    currentDate.getMonth() - createdAt.getMonth();
  console.log('diffInMonths', diffInMonths);
  console.log('duration', duration);
  return diffInMonths >= duration;
}

async function validateSellerDiscountCode(context, sellerId) {
  const { Accounts, SellerDiscounts } = context.collections;
  const account = await Accounts.findOne({ _id: sellerId });
  const code = account?.discountCode;
  
  if (!code) {
    return 0.2;
  }
  
  const { value } = await SellerDiscounts.findOne({ code });
  const percentage = value / 100;
  
  return percentage;
}

async function validateSellerDuration(context, sellerId) {
  const { SellerDiscounts } = context.collections;
  const account = await SellerDiscounts.findOne({ sellerId });
  
  if (!account) {
    return false; // No discount info found
  }
  
  const duration = account.duration;
  const accountCreatedAt = account.createdAt;

  return await hasPassedDuration(accountCreatedAt, duration);
}

export default async function calculateSellerDiscount(context, sellerId) {
  const { users } = context.collections;
  const { createdAt } = await users.findOne({ _id: sellerId });
  
  const hasPassed = await validateSellerDuration(context, sellerId);
  const discountValue = await validateSellerDiscountCode(context, sellerId);
  console.log('hasPassed', hasPassed);
  console.log('discountValue', discountValue);
  
  if (!hasPassed) {
    return discountValue;
  } else {
    return 0.2; // Default discount if duration has passed
  }
}
