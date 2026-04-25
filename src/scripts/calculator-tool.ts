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
  handoff?: {
    href: string;
    label: string;
  };
};

const roots = document.querySelectorAll("[data-calculator-root]");
const searchParams = new URLSearchParams(window.location.search);

const getNumber = (formData: FormData, key: string) => {
  const value = Number(formData.get(key) || 0);
  return Number.isFinite(value) ? value : 0;
};

const getFieldValue = (form: HTMLFormElement, name: string) =>
  form.elements.namedItem(name) instanceof HTMLInputElement ||
  form.elements.namedItem(name) instanceof HTMLSelectElement
    ? form.elements.namedItem(name)
    : null;

const markInvalid = (
  field: HTMLInputElement | HTMLSelectElement | null,
  message?: string
) => {
  if (!field) {
    return;
  }

  field.setAttribute("aria-invalid", "true");
  if (message && field instanceof HTMLInputElement) {
    field.setCustomValidity(message);
  }
};

const clearFieldState = (field: HTMLInputElement | HTMLSelectElement) => {
  field.removeAttribute("aria-invalid");
  if (field instanceof HTMLInputElement) {
    field.setCustomValidity("");
  }
};

const clearValidationState = (form: HTMLFormElement) => {
  Array.from(form.elements).forEach((element) => {
    if (element instanceof HTMLInputElement || element instanceof HTMLSelectElement) {
      clearFieldState(element);
    }
  });
};

const hasPositiveValue = (value: number) => Number.isFinite(value) && value > 0;

const validateToolForm = (tool: string, form: HTMLFormElement, formData: FormData) => {
  clearValidationState(form);

  if (tool === "move-in-cost-calculator") {
    const amountNames = [
      "monthlyRent",
      "securityDeposit",
      "proratedRent",
      "applicationFee",
      "petDeposit",
      "parkingFee",
      "miscFee"
    ];
    const hasAnyAmount = amountNames.some((name) => hasPositiveValue(getNumber(formData, name)));

    if (!hasAnyAmount) {
      markInvalid(getFieldValue(form, "monthlyRent"), "Enter at least one move-in amount.");
      throw new Error("Enter at least one move-in amount before calculating.");
    }
  }

  if (tool === "rent-increase-calculator") {
    const currentRentField = getFieldValue(form, "currentRent");
    const mode = String(formData.get("mode") || "new-rent");
    const currentRent = getNumber(formData, "currentRent");
    const newRent = getNumber(formData, "newRent");
    const percentIncrease = getNumber(formData, "percentIncrease");

    if (!hasPositiveValue(currentRent)) {
      markInvalid(currentRentField, "Enter the current monthly rent.");
      throw new Error("Enter the current monthly rent before calculating an increase.");
    }

    if (mode === "new-rent" && !hasPositiveValue(newRent)) {
      markInvalid(getFieldValue(form, "newRent"), "Enter the new monthly rent.");
      throw new Error("Enter the new monthly rent when using the new-rent mode.");
    }

    if (mode === "percent" && !hasPositiveValue(percentIncrease)) {
      markInvalid(getFieldValue(form, "percentIncrease"), "Enter the percent increase.");
      throw new Error("Enter the percent increase when using percent mode.");
    }
  }

  if (tool === "late-fee-calculator") {
    const rentAmount = getNumber(formData, "rentAmount");
    const feeType = String(formData.get("feeType") || "flat");
    const flatFee = getNumber(formData, "flatFee");
    const percentFee = getNumber(formData, "percentFee");

    if (!hasPositiveValue(rentAmount)) {
      markInvalid(getFieldValue(form, "rentAmount"), "Enter the monthly rent.");
      throw new Error("Enter the monthly rent before calculating a late fee.");
    }

    if (feeType === "flat" && !hasPositiveValue(flatFee)) {
      markInvalid(getFieldValue(form, "flatFee"), "Enter the flat late fee.");
      throw new Error("Enter the flat late fee when using flat-fee mode.");
    }

    if (feeType === "percent" && !hasPositiveValue(percentFee)) {
      markInvalid(getFieldValue(form, "percentFee"), "Enter the percent late fee.");
      throw new Error("Enter the percent late fee when using percent-fee mode.");
    }

    if (feeType === "combined" && !hasPositiveValue(flatFee) && !hasPositiveValue(percentFee)) {
      markInvalid(getFieldValue(form, "flatFee"), "Enter a flat fee, a percent fee, or both.");
      markInvalid(getFieldValue(form, "percentFee"), "Enter a flat fee, a percent fee, or both.");
      throw new Error("Enter at least one late-fee amount when using the combined-fee mode.");
    }
  }
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
      sentence: `Tenant should be charged approximately ${formatCurrency(result.proratedRent)} for ${result.periodLabel}.`,
      rows: [
        { label: "Monthly rent", value: formatCurrency(result.monthlyRent) },
        { label: "Proration method", value: prorationMethod === "banker-30" ? "30-day method" : "Actual days" },
        { label: "Days in divisor", value: String(result.daysInMonth) },
        { label: "Occupied days", value: String(result.occupiedDays) },
        { label: "Daily rent", value: formatCurrency(result.dailyRate) },
        { label: "Prorated rent", value: formatCurrency(result.proratedRent) }
      ],
      copy: [
        "Prorated Rent Summary",
        `Occupancy period: ${result.periodLabel}`,
        `Monthly rent: ${formatCurrency(result.monthlyRent)}`,
        `Proration method: ${prorationMethod === "banker-30" ? "30-day method" : "Actual days in month"}`,
        `Occupied days: ${result.occupiedDays}`,
        `Daily rent: ${formatCurrency(result.dailyRate)}`,
        `Estimated prorated rent: ${formatCurrency(result.proratedRent)}`,
        "",
        "Please confirm the final amount against the lease and proration method in use."
      ].join("\n"),
      note: "Confirm the proration rule against the lease and any local requirements.",
      handoff: {
        href: `/move-in-cost-calculator?proratedRent=${encodeURIComponent(result.proratedRent.toFixed(2))}`,
        label: "Use this prorated rent in Move-In Cost"
      }
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
      sentence: `Tenant should expect to bring approximately ${formatCurrency(result.total)} at move-in.`,
      rows: result.lines.map((line) => ({ label: line.label, value: formatCurrency(line.amount) })),
      copy: [
        "Move-In Cost Summary",
        ...result.lines
          .filter((line) => line.amount > 0)
          .map((line) => `${line.label}: ${formatCurrency(line.amount)}`),
        `Estimated total due: ${formatCurrency(result.total)}`,
        "",
        "Please confirm final charges against the lease or move-in ledger."
      ].join("\n"),
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
      sentence: `The revised monthly rent would be approximately ${formatCurrency(result.updatedRent)}, a change of ${formatCurrency(result.increaseAmount)} (${formatPercent(result.increasePercent)}).`,
      rows: [
        { label: "Current rent", value: formatCurrency(result.currentRent) },
        { label: "Updated rent", value: formatCurrency(result.updatedRent) },
        { label: "Dollar increase", value: formatCurrency(result.increaseAmount) },
        { label: "Percent increase", value: formatPercent(result.increasePercent) }
      ],
      copy: [
        "Rent Increase Summary",
        `Current rent: ${formatCurrency(result.currentRent)}`,
        `Updated rent: ${formatCurrency(result.updatedRent)}`,
        `Dollar change: ${formatCurrency(result.increaseAmount)}`,
        `Percent change: ${formatPercent(result.increasePercent)}`,
        "",
        "Please confirm any notice timing and lease requirements before sending an updated rent amount."
      ].join("\n"),
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
      sentence: `Tenant owes an estimated late fee of ${formatCurrency(result.totalLateFee)}, bringing the approximate total due to ${formatCurrency(result.totalDue)}.`,
      rows: [
        { label: "Unpaid rent", value: formatCurrency(result.rentAmount) },
        { label: "Flat fee", value: formatCurrency(result.flatFee) },
        { label: "Percent-based fee", value: formatCurrency(result.percentFeeAmount) },
        { label: "Total late fee", value: formatCurrency(result.totalLateFee) },
        { label: "Total due", value: formatCurrency(result.totalDue) },
        { label: "Grace days", value: String(result.graceDays) }
      ],
      copy: [
        "Late Fee Summary",
        `Unpaid rent: ${formatCurrency(result.rentAmount)}`,
        `Flat fee: ${formatCurrency(result.flatFee)}`,
        `Percent-based fee: ${formatCurrency(result.percentFeeAmount)}`,
        `Grace period: ${result.graceDays} day${result.graceDays === 1 ? "" : "s"}`,
        `Estimated late fee: ${formatCurrency(result.totalLateFee)}`,
        `Estimated total due: ${formatCurrency(result.totalDue)}`,
        "",
        "Please confirm that the fee structure matches the lease and local requirements."
      ].join("\n"),
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
  const printButton = root.querySelector("[data-print-summary]");
  const handoffLink = root.querySelector("[data-handoff-link]");
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
    !(printButton instanceof HTMLButtonElement) ||
    !(handoffLink instanceof HTMLAnchorElement) ||
    !tool ||
    !calculators[tool]
  ) {
    return;
  }

  if (tool === "move-in-cost-calculator") {
    const proratedRentField = form.querySelector('input[name="proratedRent"]');
    const proratedRent = searchParams.get("proratedRent");

    if (proratedRentField instanceof HTMLInputElement && proratedRent) {
      proratedRentField.value = proratedRent;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.hidden = true;

    try {
      const formData = new FormData(form);
      validateToolForm(tool, form, formData);
      const payload = calculators[tool](formData);
      resultSentence.textContent = payload.sentence;
      resultBreakdown.innerHTML = makeRows(payload.rows);
      summaryNote.textContent = payload.note;
      copiedText = payload.copy;
      resultContent.hidden = false;
      emptyState.hidden = true;
      copyButton.disabled = false;
      printButton.hidden = false;
      if (payload.handoff) {
        handoffLink.href = payload.handoff.href;
        handoffLink.textContent = payload.handoff.label;
        handoffLink.hidden = false;
      } else {
        handoffLink.hidden = true;
      }
      root.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (issue) {
      error.textContent = issue instanceof Error ? issue.message : "Unable to calculate this result.";
      error.hidden = false;
    }
  });

  form.addEventListener("reset", () => {
    clearValidationState(form);
    resultContent.hidden = true;
    emptyState.hidden = false;
    error.hidden = true;
    copyButton.disabled = true;
    printButton.hidden = true;
    handoffLink.hidden = true;
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

  printButton.addEventListener("click", () => {
    window.print();
  });
});
