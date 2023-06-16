export default async function updatePaymentStatus(
  parent,
  { _id, referenceNumber, reason, status },
  context
) {
  const { collections } = context;
  const { Payments } = collections;

  // console.log(_id, status, "new");
  let payment = await Payments.findOne({ _id });

  if (!payment) {
    throw new Error("Payment not found");
  }
if (status === "paid") {
  if (referenceNumber) {
    payment.referenceNumber = referenceNumber;
  } else {
    throw new Error("Reference number is required for paid status.");
  }
} else {
  if (!referenceNumber ===!"paid") {
    throw new Error("to add referance number status should be paid");
  } // No need to throw an error if referenceNumber is not provided for non-paid status
}
  payment.reason = reason || payment.reason;
  payment.status = status;

 if(status){
   payment.workflow.push(`corePaymentWorkflow/${status.toLowerCase()}`);
 }
 else{
  if(!status){
       throw new Error("must please add status");
  }

 }

  await Payments.updateOne(
    { _id },
    {
      $set: {
        referenceNumber: referenceNumber || payment.referenceNumber,
        reason: reason || payment.reason,
        status: status,
        workflow: payment.workflow.concat(
          `corePaymentWorkflow/$${status.toLowerCase()}`
        ),
      },
    }
  );

  return payment;
}
