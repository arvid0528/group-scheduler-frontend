import { useState, useEffect} from 'react'
import './App.css'
import Login from './Login';
import {Routes, Route, useNavigate, useLocation} from 'react-router-dom';
import Register from './Register';
import CalendarApp from './CalendarApp';
import CreateGroup from './CreateGroup';

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  const [user, setUser] = useState<{
    username: string,
    profile_picture_color: string,
    discord_avatar_hash: string,
    discord_id: string
  }>
  ({
    username: "", 
    profile_picture_color: "", 
    discord_avatar_hash: "",
    discord_id: ""
  })
  const [token, setToken] = useState<string>("")

  async function getUserByToken(){
    const response = await fetch('http://127.0.0.1:8000/api/get_user_by_token', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    })
    const data = await response.json()
    return data
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    // Redirect from discord login with token in URL
    if (tokenFromUrl) {
      localStorage.setItem('token', tokenFromUrl);
      setToken(tokenFromUrl);
      console.log("Token from URL: ", tokenFromUrl);
      navigate('/home');
    }

    const validateToken = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        const user = await getUserByToken();
        if(user.error){
          console.log("token invalid, redirecting to login");
          localStorage.removeItem('token');
          setUser({username: "", profile_picture_color: "", discord_avatar_hash: "", discord_id: ""});
          setToken("");
          navigate('/login');
        }
        setUser(user);
        setToken(savedToken);
        
        if (location.pathname === '/login' || location.pathname === '/') {
          navigate('/home');
        }
      } else {
        if (location.pathname !== '/register') {
          setUser({username: "", profile_picture_color: "", discord_avatar_hash: "", discord_id: ""});
          setToken("");
          navigate('/login');
        }
      }
    };
  
    if (!token) {
      validateToken();
    }
  }
  , [token, location.pathname, navigate]);

  const isLoading = user.username == "";

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={
        isLoading ? <div className="loading-screen">Loading...</div> :
        <CalendarApp 
        user={user} 
        setToken={setToken} 
        setUser={setUser}
        />} />
      <Route path="create-group" element={<CreateGroup creatorUsername={user.username}/>} />
    </Routes>
  )
}

export default App
