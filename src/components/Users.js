import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshAuth, getAuthHeaders } = useAuth();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users`, {
        headers: getAuthHeaders()
      });
      setUsers(response.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 401) {
        await refreshAuth();
        navigate('/login');
        return;
      }
      setError('Failed to fetch users: ' + err.message);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [API_URL, refreshAuth, navigate]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else {
        fetchUsers();
      }
    }
  }, [authLoading, user, navigate, fetchUsers]);

  const getStatusBadge = (status) => {
    const badges = {
      UNVERIFIED: 'bg-warning',
      ACTIVE: 'bg-success',
      BLOCKED: 'bg-danger'
    };
    return badges[status] || 'bg-secondary';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-4">Users</h1>
          <p className="text-muted">Total users: {users.length}</p>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary" onClick={fetchUsers}>
            Refresh
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="alert alert-info" role="alert">
          No users found. Create your first user!
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Status</th>
                <th scope="col">Registration Time</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{formatDate(user.registrationTime)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
