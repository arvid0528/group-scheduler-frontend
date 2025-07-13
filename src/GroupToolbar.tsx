import { useNavigate } from 'react-router-dom';
import './GroupToolbar.css';

import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';

function GroupToolbar(
  {
    groups,
    selectedGroup, 
    setSelectedGroup, 
  }:
  {
    groups: string[],
    selectedGroup: [string | undefined, number], 
    setSelectedGroup: React.Dispatch<React.SetStateAction<[string | undefined, number]>>, 
  }) {
  const navigate = useNavigate();
  
  // Cut off group name if it is too long
  const stringCutoff = (groupName: string) => {
    if (groupName.length > 18){
      return groupName.substring(0, 15) + "...";
    }
    else {
      return groupName;
    }
  }

  return (
    <div className="groups-toolbar">
        
        <div className="group-scheduler-logo-small">
          <Button 
            key={`user-G}`}
            sx={{
              background: 'linear-gradient(to right, #2196f3, #d500f9)',
              borderRadius: "50%",
              borderColor: "white",
              borderWidth: "2px",
              borderStyle: "solid",
              maxWidth: "80px",
              minWidth: "80px",
              minHeight: "80px",
              maxHeight: "80px",
              padding: "0px",
              color: "white",
              fontSize: "40px",
              display: "inline-block",
              verticalAlign: "middle",
              lineHeight: "normal",              
            }}
          >GS
          </Button>
        </div>

        <div className="groups">
            {groups.map((group, index) => (
                <Button
                variant="contained"
                color="primary"
                sx={{
                    borderBottomRightRadius: "25px",
                    width: "180px",
                    marginBottom: "10px",
                    textTransform: "none",
                    border: index == selectedGroup[1] ? "1px solid #ffffff" : "none",
                    backgroundColor: index == selectedGroup[1] ? "primary.light" : "primary.main",
                    "&:hover": {
                    backgroundColor: "primary.light",
                    },
                }}
                key={"group-item-" + index}
                onClick={() => setSelectedGroup([group, index])}
                >
                {stringCutoff(group)}
                </Button>
            ))}
            <Button
                variant="contained"
                sx={{
                borderBottomRightRadius: "25px",
                width: "180px",
                marginBottom: "10px",
                textTransform: "none",
                backgroundColor: "#4CAF50",
                "&:hover": {
                    backgroundColor: "#5DB061",
                },
                }}
                endIcon={<AddIcon />}
                onClick={() => navigate("/create-group")}
            >
                Create Group
            </Button>
        </div>
    </div>

  );
}

export default GroupToolbar;