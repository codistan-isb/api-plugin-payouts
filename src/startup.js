import Random from "@reactioncommerce/random";
import accounting from "accounting-js";



/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function ordersStartup(context) {
  try {
    const { appEvents } = context;


    appEvents.on("afterOrderUpdate", ({ order }) => {
      console.log("==================== Updating sub Order ==================");

      const orderItems = order?.shipping[0]?.items;
      // createChildOrders(context, order)
    });
  }
  catch (err) {
    console.log(err)
  }
}
