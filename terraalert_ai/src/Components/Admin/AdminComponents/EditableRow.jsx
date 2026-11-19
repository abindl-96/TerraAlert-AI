import React from "react";

const EditableRow = ({ editData, handleChange, handleSave, handleCancel }) => {
  return (
    <tr>
      <td>{editData.id}</td>

      <td><input name="name" value={editData.name} onChange={handleChange} /></td>
      <td><input name="email" value={editData.email} onChange={handleChange} /></td>
      <td><input name="phone_number" value={editData.phone_number} onChange={handleChange} /></td>
      <td><input name="location" value={editData.location} onChange={handleChange} /></td>
      <td><input name="pincode" value={editData.pincode} onChange={handleChange} /></td>
      <td><input name="password" value={editData.password} onChange={handleChange} /></td>
      <td><input name="usertype" value={editData.usertype} onChange={handleChange} /></td>

      <td>
        <button className="save-btn" onClick={handleSave}>Save</button>
        <button className="cancel-btn" onClick={handleCancel}>Cancel</button>
      </td>
    </tr>
  );
};

export default EditableRow;
