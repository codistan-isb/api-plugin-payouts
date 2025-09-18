// import _ from "lodash";
// import ReactionError from "@reactioncommerce/reaction-error";

// /**
//  * @name orders
//  * @method
//  * @memberof Order/NoMeteorQueries
//  * @summary Query the Orders collection for orders and (optionally) shopIds
//  * @param {Object} context - an object containing the per-request state
//  * @param {Object} params - request parameters
//  * @param {String} params.accountId - Account ID to search orders for
//  * @param {Object}  params.filters - Filters to apply to a list of orders
//  * @param {Array.<String>} params.shopIds - Shop IDs for the shops that owns the orders
//  * @returns {Promise<Object>|undefined} - An Array of Order documents, if found
//  */
// export default async function orders(context, { filters, shopIds } = {}) {
//   const { collections } = context;
//   const { Orders } = collections;

//   const query = {};
//   let createdAtFilter = {};
//   let fulfillmentStatusFilter = {};
//   let paymentStatusFilter = {};
//   let searchFieldFilter = {};
//   let statusFilter = {};

//   // Add a date range filter if provided, the filter will be
//   // applied to the createdAt database field.
//   if (filters && filters.createdAt) {
//     const { createdAt } = filters;
//     // Both fields are optional
//     const gteProp = createdAt.gte ? { $gte: createdAt.gte } : {};
//     const lteProp = createdAt.lte ? { $lte: createdAt.lte } : {};
//     createdAtFilter = {
//       createdAt: {
//         ...gteProp,
//         ...lteProp
//       }
//     };
//   }

//   // Validate user has permission to view orders for all shopIds
//   if (!shopIds) throw new ReactionError("invalid-param", "You must provide ShopId(s)");
//   for (const shopId of shopIds) {
//     await context.validatePermissions("reaction:legacy:orders", "read", { shopId }); // eslint-disable-line no-await-in-loop
//   }

//   query.shopId = { $in: shopIds };

//   // Add fulfillment status if provided
//   if (filters && filters.fulfillmentStatus) {
//     const fulfillmentStatuses = filters.fulfillmentStatus.map((status) => {
//       const prefix = status === "new" ? "" : "coreOrderWorkflow/";
//       return `${prefix}${status}`;
//     });

//     fulfillmentStatusFilter = {
//       "shipping.workflow.status": { $in: fulfillmentStatuses }
//     };
//   }

//   // Add payment status filters if provided
//   if (filters && filters.paymentStatus) {
//     paymentStatusFilter = {
//       "payments.status": { $in: filters.paymentStatus }
//     };
//   }

//   // Add order status filter if provided
//   if (filters && filters.status) {
//     const prefix = filters.status === "new" ? "" : "coreOrderWorkflow/";
//     statusFilter = {
//       "workflow.status": { $eq: `${prefix}${filters.status}` }
//     };
//   }

//   // Use `filters` to filters out results on the server
//   if (filters && filters.searchField) {
//     const { searchField } = filters;
//     const regexMatch = { $regex: _.escapeRegExp(searchField), $options: "i" };
//     searchFieldFilter = {
//       $or: [
//         // Exact matches
//         { _id: searchField }, // exact match the order id
//         { referenceId: searchField }, // exact match the reference id
//         { email: searchField }, // exact match the email

//         // Regex match names as they include the whole name in one field
//         { "payments.address.fullName": regexMatch },
//         { "shipping.address.fullName": regexMatch },

//         // Regex match for payer phone number
//         { "payments.address.phone": regexMatch }
//       ]
//     };
//   }

//   // Build the final query
//   query.$and = [{
//     ...createdAtFilter,
//     ...fulfillmentStatusFilter,
//     ...paymentStatusFilter,
//     ...searchFieldFilter,
//     ...statusFilter
//   }];

//   return Orders.find(query);
// }

import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * Custom-paginated Orders aggregation with dynamic filters.
 * Computes `isPaid: true` when any payment method is "JAZZCASH".
 *
 * @param {Object} context
 * @param {Object} params
 * @param {Object} params.filters
 * @param {String[]} params.shopIds
 * @param {number} params.first   - page size
 * @param {number} params.offset  - offset for pagination
 * @returns {Promise<{ nodes: any[], totalCount: number }>}
 */
export default async function orders(
  context,
  { filters, shopIds, first = 10, offset = 0 } = {}
) {
  const { collections } = context;
  const { Orders } = collections;

  const query = {};
  query.$and = [];

  // Date range
  if (filters?.createdAt) {
    const { createdAt } = filters;
    const gteProp = createdAt.gte ? { $gte: createdAt.gte } : {};
    const lteProp = createdAt.lte ? { $lte: createdAt.lte } : {};
    query.$and.push({ createdAt: { ...gteProp, ...lteProp } });
  }

  // Permissions
  if (!shopIds)
    throw new ReactionError("invalid-param", "You must provide ShopId(s)");
  for (const shopId of shopIds) {
    // eslint-disable-next-line no-await-in-loop
    await context.validatePermissions("reaction:legacy:orders", "read", {
      shopId,
    });
  }
  query.shopId = { $in: shopIds };

  // Fulfillment status
  if (filters?.fulfillmentStatus) {
    const fulfillmentStatuses = filters.fulfillmentStatus.map((status) => {
      const prefix = status === "new" ? "" : "coreOrderWorkflow/";
      return `${prefix}${status}`;
    });
    query.$and.push({
      "shipping.workflow.status": { $in: fulfillmentStatuses },
    });
  }

  // Payment status
  if (filters?.paymentStatus) {
    query.$and.push({ "payments.status": { $in: filters.paymentStatus } });
  }

  // Order workflow status
  if (filters?.status) {
    const prefix = filters.status === "new" ? "" : "coreOrderWorkflow/";
    query.$and.push({
      "workflow.status": { $eq: `${prefix}${filters.status}` },
    });
  }

  // Seller filter
  if (filters?.sellerId) {
    query.$and.push({ "shipping.items.sellerId": filters.sellerId });
  }

  // Search field
  if (filters?.searchField) {
    const { searchField } = filters;
    const regexMatch = { $regex: _.escapeRegExp(searchField), $options: "i" };
    query.$and.push({
      $or: [
        { _id: searchField },
        { referenceId: searchField },
        { email: searchField },
        { "discounts.code": searchField },
        { "shipping.address.phone": searchField },
        { "payments.address.fullName": regexMatch },
        { "shipping.address.fullName": regexMatch },
        { "payments.address.phone": regexMatch },
      ],
    });
  }

  if (!query.$and.length) delete query.$and;

  const pipeline = [
    { $match: query },
    { $sort: { createdAt: -1, _id: -1 } },

    {
      $addFields: {
        isPaid: {
          $or: [
            {
              $eq: [
                { $toUpper: { $ifNull: ["$paymentMethod", ""] } },
                "JAZZCASH",
              ],
            },
            {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: { $ifNull: ["$payments", []] },
                      as: "p",
                      cond: {
                        $or: [
                          {
                            $eq: [
                              { $toUpper: { $ifNull: ["$$p.method", ""] } },
                              "JAZZCASH",
                            ],
                          },
                          {
                            $eq: [
                              {
                                $toUpper: {
                                  $ifNull: ["$$p.paymentMethod", ""],
                                },
                              },
                              "JAZZCASH",
                            ],
                          },
                        ],
                      },
                    },
                  },
                },
                0,
              ],
            },
          ],
        },
      },
    },

    {
      $facet: {
        total: [{ $count: "value" }],
        nodes: [{ $skip: Math.max(0, offset) }, { $limit: Math.max(0, first) }],
      },
    },
  ];

  const [res] = await Orders.aggregate(pipeline, {
    allowDiskUse: true,
  }).toArray();
  const totalCount = res?.total?.[0]?.value ?? 0;
  const nodes = res?.nodes ?? [];

  return { nodes, totalCount };
}
