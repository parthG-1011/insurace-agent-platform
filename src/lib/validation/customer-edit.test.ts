import { describe, expect, it } from "vitest";
import { customerSchema, normaliseVehicleFields } from "./customer";

const today = new Date("2026-09-18");
const valid = {
  name: "Rahul Verma",
  phone: "98123 00001",
  email: "Rahul@Example.com ",
  dob: "1997-03-14",
  gender: "male",
  city: "Pune",
  annualIncome: "1200000",
  smoker: "on",
  preExistingCondition: "",
  dependants: "1",
  vehicleType: "none",
  vehicleRegYear: "2020",
  vehicleValue: "",
};

describe("customerSchema on update", () => {
  it("re-parses a full, valid payload unchanged", () => {
    const r = customerSchema(today).parse(valid);
    expect(r).toMatchObject({
      name: "Rahul Verma",
      phone: "919812300001",
      email: "rahul@example.com",
      dob: "1997-03-14",
      gender: "male",
      city: "Pune",
      annualIncome: 1_200_000,
      smoker: true,
      preExistingCondition: false,
      dependants: 1,
      vehicleType: "none",
    });
  });

  it("cannot blank a required field — a missing dob is rejected, not stored as empty", () => {
    const { dob: _dob, ...withoutDob } = valid;
    const r = customerSchema(today).safeParse(withoutDob);
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.path[0])).toEqual(["dob"]);
  });

  it("cannot blank a required field — a malformed phone is rejected", () => {
    const r = customerSchema(today).safeParse({ ...valid, phone: "12345" });
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.path[0])).toContain("phone");
  });
});

describe("normaliseVehicleFields", () => {
  it("clears vehicle details when the vehicle is removed", () => {
    expect(normaliseVehicleFields({ vehicleType: "none", vehicleRegYear: 2020, vehicleValue: 900_000 })).toEqual({
      vehicleRegYear: null,
      vehicleValue: null,
    });
  });

  it("keeps vehicle details when a vehicle is owned", () => {
    expect(normaliseVehicleFields({ vehicleType: "car", vehicleRegYear: 2022, vehicleValue: 900_000 })).toEqual({
      vehicleRegYear: 2022,
      vehicleValue: 900_000,
    });
  });

  it("treats an unposted vehicle (the hidden-input case) as no vehicle", () => {
    // The edit form stops rendering the numeric inputs when the select is "none", so they
    // arrive as undefined rather than as the old values. Without this the row would keep
    // stale vehicle data and motor plans would stay on offer.
    expect(normaliseVehicleFields({ vehicleType: "none", vehicleRegYear: null, vehicleValue: null })).toEqual({
      vehicleRegYear: null,
      vehicleValue: null,
    });
  });

  it("a none payload with no vehicle inputs parses and normalises to nulls", () => {
    const { vehicleRegYear: _year, vehicleValue: _value, ...withoutVehicleInputs } = valid;
    const parsed = customerSchema(today).parse(withoutVehicleInputs);
    expect(normaliseVehicleFields(parsed)).toEqual({ vehicleRegYear: null, vehicleValue: null });
  });

  it("still demands vehicle details when a vehicle is selected", () => {
    const r = customerSchema(today).safeParse({ ...valid, vehicleType: "two_wheeler", vehicleRegYear: "", vehicleValue: "" });
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.path[0])).toEqual(["vehicleRegYear", "vehicleValue"]);
  });
});