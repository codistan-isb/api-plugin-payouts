import Random from "@reactioncommerce/random";
import accounting from "accounting-js";
import calculateSellerDiscount from "./util/calculateSellerDiscount.js";
const completeOrderStatus = "coreOrderWorkflow/completed";
const completeOrderItemStatus = "coreOrderItemWorkflow/completed";

async function createPayment(context, order, itemId, sellerId, status) {
  const { appEvents, collections } = context;
  const { SubOrders, Payments, users, Catalog, Accounts, Products } = collections;
  // console.log("createPayment", itemId, sellerId);
  const PaymentExist = await Payments.findOne({
    itemId: itemId,
    orderId: order._id,
    sellerId: sellerId,
  });

  // console.log("ORDER IN THE PAYMENT CREATION", order)
  if (PaymentExist) {
    console.log("payout already generated");
    return;
  }
  // console.log("generating new payout");
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
        let totalPrice = item.price.amount;
        // let commission = totalPrice * sellerDiscount;
        // let commission = totalPrice * sellerDiscount;
        let pickupCharges = item.pickupCharge;
        // const payoutPrice = totalPrice - pickupCharges;
        // console.log("totalPrice", totalPrice);
        const sellerDetails = await Accounts.findOne({
          userId: sellerId,
        });
        const productDetails = await Catalog.findOne({
          "product._id": item.productId,
        });

        const products = await Products.findOne({
          "_id": item.productId,
        });

        console.log("products", products.referenceId);

        // const hasSpecialTag = productDetails?.product?.tagIds?.includes("sSwaEF8XvAHLx4m4F");
        // if (hasSpecialTag) {
        //   commission = totalPrice * 0.3; // 30% commission if tagId is present
        // }

        const hasSpecialTag = productDetails?.product?.tagIds?.includes("sSwaEF8XvAHLx4m4F");
        const commission = hasSpecialTag ? totalPrice * 0.3 : totalPrice * 0.2; // 30% for special tag, 20% otherwise
        console.log("commission", commission);
        const payoutPrice = totalPrice - pickupCharges - commission;
        // console.log("payoutPrice", payoutPrice);
        // console.log("product", productDetails);
        // console.log("productDetails", productDetails?.product);
        // console.log("sellerDetails", sellerDetails);
        const PaymentObj = {
          _id: Random.id(),
          totalPrice,
          fee: pickupCharges,
          amount: payoutPrice,
          commissionCharges: commission,
          itemId: item._id,
          productId: item.productId,
          productReferenceId: products?.referenceId,
          sellerId: sellerId,
          productTitle: productDetails?.product?.title,
          productSlug: productDetails?.product?.slug,
          sellerBankDetails: sellerDetails?.bankDetail,
          storeName: sellerDetails?.storeName,
          productDisplayTitle: productDetails?.product?.pageTitle,
          status: "created",
          workflow: ["created"],
          referenceId: order?.referenceId,
          orderId: order._id,
          internalOrderId: SubOrderExist?.internalOrderId,
          subOrderId: SubOrderExist._id,
          createdAt: new Date(),
          updatedAt: new Date(),
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
