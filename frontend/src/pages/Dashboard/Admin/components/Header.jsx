import { Typography, Box, IconButton, Tooltip } from "@mui/material";
import { LogoutOutlined } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  logoutUser,
  selectIsAuthenticated,
} from "../../../../redux/slices/authSlice"; // Update this path

const Header = ({ title }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      // Optional: Add navigation to login page if needed
      // navigate('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Box
      mb="30px"
      display="flex"
      justifyContent="space-between"
      alignItems="center"
    >
      <Typography variant="h2" fontWeight="bold" sx={{ m: "0 0 5px 0" }}>
        {title}
      </Typography>

      {isAuthenticated && (
        <Tooltip title="Logout">
          <IconButton
            onClick={handleLogout}
            sx={{
              color: "text.primary",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
          >
            <LogoutOutlined />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default Header;
