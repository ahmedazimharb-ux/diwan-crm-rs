import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      totalPrice = 5000000,
      downPaymentPercent = 10,
      durationYears = 3,
      installmentFrequency = "Quarterly", // Monthly, Quarterly, Semi-Annually, Annually
      discountPercent = 10,
      maintenancePercent = 7,
      startDate = new Date().toISOString().split("T")[0],
    } = body;

    const basePriceNum = parseFloat(totalPrice.toString());
    const discPctNum = parseFloat(discountPercent.toString());
    const discountAmt = basePriceNum * (discPctNum / 100);
    const netContractValue = basePriceNum - discountAmt;

    const dpPctNum = parseFloat(downPaymentPercent.toString());
    const downPaymentAmt = netContractValue * (dpPctNum / 100);
    const remainingBalance = netContractValue - downPaymentAmt;

    const maintenanceAmt = netContractValue * (parseFloat(maintenancePercent.toString()) / 100);

    // Calculate installments count based on frequency and duration
    let installmentsPerYear = 4;
    let monthsStep = 3;
    if (installmentFrequency === "Monthly") {
      installmentsPerYear = 12;
      monthsStep = 1;
    } else if (installmentFrequency === "Quarterly") {
      installmentsPerYear = 4;
      monthsStep = 3;
    } else if (installmentFrequency === "Semi-Annually") {
      installmentsPerYear = 2;
      monthsStep = 6;
    } else if (installmentFrequency === "Annually") {
      installmentsPerYear = 1;
      monthsStep = 12;
    }

    const totalInstallmentsCount = Math.max(1, Math.round(parseFloat(durationYears.toString()) * installmentsPerYear));
    const installmentAmt = remainingBalance > 0 && totalInstallmentsCount > 0 ? remainingBalance / totalInstallmentsCount : 0;

    // Generate schedule dates
    const schedule = [];
    const baseDate = new Date(startDate);

    // Down payment record
    schedule.push({
      number: 0,
      type: "Down Payment",
      dueDate: startDate,
      amount: Math.round(downPaymentAmt),
      percentage: dpPctNum,
    });

    for (let i = 1; i <= totalInstallmentsCount; i++) {
      const instDate = new Date(baseDate);
      instDate.setMonth(instDate.getMonth() + i * monthsStep);
      const dateStr = instDate.toISOString().split("T")[0];

      schedule.push({
        number: i,
        type: `Installment #${i}`,
        dueDate: dateStr,
        amount: Math.round(installmentAmt),
        percentage: Number(((installmentAmt / netContractValue) * 100).toFixed(2)),
      });
    }

    // Delivery / Maintenance Deposit Record
    const deliveryDate = new Date(baseDate);
    deliveryDate.setMonth(deliveryDate.getMonth() + 36);

    schedule.push({
      number: totalInstallmentsCount + 1,
      type: "Maintenance Deposit (7%)",
      dueDate: deliveryDate.toISOString().split("T")[0],
      amount: Math.round(maintenanceAmt),
      percentage: parseFloat(maintenancePercent.toString()),
    });

    return NextResponse.json({
      success: true,
      calculation: {
        basePrice: basePriceNum,
        discountPercent: discPctNum,
        discountAmount: discountAmt,
        netContractValue,
        downPaymentPercent: dpPctNum,
        downPaymentAmount: downPaymentAmt,
        remainingBalance,
        totalInstallmentsCount,
        installmentFrequency,
        installmentAmount: Math.round(installmentAmt),
        maintenanceDepositAmount: Math.round(maintenanceAmt),
        firstPaymentDate: startDate,
        finalPaymentDate: schedule[schedule.length - 2]?.dueDate || startDate,
      },
      schedule,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
