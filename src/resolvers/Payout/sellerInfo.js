export default async function sellerInfo(parent, args, context, info) {
  const sellerIds = parent.sellerId;
  const { Accounts } = context.collections;
  const sellerinfos = await Accounts.findOne({ _id: sellerIds });

  console.log("SellerInfo >>>>> ", sellerinfos);
  
  // Find the active bank detail from the bankDetail array
  let activeBankDetail = null;
  if (sellerinfos?.bankDetail && Array.isArray(sellerinfos.bankDetail)) {
    activeBankDetail = sellerinfos.bankDetail.find(bank => bank.isActive === true);
  }
  
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
      bankName: activeBankDetail?.bankName || null,
      bankAccountNumber: activeBankDetail?.bankAccountNumber || null,
      bankAccountTitle: activeBankDetail?.bankAccountTitle || null
    },
  };
  return response;
}