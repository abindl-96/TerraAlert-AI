import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "./DashboardLayout";
import UsersTable from "./UsersTable";

const Dashboard = () => {

  const [users, setUsers] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [editData, setEditData] = useState({ 
    name: "", email: "", phone_number: "", location: "", 
    pincode: "", password: "", usertype: "" 
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8081/api/get/getAllUsers");
      setUsers(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { 
    fetchUsers(); 
}, []);

  const handleEditClick = (user) => {
    setEditRow(user.id);
    setEditData(user);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
    try {
      await axios.put(`http://localhost:8081/api/update/updateUser/${id}`, editData);
      setEditRow(null);
      fetchUsers();
    } catch (err) { console.log(err); }
  };

  const handleCancel = () => setEditRow(null);

  const handleBlock = async (id) => {
    if (!window.confirm("Block this user?")) return;
    await axios.put(`http://localhost:8081/api/update/blockUser/${id}`);
    fetchUsers();
  };

  const handleUnblock = async (id) => {
    if (!window.confirm("Unblock this user?")) return;
    await axios.put(`http://localhost:8081/api/update/unblockUser/${id}`);
    fetchUsers();
  };

  return (
    <DashboardLayout>
      <UsersTable
        users={users}
        editRow={editRow}
        editData={editData}
        handleEditClick={handleEditClick}
        handleChange={handleChange}
        handleSave={handleSave}
        handleCancel={handleCancel}
        handleBlock={handleBlock}
        handleUnblock={handleUnblock}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
