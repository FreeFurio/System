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

export default function AddressPage({ username }) {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/register/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, ...fields }),
      });
      const data = await response.json();
      if (response.ok || data.status === 'success') {
        setSubmitted(true);
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      } else {
        setSubmitError(data.message || "Failed to submit information. Please try again.");
      }
    } catch (err) {
      setSubmitError("Failed to submit information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  
  if (submitted) {
    return (
      <div className="form-container">
        <div className="form-header">
          <h2 className="title">Registration Complete!</h2>
          <p className="subtitle">Your account has been created successfully</p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="title">Additional Information</h2>
        <p className="subtitle">Complete your profile setup</p>
      </div>
      
      <form className="form" onSubmit={handleSubmit} noValidate>
        <AddressForm values={fields} errors={errors} onChange={handleChange} />
        {submitError && <div className="error-message">{submitError}</div>}
        <button type="submit" className="signup-button" disabled={loading}>
          {loading ? (
            <>
              <span className="loading"></span>
              Submitting...
            </>
          ) : (
            "Complete Registration"
          )}
        </button>
      </form>
    </div>
  );
}