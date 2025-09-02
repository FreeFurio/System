import React from 'react';

function AddressForm({ onChange, values = {}, errors = {} }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (onChange) onChange(name, value);
  };

  return (
    <>
      <div className="form-group">
        <div className="password-input-wrapper">
          <input
            type="tel"
            id="contactNumber"
            name="contactNumber"
            className={`input${errors.contactNumber ? " error" : ""}`}
            value={values.contactNumber || ""}
            onChange={handleChange}
            required
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder=" "
          />
          <label htmlFor="contactNumber" className="label">Contact Number</label>
        </div>
      </div>
      <div className="form-group">
        <div className="password-input-wrapper">
          <input
            type="text"
            id="city"
            name="city"
            className={`input${errors.city ? " error" : ""}`}
            value={values.city || ""}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <label htmlFor="city" className="label">City</label>
        </div>
      </div>
      <div className="form-group">
        <div className="password-input-wrapper">
          <input
            type="text"
            id="state"
            name="state"
            className={`input${errors.state ? " error" : ""}`}
            value={values.state || ""}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <label htmlFor="state" className="label">State</label>
        </div>
      </div>
      <div className="form-group">
        <div className="password-input-wrapper">
          <input
            type="text"
            id="country"
            name="country"
            className={`input${errors.country ? " error" : ""}`}
            value={values.country || ""}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <label htmlFor="country" className="label">Country</label>
        </div>
      </div>
      <div className="form-group">
        <div className="password-input-wrapper">
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            className={`input${errors.zipCode ? " error" : ""}`}
            value={values.zipCode || ""}
            onChange={handleChange}
            required
            placeholder=" "
          />
          <label htmlFor="zipCode" className="label">Zip Code</label>
        </div>
      </div>
    </>
  );
}

export default AddressForm;
