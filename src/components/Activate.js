import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Activate = () => {
  const [status, setStatus] = useState({ type: 'info', message: 'Activating your account…' });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { activateAccount } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus({ type: 'danger', message: 'Activation token is missing.' });
      return;
    }

    const activate = async () => {
      try {
        setStatus({ type: 'info', message: 'Validating activation token…' });
        await activateAccount(token);
        setStatus({ type: 'success', message: 'Account activated! Redirecting to users…' });
        setTimeout(() => navigate('/', { replace: true }), 1500);
      } catch (error) {
        const message = error.response?.data?.error || 'Activation failed. The link may be invalid or expired.';
        setStatus({ type: 'danger', message });
      }
    };

    activate();
  }, [searchParams, activateAccount, navigate]);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h2 className="card-title mb-4">Account Activation</h2>
              <div className={`alert alert-${status.type}`} role="alert">
                {status.message}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Activate;
