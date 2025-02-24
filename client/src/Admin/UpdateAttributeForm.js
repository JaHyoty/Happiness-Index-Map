import React from "react";
import PropTypes from "prop-types";

const UpdateAttributeForm = ({
  onUpdate,
  zipcode,
  setZipcode,
  attribute,
  setAttribute,
  value,
  setValue,
  attributeOptions,
}) => {
  return (
    <div>
      <h1>Welcome to the admin page!</h1>
      <p>You are now authorized to access admin features.</p>

      <form onSubmit={onUpdate}>
        <div>
          <label>
            Zipcode:
            <input
              type="text"
              value={zipcode}
              onChange={(e) => setZipcode(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Attribute:
            <select
              value={attribute}
              onChange={(e) => setAttribute(e.target.value)}
            >
              {attributeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Value:
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Update</button>
      </form>
    </div>
  );
};

UpdateAttributeForm.propTypes = {
  onUpdate: PropTypes.func.isRequired,
  zipcode: PropTypes.string.isRequired,
  setZipcode: PropTypes.func.isRequired,
  attribute: PropTypes.string.isRequired,
  setAttribute: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  attributeOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default UpdateAttributeForm;
