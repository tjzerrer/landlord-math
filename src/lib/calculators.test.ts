import { describe, expect, it } from "vitest";

import {
  calculateLateFee,
  calculateMoveInCost,
  calculateProratedRent,
  calculateRentIncrease
} from "./calculators";

describe("calculateProratedRent", () => {
  it("handles a same-day occupancy", () => {
    const result = calculateProratedRent({
      monthlyRent: 1500,
      occupancyStart: "2026-06-15",
      occupancyEnd: "2026-06-15",
      prorationMethod: "actual-days"
    });

    expect(result.occupiedDays).toBe(1);
    expect(result.proratedRent).toBe(50);
  });

  it("handles February day counts", () => {
    const result = calculateProratedRent({
      monthlyRent: 1400,
      occupancyStart: "2026-02-10",
      occupancyEnd: "2026-02-28",
      prorationMethod: "actual-days"
    });

    expect(result.daysInMonth).toBe(28);
    expect(result.occupiedDays).toBe(19);
    expect(result.proratedRent).toBe(950);
  });

  it("supports the 30-day banker method", () => {
    const result = calculateProratedRent({
      monthlyRent: 1860,
      occupancyStart: "2026-05-01",
      occupancyEnd: "2026-05-31",
      prorationMethod: "banker-30"
    });

    expect(result.daysInMonth).toBe(30);
    expect(result.dailyRate).toBe(62);
    expect(result.proratedRent).toBe(1922);
  });
});

describe("calculateMoveInCost", () => {
  it("handles zero-fee cases", () => {
    const result = calculateMoveInCost({
      monthlyRent: 1800,
      securityDeposit: 1800,
      proratedRent: 0,
      applicationFee: 0,
      petDeposit: 0,
      parkingFee: 0,
      miscFee: 0
    });

    expect(result.total).toBe(3600);
  });

  it("adds multiple fee lines", () => {
    const result = calculateMoveInCost({
      monthlyRent: 1800,
      securityDeposit: 1800,
      proratedRent: 600,
      applicationFee: 50,
      petDeposit: 250,
      parkingFee: 100,
      miscFee: 25
    });

    expect(result.total).toBe(4625);
  });
});

describe("calculateRentIncrease", () => {
  it("calculates an increase from a target rent", () => {
    const result = calculateRentIncrease({
      currentRent: 1600,
      mode: "new-rent",
      newRent: 1725,
      percentIncrease: 0
    });

    expect(result.increaseAmount).toBe(125);
    expect(result.increasePercent).toBe(7.81);
  });

  it("calculates an increase from a percent", () => {
    const result = calculateRentIncrease({
      currentRent: 1600,
      mode: "percent",
      newRent: 0,
      percentIncrease: 4.5
    });

    expect(result.updatedRent).toBe(1672);
    expect(result.increaseAmount).toBe(72);
    expect(result.increasePercent).toBe(4.5);
  });
});

describe("calculateLateFee", () => {
  it("handles flat fees", () => {
    const result = calculateLateFee({
      rentAmount: 1800,
      feeType: "flat",
      flatFee: 75,
      percentFee: 0,
      graceDays: 3
    });

    expect(result.totalLateFee).toBe(75);
    expect(result.totalDue).toBe(1875);
  });

  it("handles percent fees", () => {
    const result = calculateLateFee({
      rentAmount: 1800,
      feeType: "percent",
      flatFee: 0,
      percentFee: 5,
      graceDays: 0
    });

    expect(result.percentFeeAmount).toBe(90);
    expect(result.totalLateFee).toBe(90);
  });

  it("handles combined fees", () => {
    const result = calculateLateFee({
      rentAmount: 1950,
      feeType: "combined",
      flatFee: 50,
      percentFee: 3,
      graceDays: 5
    });

    expect(result.percentFeeAmount).toBe(58.5);
    expect(result.totalLateFee).toBe(108.5);
    expect(result.totalDue).toBe(2058.5);
  });
});
