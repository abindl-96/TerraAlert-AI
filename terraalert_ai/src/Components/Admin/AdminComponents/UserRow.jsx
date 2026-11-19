import React from "react";
import edit from "../../../assets/edit.png";
import blockIcon from "../../../assets/block.png";
import unblockIcon from "../../../assets/unlock.png";

const UserRow = ({ user, handleEditClick, handleBlock, handleUnblock }) => {
  return (
    <tr className={user.isBlocked ? "blocked-row" : ""}>
      <td>{user.id}</td>
      <td>{user.name}</td>
      <td>{user.email}</td>
      <td>{user.phone_number}</td>
      <td>{user.location}</td>
      <td>{user.pincode}</td>
      <td>{user.password}</td>
      <td>{user.usertype}</td>

      <td className="table-actions">
        <img src={edit} onClick={() => handleEditClick(user)} />

        {user.isBlocked ? (
          <img src={unblockIcon} onClick={() => handleUnblock(user.id)} />
        ) : (
          <img src={blockIcon} onClick={() => handleBlock(user.id)} />
        )}
      </td>
    </tr>
  );
};

export default UserRow;
