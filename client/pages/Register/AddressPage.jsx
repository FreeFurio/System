import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddressForm from './AddressForm';

const validation = {
  contactNumber: { required: true, pattern: /^[0-9]{7,15}$/ },
  city: { required: true },
  state: { required: true },
  country: { required: true },
  zipCode: { required: true, pattern: /^[0-9a-zA-Z\- ]{3,10}$/ },
};

function validateField(field, value) {
  const rules = validation[field];
  if (rules.required && !value) return "This field is required";
  if (rules.minLength && value.length < rules.minLength)
    return `Minimum ${rules.minLength} characters`;
  if (rules.pattern && !rules.pattern.test(value))
    return "Invalid format";
  return "";
}

export default function AddressPage({ email }) {
  const navigate = useNavigate();
  const [fields, setFields] = useState({
    contactNumber: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (name, value) => {
    setFields((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    Object.keys(fields).forEach((field) => {
      newErrors[field] = validateField(field, fields[field]);
    });
    setErrors(newErrors);

    if (Object.values(newErrors).some((err) => err)) return;

    setLoading(true);
    setSubmitError("");
    try {
      const response = await fetch("http://localhost:3000/api/v1/auth/register/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...fields }), // <-- FIXED LINE
      });
      if (!response.ok) throw new Error("Failed to submit information");
      setSubmitted(true);
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      setSubmitError("Failed to submit information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  
  if (submitted) {
    return (
      <div className="form-success">
        <h2>Register Completed!</h2>
      </div>
    );
  }

  return (
    <div className="address-page">
      <h2>Enter Additional Information</h2>
      <form className="form" onSubmit={handleSubmit} noValidate>
        <AddressForm values={fields} errors={errors} onChange={handleChange} />
        {submitError && <div className="error-message">{submitError}</div>}
        <button type="submit" className="signup-button" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}