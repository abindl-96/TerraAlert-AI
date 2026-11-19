import React from "react";
import UserRow from "./UserRow";
import EditableRow from "./EditableRow";

const UsersTable = ({
  users, editRow, editData,
  handleEditClick, handleChange,
  handleSave, handleCancel,
  handleBlock, handleUnblock
}) => {

  return (
    <table>
      <thead>
        <tr>
          <td>ID</td><td>Name</td><td>Email</td><td>Number</td>
          <td>Location</td><td>Pincode</td><td>Password</td><td>Usertype</td><td>Actions</td>
        </tr>
      </thead>

      <tbody>
        {users.map((user) =>
          editRow === user.id ? (
            <EditableRow
              key={user.id}
              editData={editData}
              handleChange={handleChange}
              handleSave={() => handleSave(user.id)}
              handleCancel={handleCancel}
            />
          ) : (
            <UserRow
              key={user.id}
              user={user}
              handleEditClick={handleEditClick}
              handleBlock={handleBlock}
              handleUnblock={handleUnblock}
            />
          )
        )}
      </tbody>
    </table>
  );
};

export default UsersTable;
