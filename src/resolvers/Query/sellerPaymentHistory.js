import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import ReactionError from "@reactioncommerce/reaction-error";
export default async function sellerPaymentHistory(
  parnet,
  args,
  context,
  info
) {
    const { collections } = context;
  const { Payments } = collections;
  const { orderId, sellerId, status, ...connectionArgs } = args;
  if (!context.user) {
    throw new ReactionError("access-denied", "Access Denied");
  }
  const selector = {};
 
  if (sellerId) {
    selector["sellerId"] = sellerId;
  }
  
  const paymentData = Payments.find(selector);
  return getPaginatedResponse(paymentData, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info),
  });
}
