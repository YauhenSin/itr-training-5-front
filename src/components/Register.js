import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [status, setStatus] = useState({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activationLink, setActivationLink] = useState(null);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      setStatus({ type: 'danger', message: 'All fields are required.' });
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus({ type: null, message: '' });

      const data = await register(formData);

      setStatus({
        type: 'success',
        message: data.message || 'Registration successful! Please check your email to activate your account.'
      });
      setActivationLink(data.activationUrl || null);
      setFormData({ name: '', email: '', password: '' });
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || 'Registration failed. Please try again.';
      setStatus({ type: 'danger', message: errorMessage });
      setActivationLink(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body">
              <h2 className="card-title mb-4 text-center">Create an Account</h2>

              {status.type && (
                <div className={`alert alert-${status.type}`} role="alert">
                  {status.message}
                  {activationLink && (
                    <div className="mt-2">
                      <button
                        type="button"
                        className="btn btn-outline-light btn-sm"
                        onClick={() => navigate(`/activate?token=${new URL(activationLink).searchParams.get('token')}`)}
                      >
                        Activate now
                      </button>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering…' : 'Register'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
