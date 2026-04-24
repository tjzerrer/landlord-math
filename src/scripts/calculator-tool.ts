import {
  calculateLateFee,
  calculateMoveInCost,
  calculateProratedRent,
  calculateRentIncrease,
  formatCurrency,
  formatPercent
} from "@/lib/calculators";

type Row = {
  label: string;
  value: string;
};

type Payload = {
  sentence: string;
  rows: Row[];
  copy: string;
  note: string;
};

const roots = document.querySelectorAll("[data-calculator-root]");

const getNumber = (formData: FormData, key: string) => {
  const value = Number(formData.get(key) || 0);
  return Number.isFinite(value) ? value : 0;
};

const makeRows = (rows: Row[]) =>
  rows.map((row) => `<div><dt>${row.label}</dt><dd>${row.value}</dd></div>`).join("");

const calculators: Record<string, (formData: FormData) => Payload> = {
  "prorated-rent-calculator": (formData) => {
    const prorationMethod = String(formData.get("prorationMethod") || "actual-days") as
      | "actual-days"
      | "banker-30";
    const result = calculateProratedRent({
      monthlyRent: getNumber(formData, "monthlyRent"),
      occupancyStart: String(formData.get("occupancyStart") || ""),
      occupancyEnd: String(formData.get("occupancyEnd") || ""),
      prorationMethod
    });

    return {
      sentence: `Estimated prorated rent for ${result.periodLabel} is ${formatCurrency(result.proratedRent)}.`,
      rows: [
        { label: "Monthly rent", value: formatCurrency(result.monthlyRent) },
        { label: "Proration method", value: prorationMethod === "banker-30" ? "30-day method" : "Actual days" },
        { label: "Days in divisor", value: String(result.daysInMonth) },
        { label: "Occupied days", value: String(result.occupiedDays) },
        { label: "Daily rent", value: formatCurrency(result.dailyRate) },
        { label: "Prorated rent", value: formatCurrency(result.proratedRent) }
      ],
      copy: `Prorated rent summary: ${result.periodLabel}, ${result.occupiedDays} occupied days, daily rate ${formatCurrency(result.dailyRate)}, estimated prorated rent ${formatCurrency(result.proratedRent)}.`,
      note: "Confirm the proration rule against the lease and any local requirements."
    };
  },
  "move-in-cost-calculator": (formData) => {
    const result = calculateMoveInCost({
      monthlyRent: getNumber(formData, "monthlyRent"),
      securityDeposit: getNumber(formData, "securityDeposit"),
      proratedRent: getNumber(formData, "proratedRent"),
      applicationFee: getNumber(formData, "applicationFee"),
      petDeposit: getNumber(formData, "petDeposit"),
      parkingFee: getNumber(formData, "parkingFee"),
      miscFee: getNumber(formData, "miscFee")
    });

    return {
      sentence: `Estimated total move-in cash due is ${formatCurrency(result.total)}.`,
      rows: result.lines.map((line) => ({ label: line.label, value: formatCurrency(line.amount) })),
      copy: `Move-in cost summary: total due ${formatCurrency(result.total)}. ${result.lines
        .filter((line) => line.amount > 0)
        .map((line) => `${line.label} ${formatCurrency(line.amount)}`)
        .join(", ")}.`,
      note: "Use this as a planning summary and confirm final charges on the lease ledger."
    };
  },
  "rent-increase-calculator": (formData) => {
    const mode = String(formData.get("mode") || "new-rent") as "new-rent" | "percent";
    const result = calculateRentIncrease({
      currentRent: getNumber(formData, "currentRent"),
      mode,
      newRent: getNumber(formData, "newRent"),
      percentIncrease: getNumber(formData, "percentIncrease")
    });

    return {
      sentence: `The updated monthly rent is ${formatCurrency(result.updatedRent)}, which is a change of ${formatCurrency(result.increaseAmount)} (${formatPercent(result.increasePercent)}).`,
      rows: [
        { label: "Current rent", value: formatCurrency(result.currentRent) },
        { label: "Updated rent", value: formatCurrency(result.updatedRent) },
        { label: "Dollar increase", value: formatCurrency(result.increaseAmount) },
        { label: "Percent increase", value: formatPercent(result.increasePercent) }
      ],
      copy: `Rent increase summary: current rent ${formatCurrency(result.currentRent)}, updated rent ${formatCurrency(result.updatedRent)}, increase ${formatCurrency(result.increaseAmount)} or ${formatPercent(result.increasePercent)}.`,
      note: "This tool shows the math only. Check notice periods and any local increase limits separately."
    };
  },
  "late-fee-calculator": (formData) => {
    const feeType = String(formData.get("feeType") || "flat") as "flat" | "percent" | "combined";
    const result = calculateLateFee({
      rentAmount: getNumber(formData, "rentAmount"),
      feeType,
      flatFee: getNumber(formData, "flatFee"),
      percentFee: getNumber(formData, "percentFee"),
      graceDays: getNumber(formData, "graceDays")
    });

    return {
      sentence: `Estimated late fee is ${formatCurrency(result.totalLateFee)}, bringing the total amount due to ${formatCurrency(result.totalDue)}.`,
      rows: [
        { label: "Unpaid rent", value: formatCurrency(result.rentAmount) },
        { label: "Flat fee", value: formatCurrency(result.flatFee) },
        { label: "Percent-based fee", value: formatCurrency(result.percentFeeAmount) },
        { label: "Total late fee", value: formatCurrency(result.totalLateFee) },
        { label: "Total due", value: formatCurrency(result.totalDue) },
        { label: "Grace days", value: String(result.graceDays) }
      ],
      copy: `Late fee summary: unpaid rent ${formatCurrency(result.rentAmount)}, total late fee ${formatCurrency(result.totalLateFee)}, total due ${formatCurrency(result.totalDue)}, grace period ${result.graceDays} days.`,
      note: "Make sure the fee structure and grace period match the lease and local law."
    };
  }
};

roots.forEach((root) => {
  const form = root.querySelector("[data-calculator-form]");
  const error = root.querySelector("[data-form-error]");
  const resultContent = root.querySelector("[data-result-content]");
  const resultSentence = root.querySelector("[data-result-sentence]");
  const resultBreakdown = root.querySelector("[data-result-breakdown]");
  const summaryNote = root.querySelector("[data-summary-note]");
  const emptyState = root.querySelector(".result-empty");
  const copyButton = root.querySelector("[data-copy-summary]");
  const tool = root.getAttribute("data-tool");
  let copiedText = "";

  if (
    !(form instanceof HTMLFormElement) ||
    !(error instanceof HTMLElement) ||
    !(resultContent instanceof HTMLElement) ||
    !(resultSentence instanceof HTMLElement) ||
    !(resultBreakdown instanceof HTMLElement) ||
    !(summaryNote instanceof HTMLElement) ||
    !(emptyState instanceof HTMLElement) ||
    !(copyButton instanceof HTMLButtonElement) ||
    !tool ||
    !calculators[tool]
  ) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.hidden = true;

    try {
      const payload = calculators[tool](new FormData(form));
      resultSentence.textContent = payload.sentence;
      resultBreakdown.innerHTML = makeRows(payload.rows);
      summaryNote.textContent = payload.note;
      copiedText = payload.copy;
      resultContent.hidden = false;
      emptyState.hidden = true;
      copyButton.disabled = false;
      root.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (issue) {
      error.textContent = issue instanceof Error ? issue.message : "Unable to calculate this result.";
      error.hidden = false;
    }
  });

  form.addEventListener("reset", () => {
    resultContent.hidden = true;
    emptyState.hidden = false;
    error.hidden = true;
    copyButton.disabled = true;
    copiedText = "";
  });

  copyButton.addEventListener("click", async () => {
    if (!copiedText) {
      return;
    }

    try {
      await navigator.clipboard.writeText(copiedText);
      copyButton.textContent = "Copied";
      window.setTimeout(() => {
        copyButton.textContent = "Copy summary";
      }, 1500);
    } catch {
      copyButton.textContent = "Copy failed";
      window.setTimeout(() => {
        copyButton.textContent = "Copy summary";
      }, 1500);
    }
  });
});
