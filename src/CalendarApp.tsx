import { useState, useEffect } from 'react';
import CalendarDay from './CalendarDay';
import './CalendarApp.css';
import Toolbar from './Toolbar';
import GroupToolbar from './GroupToolbar';
import Button from '@mui/material/Button';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

function CalendarApp(
    {
        user, 
        setToken, 
        setUser,
    }: 
    {
        user: {username: string; profile_picture_color: string; discord_avatar_hash: string; discord_id: string}, 
        setToken: React.Dispatch<React.SetStateAction<string>>, 
        setUser: React.Dispatch<React.SetStateAction<{
          username: string, profile_picture_color: string, discord_avatar_hash: string, discord_id: string}>>,
    }) {

    const [currentIntervalData, setCurrentIntervalData] = useState<any[]>([]);
    const [allGroupData, setAllGroupData] = useState<any[]>([]);
    
    const [usersInGroup, setUsersInGroup] = useState<{username: string; profile_picture_color: string; discord_avatar_hash: string; discord_id: string}[]>([]);
    const [invitedUsers, setInvitedUsers] = useState<{username: string; profile_picture_color: string, discord_avatar_hash: string; discord_id: string}[]>([]);
    const [invites, setInvites] = useState<string[]>([]);
    const [groupNames, setGroupNames] = useState<string[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<[string | undefined, number]>([groupNames[0], 0]);
    
    const isLoading = !user.username;

    const [displayAreYouSureYouWantToLeave, setDisplayAreYouSureYouWantToLeave] = useState<boolean>(false);

    useEffect(() => {
      // Only set selectedGroup if no group is currently selected and there are group names available
      if (!selectedGroup[0] && groupNames.length > 0) {
        setSelectedGroup([groupNames[0], 0]);
      }
    }, [groupNames]);

    const updateCurrentIntervals = (updatedData: any[]) => {
      for (const groupdata of updatedData){
        // Group name matches selected group
        if (groupdata[1].group == selectedGroup[0]){
          let extractDates: { date: string; intervals: { intervalName: string; users: string[] }[] }[] = []
          for (let i = 0; i < groupdata.length; i++){
            extractDates.push({
              date: groupdata[i].date,
              intervals: groupdata[i].intervals
            });
          }
          setCurrentIntervalData(extractDates);
        }
      }
    }

    useEffect(() => {
      const getUsersInCurrentGroup = async () => {
        // Get all users in the currently selected group to display them
        
        if (selectedGroup[0] == undefined){
          return;
        }
        
        const response = await fetch(`http://127.0.0.1:8000/api/get_users_in_group/${selectedGroup[0]}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        });
        const data = await response.json();
        if (response.status === 200) {
          let userList = data.user_list;
          let invitedUserList = data.invited_users_list;
          setUsersInGroup(userList);
          setInvitedUsers(invitedUserList);
        }
        else{
          console.error("Error fetching users in group: ", data);
        }
      }

      getUsersInCurrentGroup();
    }, [selectedGroup, allGroupData]);

    useEffect(() => {
      updateCurrentIntervals(allGroupData);
    }, [selectedGroup, allGroupData]);

    useEffect(() => {
      console.log("Trying to connect to WebSocket...");
      const ws = new WebSocket('ws://127.0.0.1:8000/ws/calendar');
    
      ws.onopen = () => {
        console.log('WebSocket connection established');
        ws.send(JSON.stringify({
          token: localStorage.getItem('token'),
        }));
      };

      ws.onmessage = (event) => {
        const updatedData = JSON.parse(event.data);
        console.log("Received data from WebSocket: ", updatedData);
        setAllGroupData(updatedData);

        const groupInvites = updatedData[0];
        setInvites(groupInvites.invites);
        // remove the first element which is the group invites
        updatedData.shift();

        // Get group names from the updated data
        let newGroupNames: string[] = [];
        for (const groupName of updatedData){
          newGroupNames.push(groupName[0].group)
        }
        
        setGroupNames(newGroupNames);
        
      };
  
      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
  
      return () => {
        ws.close();
      };
    }, []);

    const handleLeaveGroup = async () => {

      const response = await fetch("http://127.0.0.1:8000/api/leave_group", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          group: selectedGroup[0],
          user: user.username,
        }),
      })
      const data = await response.json();
      if (response.status === 200) {
        console.log("Left group successfully: ", data);
        // Remove the group from the group names locally and set selected
        if (groupNames.length === 1) {
          setGroupNames([]);
          setSelectedGroup([undefined, 0]);
          setCurrentIntervalData([]);
          setUsersInGroup([]);
          setInvitedUsers([]);
        }
        else {
          let updatedGroupNames = groupNames.filter(group => group !== selectedGroup[0]);
          setGroupNames(updatedGroupNames);
          setSelectedGroup([updatedGroupNames[0], 0]);
        }
      } else {
        console.error("Error leaving group: ", data);
      }
    }

    return (
      <>
        {isLoading ? (
          <div className="loading-screen">
            <h2>Loading...</h2>
          </div>
        ) : (
          <div className="calendar-app-container">
            {displayAreYouSureYouWantToLeave && (
              <div style={{
                position: 'fixed',
                width: '100%',
                height: '50%',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div className="are-you-sure-you-want-to-leave" style={{ backgroundColor: "#1b1b1b", padding: "20px", borderRadius: "10px" }}>
                  <h2>Are you sure you want to leave '{selectedGroup[0]}'?</h2>
                  <div className="are-you-sure-you-want-to-leave-buttons">
                    <Button 
                      variant="outlined" 
                      color="error" 
                      onClick={() => {
                        handleLeaveGroup();
                        setDisplayAreYouSureYouWantToLeave(false);
                      }}
                    >
                      Yes, leave
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => setDisplayAreYouSureYouWantToLeave(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="calendar-app-screen" style={{ opacity: displayAreYouSureYouWantToLeave ? 0.2 : 1 }}>
              <GroupToolbar 
                groups={groupNames} 
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
              />
              <div className="toolbar-calendar-stack">
                <Toolbar 
                  user={user}
                  setToken={setToken}
                  setUser={setUser}
                  invites={invites}
                />
                {selectedGroup[0] == undefined 
                ? (
                  <div className="current-displayed-group">
                    <h1 className="no-groups-title">Create or join a group to get started.</h1>
                  </div>
                ) : (
                <div className="current-displayed-group">
                  <Stack className="group-name-container" alignItems="center" direction="row" gap={2}>
                    <Typography variant="h3">{selectedGroup[0]}</Typography>
                    <Tooltip title="Leave Group" arrow>
                      <Button
                        sx={{
                          width: "40px",
                          height: "40px",
                        }}
                        variant="outlined"
                        color="error"
                        onClick={() => {setDisplayAreYouSureYouWantToLeave(true)}}
                        >
                        <ExitToAppIcon color="error"/>
                      </Button>
                    </Tooltip>
                  </Stack>
                  <div className="user-list-container">
                    {usersInGroup.map((user, index) => (
                      <div className="group-user-container" key={"user-"+index}>
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
                              height: "40px",
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
                        <h3 key={"user-"+index} className="group-name-subtitle">{user.username}</h3>
                      </div>
                    ))}
                    {invitedUsers.map((user, index) => (
                      <div className="invited-user-container" key={"user-"+index}>
                        {!user.discord_avatar_hash 
                        ?
                        <Tooltip
                          title="User has not accepted group invite">
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
                                height: "40px",
                            }}
                          >
                            {user.username.charAt(0).toUpperCase()}
                          </Button>
                        </Tooltip>
                        :
                        <Tooltip
                          title="User has not accepted group invite">
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
                        </Tooltip>
                        }
                        <h3 key={"user-"+index} className="group-name-subtitle">{user.username}</h3>
                      </div>
                    ))}
                  </div>
                  
                  <div className="calendar">
                    {Object.keys(currentIntervalData).map((index) => (
                      <CalendarDay 
                        key={"calendar-day-"+index} 
                        group={selectedGroup[0]}
                        user={user}
                        intervalData={currentIntervalData[Number(index)]}
                      />
                    ))}
                  </div>
                </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
}

export default CalendarApp;