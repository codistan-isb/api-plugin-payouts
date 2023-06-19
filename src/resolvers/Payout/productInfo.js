export default async function productInfo(parent, args, context, info) {
  const productid = parent.productId;
  const { Catalog } = context.collections;
  const sellerinfos = await Catalog.findOne({ "product._id": productid });

  console.log(productid, "info");
  return sellerinfos;
}
