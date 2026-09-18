import { describe, expect, it } from "vitest";
import { customerSchema } from "./customer";

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
  dependants: "1",
  vehicleType: "none",
  vehicleRegYear: "2020",
  vehicleValue: "",
};

describe("customerSchema", () => {
  it("parses form data and normalises fields", () => {
    const r = customerSchema(today).parse(valid);
    expect(r).toMatchObject({
      phone: "919812300001",
      email: "rahul@example.com",
      annualIncome: 1_200_000,
      smoker: true,
      preExistingCondition: false,
      dependants: 1,
      vehicleRegYear: null,
      vehicleValue: null,
    });
  });

  it("rejects under-18 customers and bad phones", () => {
    const r = customerSchema(today).safeParse({ ...valid, dob: "2010-01-01", phone: "12345" });
    expect(r.success).toBe(false);
    const paths = r.error!.issues.map((i) => i.path[0]);
    expect(paths).toEqual(expect.arrayContaining(["dob", "phone"]));
  });

  it("requires vehicle details when a vehicle is selected", () => {
    const r = customerSchema(today).safeParse({ ...valid, vehicleType: "car", vehicleRegYear: "", vehicleValue: "" });
    expect(r.success).toBe(false);
    expect(r.error!.issues.map((i) => i.path[0])).toEqual(["vehicleRegYear", "vehicleValue"]);
  });

  it("keeps vehicle details for vehicle owners", () => {
    const r = customerSchema(today).parse({ ...valid, vehicleType: "car", vehicleRegYear: "2022", vehicleValue: "900000" });
    expect(r).toMatchObject({ vehicleType: "car", vehicleRegYear: 2022, vehicleValue: 900_000 });
  });
});
