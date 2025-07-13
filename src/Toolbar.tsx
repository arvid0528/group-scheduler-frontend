import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Toolbar.css';

import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import Badge from '@mui/material/Badge';


function Toolbar(
  {
    user,
    setToken,
    setUser,
    invites,
  }:
  {
    user: {username: string; profile_picture_color: string; discord_avatar_hash: string, discord_id: string},
    setToken: React.Dispatch<React.SetStateAction<string>>,
    setUser: React.Dispatch<React.SetStateAction<{
      username: string; profile_picture_color: string; discord_avatar_hash: string, discord_id: string}>>,
    invites: string[],
  }) {

  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [pfpColor, setPfpColor] = useState<string>("");
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const logOut = () => {
    console.log("Logging out...");
    localStorage.removeItem('token');
    setToken("");
    setUser({username: "", profile_picture_color: "", discord_avatar_hash: "", discord_id: ""});
    navigate('/login');
  }

  const acceptGroupInvite = async (group: string) => {
    console.log("Accepting Group invite for " + group);
    const response = await fetch("http://127.0.0.1:8000/api/accept_group_invite", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ 
        group: group,
        user: user.username,
      }),
    });
    const data = await response.json();
    if (response.status === 200) {
      console.log("Group invite accepted: ", data);
    }
    else {
      console.error("Error accepting group invite: ", data);
    }
    
    setAnchorEl(null);
  }

  const rejectGroupInvite = async (group: string) => {
    console.log("Rejecting Group invite for " + group);
    
    const response = await fetch("http://127.0.0.1:8000/api/decline_group_invite", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ 
        group: group,
        user: user.username,
      }),
    });
    const data = await response.json();
    if (response.status === 200) {
      console.log("Group invite rejected: ", data);
    }
    else {
      console.error("Error rejecting group invite: ", data);
    }

    setAnchorEl(null);
  }

  const getProfilePictureColor = async () => {
    const response = await fetch("http://127.0.0.1:8000/api/get_profile_picture_color_by_token", {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    }) 
    const data = await response.json()
    if (response.status === 200) {
      setPfpColor(data.profile_picture_color);
    } else {
      console.error("Error fetching profile picture color: ", data);
    }
  }

  useEffect(() => {
    if (!pfpColor) {
      getProfilePictureColor();
    }
  }, [pfpColor]);

  return (
    <>
      <div className="toolbar">

        <div className="user-info">
          <Button
            className="inbox-button"
            color="primary"
            variant="contained"
            style={{
              marginRight: "10px",
              height: "40px",
              textTransform: "none",
            }}
            aria-controls={open ? 'basic-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            startIcon={
              <Badge 
              badgeContent=" " 
              variant="dot" 
              overlap="circular" 
              color="error"
              invisible={invites.length === 0}
              >
                <NotificationsIcon />
              </Badge>}
          >
            Invites
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            {invites.length === 0 ?
              <MenuItem className="group-invites-empty">
                No new group invites
              </MenuItem>
              :
              invites.map((group, index) => (
                <MenuItem className="group-invites" key={"group-invite-" + index}>
                  <span>{group}</span>
                  <Button
                    color="success"
                    variant="contained"
                    style={{
                      marginLeft: "10px",
                      width: "20px",
                      height: "20px",
                    }}
                    onClick={() => acceptGroupInvite(group)}
                  >
                    <CheckIcon />
                  </Button>
                  <Button
                    color="error"
                    variant="contained"
                    style={{
                      marginLeft: "10px",
                      width: "20px",
                      height: "20px",
                    }}
                    onClick={() => rejectGroupInvite(group)}
                  >
                    <CloseIcon />
                  </Button>
                </MenuItem>
              ))}
          </Menu>
          <div className="user-container">
            {!user.discord_avatar_hash 
            ?
            <Button
              className="profile-picture"
              sx={{
                backgroundColor: user.profile_picture_color,
                borderRadius: "50%",
                maxWidth: "40px",
                minWidth: "40px",
                padding: "0px",
                color: "black",
                fontSize: "20px",
                marginRight: "10px",
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Button>
            : 
            <img 
              className="profile-picture"
              src={`https://cdn.discordapp.com/avatars/${user.discord_id}/${user.discord_avatar_hash}.png`}
              alt="Profile"
              style={{
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                marginRight: "10px",
              }}
            />
            }

            <h3 className="username">{user.username}</h3>
          </div>
          <Button
            className="logout-button"
            onClick={() => logOut()}
            variant="contained"
            color="error"
            endIcon={<LogoutIcon />}
            style={{
              textTransform: "none",
            }}
          >
            Log out
          </Button>
        </div>
      </div>
    </>
  );
}

export default Toolbar;