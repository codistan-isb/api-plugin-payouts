function hasBeenAMonthSinceRegistration(createdAt) {
  // Get the current date
  const currentDate = new Date();

  // Parse the user's createdAt date
  const userCreatedAt = new Date(createdAt);

  console.log("user created At date is ", userCreatedAt);

  // Calculate the difference in months between the current date and the createdAt date
  const diffInMonths =
    (currentDate.getFullYear() - userCreatedAt.getFullYear()) * 12 +
    currentDate.getMonth() -
    userCreatedAt.getMonth();

  // Compare with 1 (one month)
  return diffInMonths >= 1;
}

async function validateSellerDiscountCode(context, sellerId) {
  const { Accounts, SellerDiscounts } = context.collections;
  const account = await Accounts.findOne({ _id: sellerId });
  const code = account?.discountCode;
  if (!code) {
    return 0.2;
  }
  const { value } = await SellerDiscounts.findOne({
    code,
  });
  const percentage = value / 100;
  return percentage;
}

export default async function calculateSellerDiscount(context, sellerId) {
  const { users } = context.collections;

  const { createdAt } = await users.findOne({ _id: sellerId });

  //verify whether the it's been one month since user registration
  const oneMonth = hasBeenAMonthSinceRegistration(createdAt);
  const value = await validateSellerDiscountCode(context, sellerId);

  if (!oneMonth) {
    return value;
  } else {
    return 0.2;
  }
}
