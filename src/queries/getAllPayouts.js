import ReactionError from "@reactioncommerce/reaction-error";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

export default async function getAllPayouts(parnet, args, context) {
  const { collections } = context;
  const { Payments } = collections;
  //   console.log("called wutnhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh", Payments);
  return Payments.find();
}
