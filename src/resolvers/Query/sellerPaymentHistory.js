import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import ReactionError from "@reactioncommerce/reaction-error";
export default async function sellerPaymentHistory(
  parnet,
  args,
  context,
  info
) {
  const { collections, userId } = context;
  const { Payments } = collections;
  
  if (!context.user) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const paymentData = await Payments.findOne({ sellerId: userId });
  console.log("data", paymentData);
  return paymentData;
}
