// import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
// import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
// import ReactionError from "@reactioncommerce/reaction-error";
// import calculateSellerDiscount from "../../util/calculateSellerDiscount.js";
// export default async function getAllPayouts(parent, args, context, info) {
//   const { collections } = context;
//   const { Payments } = collections;
//   const { orderId, sellerId, status, ...connectionArgs } = args;
//   if (!context.user) {
//     throw new ReactionError("access-denied", "Access Denied");
//   }
//   const selector = {};
//   if (orderId) {
//     selector["orderId"] = orderId;
//   }
//   if (sellerId) {
//     selector["sellerId"] = sellerId;
//   }
//   if (status) {

//     console.log("STATUS , " + status)
//     selector["status"] = status;
//   }
//   const paymentData = Payments.find(selector);
//   return getPaginatedResponse(paymentData, connectionArgs, {
//     includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
//     includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
//     includeTotalCount: wasFieldRequested("totalCount", info),
//   });
// }



import getPaginatedResponse from "@reactioncommerce/api-utils/graphql/getPaginatedResponse.js";
import wasFieldRequested from "@reactioncommerce/api-utils/graphql/wasFieldRequested.js";
import ReactionError from "@reactioncommerce/reaction-error";
import calculateSellerDiscount from "../../util/calculateSellerDiscount.js";

export default async function getAllPayouts(parent, args, context, info) {
  const { collections } = context;
  const { Payments } = collections;
  const { orderId, sellerId, status, productId, internalOrderId, productTitle, startDate, endDate, ...connectionArgs } = args;

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
    selector["status"] = status

  }

  if (productId) {
    selector["productId"] = productId;
  }

  if (internalOrderId) {
    console.log("internalOrderId", internalOrderId)
    selector["internalOrderId"] = internalOrderId;
  }

  if (productTitle) {
    selector["productTitle"] = new RegExp(productTitle, 'i');
  }

  if (startDate && endDate) {
    const formattedStartDate = new Date(startDate).toUTCString();
    const formattedEndDate = new Date(endDate).toUTCString();

    const endDateObj = new Date(endDate);
    endDateObj.setUTCHours(23, 59, 59, 999);
    const formattedEndDateTime = endDateObj.toUTCString();

    // Update the selector to use the formatted date strings directly for MongoDB querying
    selector["createdAt"] = {
      $gte: formattedStartDate,
      $lte: formattedEndDateTime
    };
  }
  const paymentData = Payments.find(selector);
  return getPaginatedResponse(paymentData, connectionArgs, {
    includeHasNextPage: wasFieldRequested("pageInfo.hasNextPage", info),
    includeHasPreviousPage: wasFieldRequested("pageInfo.hasPreviousPage", info),
    includeTotalCount: wasFieldRequested("totalCount", info),
  });
}
