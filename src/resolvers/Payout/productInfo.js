export default async function productInfo(parent, args, context, info) {
  const productid = parent.productId;
  const { Catalog } = context.collections;
  const productInfo = await Catalog.findOne({ "product._id": productid });

  console.log("productInfo", productInfo);
  return productInfo;
}
