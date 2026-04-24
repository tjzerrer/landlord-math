import type {
  LateFeeInputs,
  LateFeeResult,
  MoveInInputs,
  MoveInResult,
  ProrationInputs,
  ProrationResult,
  RentIncreaseInputs,
  RentIncreaseResult
} from "@/lib/types";

const cents = (value: number) => Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;

export function calculateProratedRent(inputs: ProrationInputs): ProrationResult {
  const start = new Date(`${inputs.occupancyStart}T00:00:00`);
  const end = new Date(`${inputs.occupancyEnd}T00:00:00`);

  if (Number.isNaN(start.valueOf()) || Number.isNaN(end.valueOf())) {
    throw new Error("Enter a valid occupancy range.");
  }

  if (start > end) {
    throw new Error("Start date must be on or before end date.");
  }

  if (start.getFullYear() !== end.getFullYear() || start.getMonth() !== end.getMonth()) {
    throw new Error("Use dates from the same calendar month for this calculator.");
  }

  const daysInMonth =
    inputs.prorationMethod === "banker-30"
      ? 30
      : new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const occupiedDays = Math.floor((end.valueOf() - start.valueOf()) / 86_400_000) + 1;
  const dailyRate = cents(inputs.monthlyRent / daysInMonth);
  const proratedRent = cents(dailyRate * occupiedDays);
  const periodLabel = `${start.toLocaleString("en-US", {
    month: "short"
  })} ${start.getDate()}-${end.getDate()}, ${start.getFullYear()}`;

  return {
    monthlyRent: cents(inputs.monthlyRent),
    daysInMonth,
    occupiedDays,
    dailyRate,
    proratedRent,
    periodLabel
  };
}

export function calculateMoveInCost(inputs: MoveInInputs): MoveInResult {
  const lines = [
    { label: "First month rent", amount: cents(inputs.monthlyRent) },
    { label: "Security deposit", amount: cents(inputs.securityDeposit) },
    { label: "Prorated rent", amount: cents(inputs.proratedRent) },
    { label: "Application fee", amount: cents(inputs.applicationFee) },
    { label: "Pet deposit", amount: cents(inputs.petDeposit) },
    { label: "Parking fee", amount: cents(inputs.parkingFee) },
    { label: "Other fees", amount: cents(inputs.miscFee) }
  ];

  return {
    total: cents(lines.reduce((sum, line) => sum + line.amount, 0)),
    lines
  };
}

export function calculateRentIncrease(inputs: RentIncreaseInputs): RentIncreaseResult {
  const currentRent = cents(inputs.currentRent);
  const updatedRent =
    inputs.mode === "percent"
      ? cents(currentRent * (1 + inputs.percentIncrease / 100))
      : cents(inputs.newRent);
  const increaseAmount = cents(updatedRent - currentRent);
  const increasePercent = currentRent === 0 ? 0 : cents((increaseAmount / currentRent) * 100);

  return {
    currentRent,
    updatedRent,
    increaseAmount,
    increasePercent
  };
}

export function calculateLateFee(inputs: LateFeeInputs): LateFeeResult {
  const rentAmount = cents(inputs.rentAmount);
  const flatFee = inputs.feeType === "percent" ? 0 : cents(inputs.flatFee);
  const percentFeeAmount =
    inputs.feeType === "flat" ? 0 : cents(rentAmount * (inputs.percentFee / 100));
  const totalLateFee = cents(flatFee + percentFeeAmount);

  return {
    rentAmount,
    flatFee,
    percentFeeAmount,
    totalLateFee,
    totalDue: cents(rentAmount + totalLateFee),
    graceDays: Math.max(0, Math.trunc(inputs.graceDays))
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(cents(value));
}

export function formatPercent(value: number): string {
  return `${cents(value).toFixed(2)}%`;
}
