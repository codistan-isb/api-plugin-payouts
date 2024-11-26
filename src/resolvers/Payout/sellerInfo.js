export default async function sellerInfo(parent, args, context, info) {
  const sellerIds = parent.sellerId;
  const { Accounts } = context.collections;
  const sellerinfos = await Accounts.findOne({ _id: sellerIds });

  let response = {
    phone: sellerinfos?.phoneNumber
      ? sellerinfos?.phoneNumber
      : sellerinfos?.contactNumber
        ? sellerinfos?.contactNumber
        : sellerinfos?.billing?.phone
          ? sellerinfos?.billing?.phone
          : null,
    name: sellerinfos?.name
      ? sellerinfos?.name
      : sellerinfos?.profile?.name
        ? sellerinfos?.profile?.name
        : sellerinfos?.storeName,
    storeName: sellerinfos?.storeName,
    accountDetails: {
      bankName: sellerinfos?.bankDetail?.bankName,
      bankAccountNumber: sellerinfos?.bankDetail?.bankAccountNumber,
      bankAccountTitle: sellerinfos?.bankDetail?.bankAccountTitle
    },
  };
  return response;
}