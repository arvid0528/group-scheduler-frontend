import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';

import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Custom Discord icon grabbed from https://github.com/mui/material-ui/issues/35218#issuecomment-1977984142
  const DiscordIcon: React.FC<SvgIconProps> = (props) => (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 
      1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 
      0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 
      1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 
      00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 
      0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 
      01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 
      00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 
      0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 
      1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 
      2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </SvgIcon>
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      console.log(data)
      if (response.ok) {
        localStorage.setItem('token', data.token)
        navigate('/home')
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred')
    } 
  }

  const handleDiscordLogin = async () => {
    window.location.href = "https://discord.com/oauth2/authorize?client_id=1376562277318397962&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fapi%2Fdiscord%2Fcallback%2F&scope=identify"
  }

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
        >GS
        </Button>
        {<h1 className="group-scheduler-text">Group Scheduler</h1>}
      </div>
      <h1>Log In</h1>
      <Box className="login-screen"
        component="form"
        sx={{
          '& .MuiTextField-root': {
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
        onSubmit={handleLogin}
      >
        <div className="login-username-password">
          <TextField 
            className="login-username" 
            label="Username" 
            variant="outlined"
            value={username}  
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField 
            className="login-password" 
            label="Password" 
            variant="outlined" 
            color="primary"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Button 
          type="submit"
          className="login-submit-button"
          variant="contained"
        >
          Log in
        </Button>
        <div style={{height: "20px"}}/>
        <Button 
          className="discord-login-button"
          variant="outlined"
          onClick={handleDiscordLogin}
          startIcon={<DiscordIcon style={{ color: 'white' }} />}
        >
          Log in with Discord
        </Button>

        <p>Don't have an account? <a href="/register" onClick={() => navigate("/register")}>Register</a></p>
        {error && <p style={{color: 'red'}}>{error}</p>}
      </Box>
    </>
  )
}

export default Login