import Random from "@reactioncommerce/random";
import accounting from "accounting-js";
import calculateSellerDiscount from "./util/calculateSellerDiscount.js";
const completeOrderStatus = "coreOrderWorkflow/completed";
const completeOrderItemStatus = "coreOrderItemWorkflow/completed";

async function createPayment(context, order, itemId, sellerId, status) {
  const { appEvents, collections } = context;
  const { SubOrders, Payments, users,Catalog,Accounts } = collections;
  const PaymentExist = await Payments.findOne({
    itemId: itemId,
    orderId: order._id,
    sellerId: sellerId,
  });

  if (PaymentExist) {
    console.log("payout already generated");
    return;
  }
  console.log("generating new payout");
  const SubOrderExist = await SubOrders.findOne({
    parentId: order?._id,
    itemIds: { $in: [itemId] },
  });

  if (SubOrderExist != null) {
    let foundItem = false;
    const payOutPendingGroups = SubOrderExist.shipping.map((group) => {
      let itemToAdd;
      const payOutPendingItems = group.items.filter((item) => {
        if (item._id == itemId) return item;
      });
      const updatedGroup = { items: payOutPendingItems };

      return updatedGroup;
    });

    const sellerDiscount = await calculateSellerDiscount(context, sellerId);

    console.log("seller discount is in startup is", sellerDiscount);

    const account = payOutPendingGroups.map((group) => {
      group.items.map(async (item) => {
        const totalPrice = item.price.amount;
        const comission = totalPrice * sellerDiscount;
        const payoutPrice = totalPrice - comission;
        console.log("totalPrice", totalPrice);
        console.log("payoutPrice", payoutPrice);
        const sellerDetails = await Accounts.findOne({
          userId: sellerId,
        });
        const productDetails = await Catalog.findOne({
          "product._id": item.productId,
         });
         console.log("product", productDetails);
         console.log("productDetails",productDetails?.product?.title,productDetails?.product?.slug,productDetails?.product?.pageTitle);
        console.log("sellerDetails", sellerDetails);
        const PaymentObj = {
          _id: Random.id(),
          totalPrice,
          fee: comission,
          amount: payoutPrice,
          itemId: item._id,
          productId: item.productId,
          sellerId: sellerId,
          productTitle: productDetails?.product?.title,
          productSlug: productDetails?.product?.slug,
          sellerBankDetails: sellerDetails?.bankDetail,
          storeName: sellerDetails?.storeName,
          productDisplayTitle: productDetails?.product?.pageTitle,
          status: "created",
          workflow: ["created"],
          orderId: order._id,
          internalOrderId:SubOrderExist?.internalOrderId,
          subOrderId: SubOrderExist._id,
          createdAt: new Date().toUTCString(),
          updatedAt: new Date().toUTCString(),
        };
        console.log("PaymentObj", PaymentObj);
        await Payments.insertOne(PaymentObj);
      });
    });
  }
}

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function PaymentStartup(context) {
  try {
    console.log("PaymentStartup");
    const { appEvents, collections } = context;
    const { SubOrders, Payments } = collections;

    appEvents.on(
      "afterOrderStatusUpdate",
      ({ order, itemId, sellerId, status }) => {
        console.log(
          "==================== Generating Order Payment triggered =================="
        );
        if (
          status == completeOrderStatus ||
          status == completeOrderItemStatus ||
          status == "Completed"
        ) {
          console.log("initiating payout generation");
          createPayment(context, order, itemId, sellerId, status);
        }

        const orderItems = order?.shipping[0]?.items;
        // createChildOrders(context, order)
      }
    );
  } catch (err) {
    console.log(err);
  }
}
