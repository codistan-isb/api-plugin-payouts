import orderById from "./orderById.js";
import orderByReferenceId from "./orderByReferenceId.js";
import orders from "./orders.js";
import ordersByAccountId from "./ordersByAccountId.js";
import refunds from "./refunds.js";
import refundsByPaymentId from "./refundsByPaymentId.js";
import getOrderShippingByAddress from "./getOrderShippingByAddress.js";
import getAllPaymentsQuery from "./getAllPaymentsQuery.js";
export default {
  orderById,
  orderByReferenceId,
  orders,
  getAllPaymentsQuery,
  ordersByAccountId,
  refunds,
  refundsByPaymentId,
  getOrderShippingByAddress
};
