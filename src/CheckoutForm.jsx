import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { User, Mail, CreditCard, Lock } from "lucide-react";
import { Bounce, toast, ToastContainer } from "react-toastify";

const CARD_OPTIONS = {
  style: {
    base: {
      color: "#111827", 
      fontSize: "16px",
      fontFamily: "Inter, sans-serif",
      fontSmoothing: "antialiased",
      "::placeholder": {
        color: "#9ca3af",
      },
    },
    invalid: {
      color: "#ef4444",
      iconColor: "#ef4444",
    },
  },
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [paypentError, seterror] = useState("");
  const [success, setSuccess] = useState("");

  const onSubmit = async (data) => {
    if (!stripe || !elements) return;
    setLoading(true);
    seterror("");
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: elements.getElement(CardElement),
      billing_details: {
        name: data.name,
        email: data.email,
      },
    });

    if (error) {
      seterror(error.message);
    } else {
      setSuccess(`Payment method created! ID: ${paymentMethod.id}`);
      console.log(success);
      
      toast.success("Payment ID created", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#d1fae5] via-white to-[#bbf7d0] px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#9bec8d] to-[#52FF34] p-6">
          <h2 className="text-2xl font-bold text-black text-center flex items-center justify-center gap-2">
            <CreditCard className="w-6 h-6 text-black" /> Secure Checkout
          </h2>
          <p className="text-sm text-black text-center mt-1">Pay safely</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="relative">
            <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-700" />
            <input
              type="text"
              placeholder="First Name"
              {...register("name", { required: "Name is required" })}
              className="w-full pl-10 pr-3 py-3 bg-gray-100 placeholder:text-gray-500 text-black rounded-lg focus:outline-none shadow"
            />
            {errors.name && (
              <p className="absolute text-xs text-red-500 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-700" />
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Enter a valid email",
                },
              })}
              className="w-full pl-10 pr-3 py-3 bg-gray-100 placeholder:text-gray-500 text-black rounded-lg focus:outline-none shadow"
            />
            {errors.email && (
              <p className="absolute text-xs text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-black font-medium mb-1 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#22c55e]" />
              Card Information
            </label>
            <div className="p-3 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-[#52FF34] bg-gray-100">
              <CardElement options={CARD_OPTIONS} />
            </div>
          </div>

          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-[#52FF34] hover:bg-[#7ef768] text-black font-medium py-3 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer">
            <CreditCard className="w-5 h-5" />
            {loading ? "Processing..." : "Pay Now"}
          </button>

          {paypentError && (
            <p className="absolute text-xs text-start -mt-3 text-red-600 w-80 ">
              {paypentError}
            </p>
          )}
          <ToastContainer />
        </form>

        <div className="bg-gray-50 p-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
          <Lock className="w-4 h-4 text-[#30911f]" />
          Payments are securely processed
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
