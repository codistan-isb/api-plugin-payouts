import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
export default async function getAllPayouts(parnet, args, context, info) {
  const { collections } = context;
  const { Payments } = collections;
  const { orderId, sellerId, status, ...connectionArgs } = args;
  const selector ={}
   if (orderId) {
     selector["orderId"] = orderId;
   }
  if (sellerId) {
    selector["sellerId"] = sellerId;
  }
  if (status) {
    selector["status"] = status;
  }
  const paymentData =  Payments.find(selector)
  return getPaginatedResponse(paymentData, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info),
  });
}
