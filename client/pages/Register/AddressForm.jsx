import React from 'react';

function AddressForm({ onChange, values = {}, errors = {} }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (onChange) onChange(name, value);
  };

  return (
    <>
      <div className="form-group">
        <label htmlFor="contactNumber" className="label">Contact Number</label>
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
          placeholder={errors.contactNumber ? errors.contactNumber : "Contact Number"}
        />
      </div>
      <div className="form-group">
        <label htmlFor="city" className="label">City</label>
        <input
          type="text"
          id="city"
          name="city"
          className={`input${errors.city ? " error" : ""}`}
          value={values.city || ""}
          onChange={handleChange}
          required
          placeholder={errors.city ? errors.city : "City"}
        />
      </div>
      <div className="form-group">
        <label htmlFor="state" className="label">State</label>
        <input
          type="text"
          id="state"
          name="state"
          className={`input${errors.state ? " error" : ""}`}
          value={values.state || ""}
          onChange={handleChange}
          required
          placeholder={errors.state ? errors.state : "State"}
        />
      </div>
      <div className="form-group">
        <label htmlFor="country" className="label">Country</label>
        <input
          type="text"
          id="country"
          name="country"
          className={`input${errors.country ? " error" : ""}`}
          value={values.country || ""}
          onChange={handleChange}
          required
          placeholder={errors.country ? errors.country : "Country"}
        />
      </div>
      <div className="form-group">
        <label htmlFor="zipCode" className="label">Zip Code</label>
        <input
          type="text"
          id="zipCode"
          name="zipCode"
          className={`input${errors.zipCode ? " error" : ""}`}
          value={values.zipCode || ""}
          onChange={handleChange}
          required
          placeholder={errors.zipCode ? errors.zipCode : "Zip Code"}
        />
      </div>
    </>
  );
}

export default AddressForm;
