import { test, describe } from "node:test";
import assert from "node:assert";
import request from "supertest";
import app from "../app.js";

describe("Donation API", () => {
  const validDonationData = {
    fullName: "Jane Doe",
    email: "jane.doe@example.com",
    phone: "+91 98765 43210",
    amountInInr: 1000,
    currency: "INR",
    recurring: false,
    message: "Happy to support your cause",
    paymentProvider: "razorpay",
  };

  test("POST /api/donations should create donation with valid data", async () => {
    const response = await request(app)
      .post("/api/donations")
      .send(validDonationData)
      .expect(201);

    assert.strictEqual(response.body.fullName, validDonationData.fullName);
    assert.strictEqual(response.body.email, validDonationData.email);
    assert.strictEqual(
      response.body.amountInInr,
      validDonationData.amountInInr
    );
    assert.strictEqual(response.body.paymentStatus, "pending");
    assert(response.body.id);
  });

  test("POST /api/donations should validate required fields", async () => {
    const response = await request(app)
      .post("/api/donations")
      .send({})
      .expect(400);

    assert.strictEqual(response.body.message, "Validation failed");
    assert(Array.isArray(response.body.errors));
    assert(response.body.errors.length > 0);
  });

  test("POST /api/donations should validate email format", async () => {
    const response = await request(app)
      .post("/api/donations")
      .send({
        ...validDonationData,
        email: "invalid-email",
      })
      .expect(400);

    const emailError = response.body.errors.find(
      (err) => err.field === "email"
    );
    assert(emailError);
    assert(emailError.message.includes("valid email"));
  });

  test("POST /api/donations should validate amount range", async () => {
    const response = await request(app)
      .post("/api/donations")
      .send({
        ...validDonationData,
        amountInInr: 0,
      })
      .expect(400);

    const amountError = response.body.errors.find(
      (err) => err.field === "amountInInr"
    );
    assert(amountError);
    assert(amountError.message.includes("Minimum donation"));
  });

  test("POST /api/donations should validate phone format", async () => {
    const response = await request(app)
      .post("/api/donations")
      .send({
        ...validDonationData,
        phone: "123",
      })
      .expect(400);

    const phoneError = response.body.errors.find(
      (err) => err.field === "phone"
    );
    assert(phoneError);
    assert(phoneError.message.includes("valid phone"));
  });

  test("POST /api/donations should handle recurring donations", async () => {
    const recurringData = {
      ...validDonationData,
      recurring: true,
      frequency: "monthly",
    };

    const response = await request(app)
      .post("/api/donations")
      .send(recurringData)
      .expect(201);

    assert.strictEqual(response.body.recurring, true);
  });

  test("GET /api/donations should return donation list", async () => {
    const response = await request(app).get("/api/donations").expect(200);

    assert(typeof response.body === "object");
    assert(Array.isArray(response.body.donations));
    assert(typeof response.body.pagination === "object");
  });

  test("GET /api/donations/stats should return statistics", async () => {
    const response = await request(app).get("/api/donations/stats").expect(200);

    assert(typeof response.body.total === "number");
    assert(typeof response.body.totalAmount === "number");
    assert(typeof response.body.recent === "number");
    assert(typeof response.body.byStatus === "object");
    assert(typeof response.body.byStatus.pending === "object");
    assert(typeof response.body.byStatus.success === "object");
    assert(typeof response.body.byStatus.failed === "object");
  });

  test("POST /api/donations/payment should create payment order", async () => {
    // First create a donation
    const donationResponse = await request(app)
      .post("/api/donations")
      .send(validDonationData)
      .expect(201);

    const donationId = donationResponse.body.id;

    // Then create payment order
    const response = await request(app)
      .post("/api/donations/payment")
      .send({
        donationId: donationId,
        amount: validDonationData.amountInInr,
      })
      .expect(200);

    assert(response.body.id);
    assert.strictEqual(
      response.body.amount,
      validDonationData.amountInInr * 100
    ); // Razorpay amount in paise
    assert.strictEqual(response.body.currency, "INR");
  });

  test("POST /api/donations/payment should validate donation exists", async () => {
    const fakeId = "507f1f77bcf86cd799439011";

    const response = await request(app)
      .post("/api/donations/payment")
      .send({
        donationId: fakeId,
        amount: 1000,
      })
      .expect(404);

    assert(response.body.message.includes("not found"));
  });

  test("POST /api/donations/verify should validate signature", async () => {
    // Create a donation first
    const donationResponse = await request(app)
      .post("/api/donations")
      .send(validDonationData)
      .expect(201);

    const donationId = donationResponse.body.id;

    // Try to verify with invalid signature
    const response = await request(app)
      .post("/api/donations/verify")
      .send({
        donationId: donationId,
        razorpay_order_id: "order_test123",
        razorpay_payment_id: "pay_test123",
        razorpay_signature: "invalid_signature",
      })
      .expect(400);

    assert(response.body.message.includes("verification failed"));
    assert.strictEqual(response.body.code, "SIGNATURE_MISMATCH");
  });
});
