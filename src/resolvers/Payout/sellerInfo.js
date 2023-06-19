export default async function sellerInfo(parent, args, context, info) {
  const sellerIds = parent.sellerId;
  const { Accounts } = context.collections;
  const sellerinfos = await Accounts.findOne({ _id: sellerIds });
 return sellerinfos;
}
