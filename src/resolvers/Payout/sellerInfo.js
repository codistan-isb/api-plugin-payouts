export default async function sellerInfo(parent, args, context, info) {
  const sellerIds = parent.sellerId;
  const { Accounts } = context.collections;
  const sellerinfos = await Accounts.findOne({ _id: sellerIds });
  console.log("sellerinfos",sellerinfos);
  let response={
    phone:sellerinfos?.phoneNumber?sellerinfos?.phoneNumber:sellerinfos?.contactNumber?sellerinfos?.contactNumber:sellerinfos?.billing.phone,
    name:sellerinfos?.name?sellerinfos?.name:sellerinfos?.profile?.name?sellerinfos?.profile?.name:sellerinfos?.storeName,
    accountDetails:{bankName:sellerinfos?.bankDetail?.bankName,bankAccountNumber:sellerinfos?.bankDetail?.bankAccountNumber}
  }
  return response;
}
