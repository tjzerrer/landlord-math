export type ToolSlug =
  | "prorated-rent-calculator"
  | "move-in-cost-calculator"
  | "rent-increase-calculator"
  | "late-fee-calculator";

export type FaqItem = {
  question: string;
  answer: string;
};

export type ExampleItem = {
  title: string;
  summary: string;
  steps: string[];
};

export type ToolField =
  | {
      name: string;
      label: string;
      type: "currency" | "number" | "date";
      placeholder?: string;
      min?: number;
      step?: number;
      help?: string;
      required?: boolean;
    }
  | {
      name: string;
      label: string;
      type: "select";
      help?: string;
      required?: boolean;
      options: Array<{ label: string; value: string }>;
    };

export type ToolSection = {
  title: string;
  description: string;
  fields: ToolField[];
};

export type ToolConfig = {
  slug: ToolSlug;
  name: string;
  shortName: string;
  description: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  sections: ToolSection[];
  assumptions: string[];
  methodology: string[];
  faqs: FaqItem[];
  example: ExampleItem;
  relatedTools: ToolSlug[];
};

export type ProrationInputs = {
  monthlyRent: number;
  occupancyStart: string;
  occupancyEnd: string;
  prorationMethod: "actual-days" | "banker-30";
};

export type ProrationResult = {
  monthlyRent: number;
  daysInMonth: number;
  occupiedDays: number;
  dailyRate: number;
  proratedRent: number;
  periodLabel: string;
};

export type MoveInInputs = {
  monthlyRent: number;
  securityDeposit: number;
  proratedRent: number;
  applicationFee: number;
  petDeposit: number;
  parkingFee: number;
  miscFee: number;
};

export type MoveInSummaryLine = {
  label: string;
  amount: number;
};

export type MoveInResult = {
  total: number;
  lines: MoveInSummaryLine[];
};

export type RentIncreaseInputs = {
  currentRent: number;
  mode: "new-rent" | "percent";
  newRent: number;
  percentIncrease: number;
};

export type RentIncreaseResult = {
  currentRent: number;
  updatedRent: number;
  increaseAmount: number;
  increasePercent: number;
};

export type LateFeeInputs = {
  rentAmount: number;
  feeType: "flat" | "percent" | "combined";
  flatFee: number;
  percentFee: number;
  graceDays: number;
};

export type LateFeeResult = {
  rentAmount: number;
  flatFee: number;
  percentFeeAmount: number;
  totalLateFee: number;
  totalDue: number;
  graceDays: number;
};
