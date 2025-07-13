import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Validate input
    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    if (password !== repeatPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setSuccess(true);
        setEmail('');
        setUsername('');
        setPassword('');
        setRepeatPassword('');
      } else {
        let tempErr = '';
        for (const key in data) {
          tempErr += data[key] + '\n';
        }
        setError(tempErr);
      }
    } catch (err) {
      setError('An error occurred');
    }
  };

  return (
    <>
      <div className="group-scheduler-logo">
        <Button 
            key={`user-G}`}
            sx={{
                background: 'linear-gradient(to right, #2196f3, #d500f9)',
                borderRadius: "50%",
                borderColor: "white",
                borderWidth: "2px",
                borderStyle: "solid",
                maxWidth: "100px",
                minWidth: "100px",
                minHeight: "100px",
                maxHeight: "100px",
                padding: "0px",
                color: "white",
                fontSize: "50px",
                marginRight: "20px",
                display: "inline-block",
                verticalAlign: "middle",
                lineHeight: "normal",
            }}
            onClick={() => navigate('/')}
        >GS
        </Button>
        {<h1 className="group-scheduler-text">Group Scheduler</h1>}
        </div>
      <h1>Register</h1>
      <Box
        className="register-screen"
        component="form"
        sx={{
          '& .MuiTextField-root': {
            marginBottom: '16px',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'white',
            },
          },
          '& .MuiInputBase-input': {
            color: 'white',
          },
          '& .MuiInputLabel-root': {
            color: 'grey',
          },
        }}
        autoComplete="off"
        onSubmit={handleRegister}
      >
        <div className="text-field-container">
          <div className="register-email-and-username">
            <TextField
              className="register-email"
              label="Email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          <TextField
              className="register-username"
              label="Username"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="register-password-and-repeat-password">
            <TextField
              className="register-password"
              label="Password"
              variant="outlined"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              className="register-repeat-password"
              label="Repeat Password"
              variant="outlined"
              type="password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
            />
          </div>
        </div>
        <Button
          type="submit"
          className="register-submit-button"
          variant="contained"
        >
          Register
        </Button>

      {success && (
          <p style={{ color: 'green' }}>
            Registration successful! You can now{' '}
            <a href="/login" onClick={() => navigate('/login')}>
              log in
            </a>.
          </p>
        )}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <p>
          Already have an account?{' '}
          <a href="/login" onClick={() => navigate('/login')}>
            Log in
          </a>
        </p>
      </Box>
    </>
  );
}

export default Register;