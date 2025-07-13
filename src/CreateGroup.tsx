import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateGroup.css';
import CircularProgress from '@mui/material/CircularProgress';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Button, Chip, InputAdornment } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function CreateGroup({ creatorUsername }: { creatorUsername: string | null}) {
  const [groupname, setGroupname] = useState('');
  const [users, setUsers] = useState<string[]>(creatorUsername ? [creatorUsername] : []);
  const [currentUser, setCurrentUser] = useState('');
  const [error, setError] = useState('');
  const [isLoadingOverlay, setIsLoadingOverlay] = useState(false);
  const navigate = useNavigate();

  const isReady = !!creatorUsername;

  const handleCreateGroup = async (e: React.FormEvent) => {
    if (groupname === '') {
      setError('Please enter a group name');
      return;
    }
    e.preventDefault();
    setIsLoadingOverlay(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/create_group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          groupname: groupname,
          users: users,
          creator: creatorUsername
        })
      });
      const data = await response.json();
      setIsLoadingOverlay(false);
      if (response.status === 201) {
        navigate('/home');
      } else {
        setError(data.error || 'Failed to create group');
      }
    } 
    catch (error) {
      setIsLoadingOverlay(false);
      setError('An error occurred while creating the group.');
    }
  };

  const addUser = async (e: React.FormEvent) => {
    // Check if entered user exists and then add them to the group
    e.preventDefault();
    const response = await fetch(`http://127.0.0.1:8000/api/get_user_by_username/${currentUser}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    });
    await response.json();
    if (response.status !== 200) {
      setError('User not found');
      return;
    }
    setError('');
    if (currentUser && !users.includes(currentUser)) {
      setUsers(users => [...users, currentUser]);
      setCurrentUser('');
    }
  };

  const handleRemoveUser = (userToRemove: string) => {
    setUsers(users.filter(user => user !== userToRemove));
  };

  return (
    <div className="create-group-container">
      {isLoadingOverlay && (
        <div style={{
          position: 'fixed',
          width: '100%',
          height: '50%',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <CircularProgress size={80} thickness={5} style={{ color: 'white' }} />
        </div>
      )}
      <h1 style={{opacity: isLoadingOverlay ? 0.2 : 1}}>Create Group</h1>
      {error && <p className="error" style={{ color: "red" }}>{error} </p>}
      <Box className="create-group-screen"
        component="form"
        sx={{
          opacity: isLoadingOverlay ? 0.2 : 1,
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
        >
            {!isReady ? (
                <p>Loading...</p>
            ) : (
                <>
                  <TextField 
                      className="create-group-groupname" 
                      label="Group Name" 
                      variant="outlined"
                      value={groupname}  
                      onChange={(e) => setGroupname(e.target.value)}
                  />
                  <div className="add-user-field" >
                      <div className="add-user-form" onSubmit={addUser}>
                        <TextField
                          className="add-user-input-field"
                          label="Add a user"
                          variant="outlined"
                          color="primary"
                          value={currentUser}
                          onSubmit={addUser}
                          onChange={(e) => setCurrentUser(e.target.value)}
                          slotProps={{
                            input:{
                              startAdornment: (
                                <>
                                  {users.filter(user2 => user2 !== creatorUsername).map((user) => (
                                    <Chip
                                      className={"group-users-item"}
                                      key={user}
                                      onDelete={() => handleRemoveUser(user)}
                                      label={user}
                                      color="primary"
                                      variant="filled"
                                      size="small"
                                      style={{ marginRight: 8 }}
                                    />
                                  ))}
                                </>
                              ),
                              endAdornment: (
                                <InputAdornment position="end" >
                                  <Button 
                                  sx={{ 
                                    borderWidth: "2px"
                                  }} 
                                    onClick={addUser} 
                                    type="submit"
                                    color="primary" 
                                    variant="outlined">
                                    <AddIcon />
                                  </Button>
                                </InputAdornment>
                              )
                            }
                          }}
                        />
                      </div>
                  </div>
                    
                  <Button
                    className="create-group-button"
                    variant="outlined"
                    color="success"
                    style={{ borderWidth: "2px"}}
                    onClick={handleCreateGroup}
                  >
                    Create Group
                  </Button>
                  <div className="margin" style={{height: "20xp"}}/>
                  <Button
                    className="cancel-button"
                    variant="outlined"
                    color="error"
                    style={{ borderWidth: "2px"}}
                    onClick={() => navigate('/home')}
                  >
                    Cancel
                  </Button>
                </>
              )}
          </Box>
      </div>
    );
}

export default CreateGroup;