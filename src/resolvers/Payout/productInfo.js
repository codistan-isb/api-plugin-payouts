export default async function productInfo(parent, args, context, info) {
  const productid = parent.productId;
  const { Products } = context.collections;
  const productInfo = await Products.findOne({ "_id": productid });

  console.log("productInfo", productInfo);
  return productInfo;
}
