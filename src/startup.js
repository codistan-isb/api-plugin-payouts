import Random from "@reactioncommerce/random";
import accounting from "accounting-js";
const completeOrderStatus = "coreOrderWorkflow/completed";
const completeOrderItemStatus = "coreOrderItemWorkflow/completed";

async function createPayment(context, order,itemId, sellerId, status) {

  const { appEvents, collections } = context;
  const { SubOrders, Payments } = collections;
  const PaymentExist = await Payments.findOne({itemId:itemId,orderId:order._id,sellerId:sellerId});
  if(PaymentExist){
    console.log("payout already generated");
    return ;
  }
  console.log("generating new payout");
  const SubOrderExist = await SubOrders.findOne({ "parentId": order?._id, itemIds: { $in: [itemId] } })
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
    payOutPendingGroups.map(group=>{
      group.items.map(async(item)=>{

        const totalPrice=item.price.amount;
        const comission=totalPrice*0.2
        const payoutPrice=totalPrice-comission;
        console.log("totalPrice",totalPrice)
        console.log("payoutPrice",payoutPrice)
        const PaymentObj = {
          _id: Random.id(),
          totalPrice,
          fee: comission,
          amount: payoutPrice,
          itemId: item._id,
          productId: item.productId,
          sellerId: sellerId,
          status: "created",
          workflow: ["created"],
          orderId: order._id,
          subOrderId: SubOrderExist._id,
          createdAt: new Date().toUTCString(),
          updatedAt: new Date().toUTCString(),
        };

        await Payments.insertOne(PaymentObj);
        
      })
    
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
    console.log("PaymentStartup")
    const { appEvents, collections } = context;
    const { SubOrders, Payments } = collections;


    appEvents.on("afterOrderStatusUpdate", ({ order, itemId, sellerId, status }) => {
      console.log("==================== Generating Order Payment triggered ==================");
      if (status == completeOrderStatus || status == completeOrderItemStatus) {
        console.log("initiating payout generation");
        createPayment(context,order, itemId, sellerId, status);
      }

      const orderItems = order?.shipping[0]?.items;
      // createChildOrders(context, order)
    });
  }
  catch (err) {
    console.log(err)
  }
}
