import pkg from "../package.json";
import i18n from "./i18n/index.js";
import queries from "./queries/index.js";
import resolvers from "./resolvers/index.js";
import schemas from "./schemas/index.js";

import startup from "./startup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "payouts",
    name: "payouts",
    version: pkg.version,
    i18n,
    collections: {
      Payments: {
        name: "Payments",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ accountId: 1, shopId: 1, sellerId: 1 }],
          [{ createdAt: -1 }, { name: "c2_createdAt" }],
          [{ email: 1 }, { name: "c2_email" }],
          [{ shopId: 1 }, { name: "c2_shopId" }],
          [{ "workflow.status": 1 }, { name: "c2_workflow.status" }],
        ],
      },
    },
    functionsByType: {
      // getDataForOrderEmail: [getDataForOrderEmail],
      // preStartup: [preStartup],
      startup: [startup],
    },
    graphQL: {
      resolvers,
      schemas,
    },
    // mutations,
    queries,
    // policies,
    // simpleSchemas: {
    //   Order,
    //   OrderFulfillmentGroup,
    //   OrderItem
    // }
  });
}
