import { useState, useEffect } from 'react'
import './CalendarDay.css'
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';

const CalendarDay = (
  {
    group, 
    user,
    intervalData,
  }: 
  {
    group: string | undefined,
    user: {username: string; profile_picture_color: string; discord_avatar_hash: string; discord_id: string},
    intervalData: { 
      date: string; 
      intervals: { 
        intervalName: string; 
        accepted_and_declined_users: {
          username: string;
          accepted: Number;
          profile_picture_color: string; 
          discord_avatar_hash: string;
          discord_id: string;
        }[],
      }[] },
  }) => {

    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [curIntervalData, setCurIntervalData] = useState(intervalData);

    const isLoading = !user;

    useEffect(() => {
      setCurIntervalData(intervalData);
    }, [intervalData]);

    const updateAcceptedUser = async (interval: string) => {

      // Update locally before updating server to display changes immediately
      const updatedIntervals = {
        ...curIntervalData,
        intervals: curIntervalData.intervals.map((key) => {
          if (key.intervalName === interval) {
            return {
              ...key,
              accepted_and_declined_users: key.accepted_and_declined_users.map((u) =>
                u.username === user.username
                  ? { ...u, accepted: u.accepted != 1 ? 1 : 0 }
                  : u
              ),
            };
          }
          return key;
        }),
      };
      setCurIntervalData(updatedIntervals);

      // Add user as accepted if user has not accepted yet, or remove user from accepted if user has already accepted
      const isSelected = selectedSlots.includes(interval);
      const updatedSlots = isSelected
          ? selectedSlots.filter(s => s !== interval)
          : [...selectedSlots, interval];
      setSelectedSlots(updatedSlots);

      try {
          const response = await fetch("http://127.0.0.1:8000/api/update_accepted_interval", {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                  user: user.username,
                  date: intervalData["date"],
                  interval: interval,
                  group: group,
                  available: !isSelected
              })
          });

          if (!response.ok) {
              console.error(response);
          }
      } catch (error) {
          console.error('Error updating availability:', error);
      }
    };

    const updateDeclinedUser = async (interval: string) => {

      // Update locally before updating server to display changes immediately
      const updatedIntervals = {
        ...curIntervalData,
        intervals: curIntervalData.intervals.map((key) => {
          if (key.intervalName === interval) {
            return {
              ...key,
              accepted_and_declined_users: key.accepted_and_declined_users.map((u) =>
                u.username === user.username
                  ? { ...u, accepted: u.accepted != 2 ? 2 : 0 }
                  : u
              ),
            };
          }
          return key;
        }),
      };

      setCurIntervalData(updatedIntervals);
      
      // Add user as declined if user has not declined yet, or remove user from declined if user has already declined
      const isSelected = selectedSlots.includes(interval);
        const updatedSlots = isSelected
            ? selectedSlots.filter(s => s !== interval)
            : [...selectedSlots, interval];

        setSelectedSlots(updatedSlots);
        try {
            const response = await fetch("http://127.0.0.1:8000/api/update_declined_interval", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    user: user.username,
                    date: intervalData["date"],
                    interval: interval,
                    group: group,
                    available: !isSelected
                })
            });

            if (!response.ok) {
                console.error(response);
            }
        } catch (error) {
            console.error('Error updating availability:', error);
        }
    };

    return isLoading ? <div className="loading-calendar-day">Loading...</div> : (
      <div className="calendar-day">
        <h3 className="day-header">{intervalData["date"]}</h3>
        
        <div className="time-slots">
          {curIntervalData["intervals"].map((key) => {
            let label = key.intervalName;
            switch (key.intervalName) {
              case "Morning": 
                label += " (8 - 12)";
                break;
              case "Afternoon":
                label += " (12 - 18)";
                break;
              case "Evening":
                label += " (18 - 22)";
                break;
            }
            
            let allUsersHaveAccepted: boolean = true;
            let anyUserDeclined: boolean = false;
            
            let userHasAccepted: boolean = false;
            let userHasDeclined: boolean = false;
            
            for (const intervalUser of key["accepted_and_declined_users"]) {
              if (intervalUser.accepted != 1) {
                allUsersHaveAccepted = false;
              }
              if (intervalUser.accepted == 2) {
                anyUserDeclined = true;
              }
              if (intervalUser.username == user.username) {
                // 1 means accepted, 2 means declined, 0 means not answered
                userHasAccepted = intervalUser.accepted == 1;
                userHasDeclined = intervalUser.accepted == 2;
              }
            }

            return (
              <div key={`calendar-interval-${key.intervalName}`}>
                <span className="time-label">{label}</span>
                <div className="time-slot-and-buttons">
                  <div 
                    key={`time-slot-${key.intervalName}`}
                    className={`time-slot`}
                    style={{
                      backgroundColor: anyUserDeclined ? "#aa4444" : (allUsersHaveAccepted ? "#44aa44" : "#444444"),
                    }}
                  >
                    <div className="accepted-users-profile-pictures">
                    
                      {// Display user pfps with borders green if accepted, red if declined, grey if not answered
                      key["accepted_and_declined_users"].map((u) => (
                        !u.discord_avatar_hash ?
                        <Tooltip 
                          key={`user-${u.username}`}
                          placement="top" 
                          title={u.username} 
                          arrow>
                          <Button 
                            className="profile-picture"
                            key={`user-${u.username}`}
                            sx={{
                                backgroundColor: u.profile_picture_color,
                                borderRadius: "50%",
                                borderColor: u.accepted == 1 ? "green" : u.accepted == 2 ? "red" : "white",
                                borderWidth: "2px",
                                borderStyle: "solid",
                                maxWidth: "30px",
                                minWidth: "30px",
                                minHeight: "30px",
                                maxHeight: "30px",
                                padding: "0px",
                                color: "black",
                                fontSize: "15px",
                                marginRight: "2px",
                                display: "inline-block",
                                verticalAlign: "middle",
                                lineHeight: "normal",
                            }}
                          >
                            {u.username.charAt(0).toUpperCase()}
                          </Button>
                        </Tooltip>
                        :
                        <Tooltip 
                          placement="top" 
                          title={u.username} 
                          arrow>
                          <Button
                            className="profile-picture"
                            key={`user-${u.username}`}
                            sx={{
                              backgroundColor: "transparent",
                              borderRadius: "50%",
                              borderColor: u.accepted == 1 ? "green" : u.accepted == 2 ? "red" : "white",
                              borderWidth: "2px",
                              borderStyle: "solid",
                              maxWidth: "30px",
                              minWidth: "30px",
                              minHeight: "30px",
                              maxHeight: "30px",
                              padding: "0px",
                              marginRight: "2px",
                              display: "inline-block",
                              verticalAlign: "middle",
                              lineHeight: "normal",
                              overflow: "hidden",
                            }}
                          >
                            <Avatar
                              src={`https://cdn.discordapp.com/avatars/${u.discord_id}/${u.discord_avatar_hash}.png`}
                              sx={{
                                width: "26px",
                                height: "26px",
                                margin: 0,
                                padding: 0,
                                backgroundColor: "transparent",
                              }}
                            />
                          </Button>
                        </Tooltip>
                      ))}
                    </div>
                  </div>
                  <div className="accept-decline-buttons">
                    <Button
                      color="success"
                      variant="text"
                      sx={{
                        width: "32px",
                        minWidth: "32px",
                        height: "64px",
                        minHeight: "64px",
                        justifySelf: "right",
                        borderRadius: "8px",
                        border: "1px solid white",
                        backgroundColor: userHasAccepted && !userHasDeclined ? "#008800" : "#999999",
                        color: userHasAccepted ? "#dddddd" : "#008800",
                        "&:hover": {
                          backgroundColor: userHasAccepted && !userHasDeclined ? "#00aa00" : "#bbbbbb",
                        },
                      }}
                      
                      onClick={() => updateAcceptedUser(key.intervalName)}
                    > <CheckIcon fontSize="small" /></Button>
                    <Button
                      color="error"
                      variant="text"
                      sx={{
                        width: "32px",
                        minWidth: "32px",
                        height: "64px",
                        minHeight: "64px",
                        justifySelf: "right",
                        borderRadius: "8px",
                        border: "1px solid white",
                        backgroundColor: userHasDeclined ? "#880000" : "#999999",
                        color: userHasDeclined ? "#dddddd" : "#880000",
                        "&:hover": {
                          backgroundColor: userHasDeclined ? "#aa0000" : "#bbbbbb",
                        },
                      }}
                      onClick={() => updateDeclinedUser(key.intervalName)}
                    > <CloseIcon fontSize="small" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

export default CalendarDay;