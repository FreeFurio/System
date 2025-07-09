import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function PasswordInput({
  value,
  onChange,
  name = "password",
  placeholder = "Password",
  error,
  success,
  required,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="password-input-wrapper">
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`input password-input${error ? " error" : ""}${success ? " success" : ""}`}
          autoComplete="new-password"
          required={required}
        />
        <span
          onClick={() => setVisible((v) => !v)}
          className="toggle-password"
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={0}
          role="button"
        >
          {visible ? <FiEyeOff size={20} /> : <FiEye size={20} />}
        </span>
      </div>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export function PasswordForm({ fields, handleInputChange, errors }) {
  return (
    <div>
      <div className="form-group">
        <label htmlFor="password" className="label">
          Password
        </label>
        <PasswordInput
          value={fields.password}
          onChange={handleInputChange}
          error={errors.password}
          name="password"
          placeholder="Password"
        />
      </div>
      <div className="form-group">
        <label htmlFor="retypePassword" className="label">
          Retype Password
        </label>
        <PasswordInput
          value={fields.retypePassword}
          onChange={handleInputChange}
          error={errors.retypePassword}
          name="retypePassword"
          placeholder="Retype Password"
        />
      </div>
    </div>
  );
} 