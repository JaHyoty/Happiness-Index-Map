import React from "react";
import PropTypes from "prop-types";

const UpdateParameterForm = ({
  onUpdateParam,
  targetComponentName,
  setTargetComponentName,
  parameter,
  setParameter,
  value,
  setValue,
  targetComponentOptions,
  parameterOptions,
}) => {
  return (
    <div>
      <h1>Update Regression Parameters</h1>

      <form onSubmit={onUpdateParam}>
        <div>
          <label>
            Target Component:
            <select
              value={targetComponentName}
              onChange={(e) => setTargetComponentName(e.target.value)}
              required
            >
              {targetComponentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            Parameter:
            <select
              value={parameter}
              onChange={(e) => setParameter(e.target.value)}
              required
            >
              {parameterOptions.map((option) => (
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
        <button type="submit">Update Parameter</button>
      </form>
    </div>
  );
};

UpdateParameterForm.propTypes = {
  onUpdateParam: PropTypes.func.isRequired,
  targetComponentName: PropTypes.string.isRequired,
  setTargetComponentName: PropTypes.func.isRequired,
  parameter: PropTypes.string.isRequired,
  setParameter: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  setValue: PropTypes.func.isRequired,
  targetComponentOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
  parameterOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default UpdateParameterForm;
