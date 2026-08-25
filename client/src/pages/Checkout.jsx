import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentMethod: "COD"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));

    setError("");
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Please enter your full name");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit Indian phone number");
      return false;
    }

    if (!formData.address.trim()) {
      setError("Please enter your full address");
      return false;
    }

    if (!formData.city.trim()) {
      setError("Please enter your city");
      return false;
    }

    if (!formData.state.trim()) {
      setError("Please enter your state");
      return false;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      setError("Please enter a valid 6-digit pincode");
      return false;
    }

    return true;
  };

  // ==========================================
  // LOAD RAZORPAY SCRIPT
  // ==========================================

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  // ==========================================
  // COD ORDER
  // ==========================================

  const placeCODOrder = async () => {
    const response = await API.post(
      "/orders",
      formData
    );

    console.log("COD order:", response.data);

    alert(
      response.data.message ||
        "Order placed successfully!"
    );

    navigate("/orders");
  };

  // ==========================================
  // ONLINE PAYMENT
  // ==========================================

  const startOnlinePayment = async () => {
    // Load Razorpay
    const razorpayLoaded =
      await loadRazorpay();

    if (!razorpayLoaded) {
      throw new Error(
        "Razorpay failed to load. Please check your internet connection."
      );
    }

    // ==========================================
    // CREATE RAZORPAY ORDER
    // ==========================================

    const response = await API.post(
      "/payment/create-order"
    );

    console.log(
      "Razorpay create order:",
      response.data
    );

    const razorpayOrder =
      response.data.order;

    const razorpayKey =
      response.data.key;

    if (!razorpayOrder?.id) {
      throw new Error(
        "Razorpay order was not created"
      );
    }

    if (!razorpayKey) {
      throw new Error(
        "Razorpay key is missing"
      );
    }

    // ==========================================
    // RAZORPAY CHECKOUT OPTIONS
    // ==========================================

    const options = {
      key: razorpayKey,

      amount: razorpayOrder.amount,

      currency:
        razorpayOrder.currency || "INR",

      name: "ShopEZ",

      description:
        "ShopEZ Online Payment",

      order_id:
        razorpayOrder.id,

      // Customer information
      prefill: {
        name: formData.name,
        contact: formData.phone
      },

      // Shipping information
      notes: {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode
      },

      // ==========================================
      // PAYMENT METHODS
      // ==========================================
      // Do NOT restrict the methods here.
      // Razorpay will show the payment methods
      // enabled for your account.
      //
      // This allows UPI, Cards, Net Banking,
      // Wallets, etc. when available.

      theme: {
        color: "#111827"
      },

      // ==========================================
      // PAYMENT SUCCESS
      // ==========================================

      handler: async function (
        paymentResponse
      ) {
        try {
          console.log(
            "Razorpay payment response:",
            paymentResponse
          );

          setError("");

          // Verify payment on backend
          const verifyResponse =
            await API.post(
              "/payment/verify",
              {
                name: formData.name,
                phone: formData.phone,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,

                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature
              }
            );

          console.log(
            "Payment verification:",
            verifyResponse.data
          );

          alert(
            verifyResponse.data.message ||
              "Payment successful! Order placed!"
          );

          navigate("/orders");

        } catch (error) {
          console.error(
            "Payment verification error:",
            error
          );

          setError(
            error.response?.data?.message ||
              "Payment verification failed"
          );

          setLoading(false);
        }
      },

      // ==========================================
      // PAYMENT WINDOW CLOSED
      // ==========================================

      modal: {
        ondismiss: function () {
          console.log(
            "Razorpay checkout closed"
          );

          setLoading(false);

          setError(
            "Payment was cancelled."
          );
        }
      }
    };

    // ==========================================
    // OPEN RAZORPAY
    // ==========================================

    const razorpay =
      new window.Razorpay(options);

    // ==========================================
    // PAYMENT FAILED
    // ==========================================

    razorpay.on(
      "payment.failed",
      function (response) {
        console.error(
          "Razorpay payment failed:",
          response.error
        );

        setError(
          response.error?.description ||
            "Payment failed. Please try again."
        );

        setLoading(false);
      }
    );

    razorpay.open();
  };

  // ==========================================
  // PLACE ORDER
  // ==========================================

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (
        formData.paymentMethod === "COD"
      ) {
        await placeCODOrder();
        return;
      }

      if (
        formData.paymentMethod === "ONLINE"
      ) {
        await startOnlinePayment();
        return;
      }

    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to process order"
      );

      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">

      <div className="checkout-box">

        <h1>Checkout</h1>

        <p className="checkout-subtitle">
          Enter your shipping details
        </p>

        {error && (
          <p className="checkout-error">
            {error}
          </p>
        )}

        <form
          onSubmit={handlePlaceOrder}
        >

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            className="checkout-input"
            required
          />

          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            className="checkout-input"
            maxLength={10}
            inputMode="numeric"
            required
          />

          <textarea
            name="address"
            placeholder="Full Address"
            value={formData.address}
            onChange={handleChange}
            className="checkout-textarea"
            required
          />

          <input
            type="text"
            name="city"
            placeholder="City"
            value={formData.city}
            onChange={handleChange}
            className="checkout-input"
            required
          />

          <input
            type="text"
            name="state"
            placeholder="State"
            value={formData.state}
            onChange={handleChange}
            className="checkout-input"
            required
          />

          <input
            type="text"
            name="pincode"
            placeholder="Pincode"
            value={formData.pincode}
            onChange={handleChange}
            className="checkout-input"
            maxLength={6}
            inputMode="numeric"
            required
          />

          <label className="checkout-label">
            Payment Method
          </label>

          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="checkout-input"
            disabled={loading}
          >
            <option value="COD">
              Cash on Delivery
            </option>

            <option value="ONLINE">
              Online Payment
            </option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="checkout-button"
          >
            {loading
              ? "Processing..."
              : formData.paymentMethod ===
                "ONLINE"
              ? "Pay Online"
              : "Place Order"}
          </button>

        </form>

        <button
          type="button"
          onClick={() =>
            navigate("/cart")
          }
          className="checkout-back-button"
          disabled={loading}
        >
          ← Back to Cart
        </button>

      </div>

    </div>
  );
}

export default Checkout;