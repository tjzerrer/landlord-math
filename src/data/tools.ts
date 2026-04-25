import type { ToolConfig, ToolSlug } from "@/lib/types";

export const tools: Record<ToolSlug, ToolConfig> = {
  "prorated-rent-calculator": {
    slug: "prorated-rent-calculator",
    name: "Prorated Rent Calculator",
    shortName: "Prorated Rent",
    description: "Estimate partial-month rent with clear day counts and a transparent calculation trail.",
    intro:
      "Estimate what is due for a partial month.",
    metaTitle: "Prorated Rent Calculator | Landlord Math Toolkit",
    metaDescription:
      "Calculate prorated rent for a partial month with day counts, daily rent, assumptions, and a copyable summary.",
    sections: [
      {
        title: "Lease Dates",
        description: "Enter the portion of the month the tenant will occupy the unit.",
        fields: [
          {
            name: "occupancyStart",
            label: "Occupancy start date",
            type: "date",
            required: true
          },
          {
            name: "occupancyEnd",
            label: "Occupancy end date",
            type: "date",
            required: true
          }
        ]
      },
      {
        title: "Monthly Rent",
        description: "Choose the monthly rent and proration method you want to use.",
        fields: [
          {
            name: "monthlyRent",
            label: "Monthly rent",
            type: "currency",
            placeholder: "1800",
            min: 0,
            step: 0.01,
            required: true
          },
          {
            name: "prorationMethod",
            label: "Proration method",
            type: "select",
            help: "Actual days uses the real number of days in the month. The 30-day method uses a fixed 30-day divisor.",
            required: true,
            options: [
              { label: "Actual days in month", value: "actual-days" },
              { label: "30-day banker method", value: "banker-30" }
            ]
          }
        ]
      }
    ],
    assumptions: [
      "This calculator assumes the rent period stays within one calendar month.",
      "Occupied days are counted inclusively from the start date through the end date.",
      "Lease language and local law may require a different proration convention."
    ],
    methodology: [
      "Find the daily rent by dividing the monthly rent by the number of days in the month or by 30 for banker-style proration.",
      "Count the occupied days in the partial month.",
      "Multiply the daily rent by occupied days to estimate prorated rent."
    ],
    faqs: [
      {
        question: "Should I use actual days or a 30-day method?",
        answer:
          "Use whichever method matches the lease or your house rules. If your lease is silent, use the same method consistently and confirm it aligns with local requirements."
      },
      {
        question: "Does this calculator work for move-outs too?",
        answer:
          "Yes. Enter the partial occupancy dates for the final month and the calculator will estimate the prorated amount for that date range."
      },
      {
        question: "Why does the result differ by month?",
        answer:
          "The actual-days method changes with the number of days in the month, so February and 31-day months produce different daily rates."
      }
    ],
    example: {
      title: "Example",
      summary: "A unit rents for $1,860 and the tenant moves in on June 12 with occupancy through June 30.",
      steps: [
        "June has 30 days, so the daily rate is $1,860 / 30 = $62.00.",
        "Occupancy from June 12 through June 30 is 19 days.",
        "Prorated rent is 19 x $62.00 = $1,178.00."
      ]
    },
    relatedTools: ["move-in-cost-calculator", "rent-increase-calculator", "late-fee-calculator"]
  },
  "move-in-cost-calculator": {
    slug: "move-in-cost-calculator",
    name: "Move-In Cost Calculator",
    shortName: "Move-In Cost",
    description: "Bundle first-month rent, deposits, and fees into one copy-ready move-in total.",
    intro:
      "Estimate the total cash due at move-in.",
    metaTitle: "Move-In Cost Calculator | Landlord Math Toolkit",
    metaDescription:
      "Estimate total move-in costs with first month rent, prorated rent, deposits, fees, and a copyable summary.",
    sections: [
      {
        title: "Rent and Deposit",
        description: "Start with the primary amounts listed in the lease offer.",
        fields: [
          {
            name: "monthlyRent",
            label: "First month rent",
            type: "currency",
            placeholder: "1800",
            min: 0,
            step: 0.01
          },
          {
            name: "securityDeposit",
            label: "Security deposit",
            type: "currency",
            placeholder: "1800",
            min: 0,
            step: 0.01
          },
          {
            name: "proratedRent",
            label: "Prorated rent",
            type: "currency",
            placeholder: "0",
            min: 0,
            step: 0.01
          }
        ]
      },
      {
        title: "Fees",
        description: "Add common up-front fees to build a complete move-in estimate.",
        fields: [
          {
            name: "applicationFee",
            label: "Application fee",
            type: "currency",
            placeholder: "0",
            min: 0,
            step: 0.01
          },
          {
            name: "petDeposit",
            label: "Pet deposit",
            type: "currency",
            placeholder: "0",
            min: 0,
            step: 0.01
          },
          {
            name: "parkingFee",
            label: "Parking fee",
            type: "currency",
            placeholder: "0",
            min: 0,
            step: 0.01
          },
          {
            name: "miscFee",
            label: "Other fees",
            type: "currency",
            placeholder: "0",
            min: 0,
            step: 0.01,
            help: "Utilities, keys, admin charges, and local fees may need to be added separately."
          }
        ]
      }
    ],
    assumptions: [
      "This estimate does not replace the lease or move-in ledger.",
      "Taxes, utility transfers, or one-off local fees may apply separately.",
      "Enter zero for any line items that do not apply."
    ],
    methodology: [
      "Add first month rent, deposits, prorated rent, and each fee line item.",
      "Show each amount separately so the total can be copied into a quote or tenant message.",
      "Use the result as a planning figure and confirm the final ledger before collection."
    ],
    faqs: [
      {
        question: "Should I include prorated rent and full rent together?",
        answer:
          "Only if both are due at move-in under the lease terms. Some landlords collect just prorated rent first, while others collect prorated rent plus the next full month."
      },
      {
        question: "Can I leave unused fields blank?",
        answer: "Yes. Blank or zero-value fields are treated as zero in the estimate."
      },
      {
        question: "Does this include recurring charges?",
        answer:
          "No. This is designed for up-front move-in cash due, not future monthly recurring charges."
      }
    ],
    example: {
      title: "Example",
      summary: "A tenant owes $1,700 for first month rent, a $1,700 deposit, $620 prorated rent, and $150 in other fees.",
      steps: [
        "Add rent and deposit: $1,700 + $1,700 = $3,400.",
        "Add prorated rent: $3,400 + $620 = $4,020.",
        "Add fees: $4,020 + $150 = $4,170 total due at move-in."
      ]
    },
    relatedTools: ["prorated-rent-calculator", "rent-increase-calculator", "late-fee-calculator"]
  },
  "rent-increase-calculator": {
    slug: "rent-increase-calculator",
    name: "Rent Increase Calculator",
    shortName: "Rent Increase",
    description: "Compare current rent to a proposed increase in dollars or percent.",
    intro:
      "Compare the current rent to a proposed increase.",
    metaTitle: "Rent Increase Calculator | Landlord Math Toolkit",
    metaDescription:
      "Calculate a rent increase in dollars or percent and review the updated monthly rent with a clear summary.",
    sections: [
      {
        title: "Current Rent",
        description: "Enter the starting monthly rent before the increase.",
        fields: [
          {
            name: "currentRent",
            label: "Current monthly rent",
            type: "currency",
            placeholder: "1800",
            min: 0,
            step: 0.01,
            required: true
          }
        ]
      },
      {
        title: "Increase Method",
        description: "Choose whether you want to work from a target rent or a percentage.",
        fields: [
          {
            name: "mode",
            label: "Increase mode",
            type: "select",
            options: [
              { label: "Enter new rent", value: "new-rent" },
              { label: "Enter percent increase", value: "percent" }
            ]
          },
          {
            name: "newRent",
            label: "New monthly rent",
            type: "currency",
            placeholder: "1895",
            min: 0,
            step: 0.01
          },
          {
            name: "percentIncrease",
            label: "Percent increase",
            type: "number",
            placeholder: "5",
            min: 0,
            step: 0.01,
            help: "If you enter a lower new rent instead, the result can reflect a rent decrease."
          }
        ]
      }
    ],
    assumptions: [
      "This calculator does not check local notice periods or rent control limits.",
      "Results show the math only and should be paired with your lease and local rules.",
      "If you enter both a new rent and a percent, the selected mode determines which one is used."
    ],
    methodology: [
      "If the new-rent mode is selected, subtract the current rent from the new rent to find the dollar increase.",
      "If percent mode is selected, multiply the current rent by one plus the percent increase.",
      "Convert the final difference back into both a dollar change and a percent change for easy comparison."
    ],
    faqs: [
      {
        question: "What if my increase is negative?",
        answer:
          "This tool will show the math, but it is designed primarily for increases. A lower new rent will appear as a negative change."
      },
      {
        question: "Can I use this for annual leases?",
        answer:
          "Yes. The result is still monthly rent math. Notice timing and legal compliance are separate from the calculator."
      },
      {
        question: "Should I round the new rent?",
        answer:
          "Most landlords round to a whole dollar amount for easier communication, but the calculator supports cents if needed."
      }
    ],
    example: {
      title: "Example",
      summary: "Current rent is $1,600 and you are considering a 4.5% increase.",
      steps: [
        "Multiply $1,600 by 4.5% to get a $72 increase.",
        "Add the increase to the current rent.",
        "The updated monthly rent is $1,672."
      ]
    },
    relatedTools: ["prorated-rent-calculator", "move-in-cost-calculator", "late-fee-calculator"]
  },
  "late-fee-calculator": {
    slug: "late-fee-calculator",
    name: "Late Fee Calculator",
    shortName: "Late Fee",
    description: "Estimate flat, percentage, or combined late-fee charges and total amount due.",
    intro:
      "Estimate a late fee and the total amount due.",
    metaTitle: "Late Fee Calculator | Landlord Math Toolkit",
    metaDescription:
      "Calculate flat, percent, or combined rent late fees with grace-day notes, fee totals, and a copyable summary.",
    sections: [
      {
        title: "Rent Amount",
        description: "Start with the monthly rent that is past due.",
        fields: [
          {
            name: "rentAmount",
            label: "Monthly rent",
            type: "currency",
            placeholder: "1800",
            min: 0,
            step: 0.01,
            required: true
          }
        ]
      },
      {
        title: "Fee Rules",
        description: "Choose how the late fee is charged and add a grace period if you use one.",
        fields: [
          {
            name: "feeType",
            label: "Fee type",
            type: "select",
            options: [
              { label: "Flat fee only", value: "flat" },
              { label: "Percent of rent only", value: "percent" },
              { label: "Flat fee plus percent", value: "combined" }
            ]
          },
          {
            name: "flatFee",
            label: "Flat fee",
            type: "currency",
            placeholder: "75",
            min: 0,
            step: 0.01
          },
          {
            name: "percentFee",
            label: "Percent fee",
            type: "number",
            placeholder: "5",
            min: 0,
            step: 0.01
          },
          {
            name: "graceDays",
            label: "Grace period days",
            type: "number",
            placeholder: "0",
            min: 0,
            step: 1,
            help: "Grace period is shown for reference and does not change the calculation automatically."
          }
        ]
      }
    ],
    assumptions: [
      "This tool does not verify whether a late-fee structure is allowed in your jurisdiction.",
      "Grace days are shown as context only and do not automatically delay the fee in the math.",
      "Always check lease language and local law before charging a late fee."
    ],
    methodology: [
      "If the fee is flat, use the flat amount entered.",
      "If the fee is percentage-based, multiply rent by the percent entered.",
      "If both apply, add the flat fee and percentage amount to get the total late fee, then add it to unpaid rent."
    ],
    faqs: [
      {
        question: "Does the calculator decide whether the fee is legal?",
        answer:
          "No. It only shows the math. Legal caps, grace periods, and notice rules vary by lease and location."
      },
      {
        question: "Can I use both a flat fee and a percent?",
        answer:
          "Yes, if that reflects your lease terms. Choose the combined option to include both pieces in the estimate."
      },
      {
        question: "Why is the grace period not changing the total?",
        answer:
          "Grace days are included as a note for the summary. The calculator assumes you are checking the amount once a fee is chargeable."
      }
    ],
    example: {
      title: "Example",
      summary: "Monthly rent is $1,950 with a $50 flat fee plus 3% of rent after a 5-day grace period.",
      steps: [
        "Calculate the percent fee: 3% of $1,950 is $58.50.",
        "Add the flat fee: $58.50 + $50 = $108.50 total late fee.",
        "Add the late fee to rent: $1,950 + $108.50 = $2,058.50 due."
      ]
    },
    relatedTools: ["prorated-rent-calculator", "move-in-cost-calculator", "rent-increase-calculator"]
  }
};

export const orderedTools = Object.values(tools);
