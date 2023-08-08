import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import ReactionError from "@reactioncommerce/reaction-error";
import calculateSellerDiscount from "../../util/calculateSellerDiscount.js";
export default async function getAllPayouts(parent, args, context, info) {
  const { collections } = context;
  const { Payments } = collections;
  const { orderId, sellerId, status, ...connectionArgs } = args;
  if (!context.user) {
    throw new ReactionError("access-denied", "Access Denied");
  }
  const selector = {};
  if (orderId) {
    selector["orderId"] = orderId;
  }
  if (sellerId) {
    selector["sellerId"] = sellerId;
  }
  if (status) {
    selector["status"] = status;
  }
  const paymentData = Payments.find(selector);
  return getPaginatedResponse(paymentData, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info),
  });
}
