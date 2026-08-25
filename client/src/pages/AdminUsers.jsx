import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = JSON.parse(
      localStorage.getItem("user")
    );

    if (!user || user.role !== "ADMIN") {
      navigate("/");
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await API.get("/users");

      setUsers(response.data.users);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId, role) => {
    try {
      const response = await API.put(
        `/users/role/${userId}`,
        { role }
      );

      setUsers((previousUsers) =>
        previousUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                role: response.data.user.role
              }
            : user
        )
      );

      alert("User role updated successfully");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to update role"
      );
    }
  };

  const deleteUser = async (userId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/users/${userId}`);

      setUsers((previousUsers) =>
        previousUsers.filter(
          (user) => user._id !== userId
        )
      );

      alert("User deleted successfully");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to delete user"
      );
    }
  };

  if (loading) {
    return (
      <h2 style={{ textAlign: "center" }}>
        Loading users...
      </h2>
    );
  }

  if (error) {
    return (
      <h2 style={styles.error}>
        {error}
      </h2>
    );
  }

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>
        User Management 👥
      </h1>

      <div style={styles.tableContainer}>

        <table style={styles.table}>

          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Phone</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>

            {users.map((user) => (

              <tr key={user._id}>

                <td style={styles.td}>
                  {user.name}
                </td>

                <td style={styles.td}>
                  {user.email}
                </td>

                <td style={styles.td}>
                  {user.phone}
                </td>

                <td style={styles.td}>

                  <select
                    value={user.role}
                    onChange={(e) =>
                      updateRole(
                        user._id,
                        e.target.value
                      )
                    }
                    style={styles.select}
                  >

                    <option value="USER">
                      USER
                    </option>

                    <option value="SELLER">
                      SELLER
                    </option>

                    <option value="ADMIN">
                      ADMIN
                    </option>

                  </select>

                </td>

                <td style={styles.td}>

                  <button
                    onClick={() =>
                      deleteUser(user._id)
                    }
                    style={styles.delete}
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    backgroundColor: "#f3f4f6",
    minHeight: "calc(100vh - 70px)"
  },

  title: {
    textAlign: "center",
    marginBottom: "30px"
  },

  tableContainer: {
    maxWidth: "1100px",
    margin: "auto",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    overflowX: "auto"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse"
  },

  th: {
    padding: "15px",
    textAlign: "left",
    borderBottom: "2px solid #ddd"
  },

  td: {
    padding: "15px",
    borderBottom: "1px solid #eee"
  },

  select: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc"
  },

  delete: {
    padding: "8px 15px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer"
  },

  error: {
    textAlign: "center",
    color: "red"
  }
};

export default AdminUsers;