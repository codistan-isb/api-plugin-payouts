import ReactionError from "@reactioncommerce/reaction-error";
export default async function updatePaymentStatus(
  parent,
  { _id, referenceNumber, reason, status },
  context
) {
     if (!context.user) {
       throw new ReactionError("access-denied", "Access Denied");
     }
  const { collections } = context;
  const { Payments } = collections;

  let payment = await Payments.findOne({ _id });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (status === "paid") {
    if (!referenceNumber) {
      throw new Error("Reference number is required for paid status.");
    }
    payment.referenceNumber = referenceNumber;
  } else {
    if (referenceNumber) {
      throw new Error("To add a reference number, the status should be paid.");
    }
  }

  payment.reason = reason || payment.reason;
  payment.status = status;

  if (!status) {
    throw new Error("Please add a status.");
  }

  const updatedWorkflow = payment.workflow.concat(
    `corePaymentWorkflow/${status.toLowerCase()}`
  );

  await Payments.updateOne(
    { _id },
    {
      $set: {
        referenceNumber: referenceNumber || payment.referenceNumber,
        reason: reason || payment.reason,
        status: status,
        workflow: updatedWorkflow,
      },
    }
  );

  payment.workflow = updatedWorkflow;

  return payment;
}
