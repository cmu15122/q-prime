import React, { useState, useEffect } from "react";
import {
  useMediaQuery,
  AppBar,
  Toolbar,
  Box,
  Button,
  MenuItem,
  Menu,
  IconButton,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { styled, useTheme } from "@mui/material/styles";

import OHQueueHeader from "./OHQueueHeader";
import ChangeNameBtn from "./ChangeNameBtn";
import GoogleLogin from "../common/GoogleLogin";
import AlertOnLogout from "./dialogs/AlertOnLogout";

import { NotificationsActive } from "@mui/icons-material";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";

function createPage(page, link) {
  return { page, link };
}

const NavbarButton = styled(Button)({
  disableElevation: true,
  variant: "subtitle2",
  color: "#FFFFFF",
  backgroundColor: "transparent",
});

export default function Navbar(props: { isHome: boolean }) {
  const { isHome } = props;
  const theme = useTheme();

  const queueData = useQuery(api.home.home_get.getQueueData);
  const userData = useQuery(api.home.home_get.getUserData);
  const isAuthenticated = userData !== null && userData !== undefined;
  const isTA = isAuthenticated && userData.user_kind === "TA";
  const isOwner = isAuthenticated && userData.is_owner;
  const studentData = isAuthenticated ? userData.student_data : null;

  const { signOut } = useAuthActions();

  const isMobileView = useMediaQuery("(max-width: 1000px)");
  const [pages, setPages] = useState<any[]>([]);
  const [anchorElNav, setAnchorElNav] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);

  const [pname, setpname] = useState(userData?.preferred_name || "");

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const goToPage = (pageLink) => () => {
    window.location.href = pageLink;
  };

  useEffect(() => {
    const newPages: any[] = [];

    if (isAuthenticated && isTA) {
      newPages.push(createPage("Metrics", "metrics"));
    }
    if (isAuthenticated && (isTA || isOwner)) {
      newPages.push(createPage("Settings", "settings"));
    }

    setPages(newPages);
  }, [isAuthenticated, isTA, isOwner]);

  useEffect(() => {
    setpname(userData?.preferred_name || "");
  }, [userData?.preferred_name, setpname]);

  function handleLogout() {
    signOut();
    window.location.href = "";
  }

  function openAlert() {
    setAlertOpen(true);
  }

  function handleLogoutClicked() {
    if (studentData?.position && studentData.position !== -1) {
      openAlert();
    } else {
      handleLogout();
    }
  }

  const freezeQueueMutation = useMutation(api.home.home_mutate.freezeQueue);
  const freezeQueue = async () => {
    await freezeQueueMutation();
  };

  const unfreezeQueueMutation = useMutation(api.home.home_mutate.unfreezeQueue);
  const unfreezeQueue = async () => {
    await unfreezeQueueMutation();
  };

  const defaultNotificationPermission =
    "Notification" in window ? Notification.permission : "denied";
  const [notificationPermission, setNotificationPermission] = useState(
    defaultNotificationPermission,
  );

  const unfreezeButton = (
    <Button
      color="secondary"
      variant="contained"
      sx={{ mx: 2 }}
      onClick={async () => await unfreezeQueue()}
    >
      Unfreeze
    </Button>
  );
  const freezeButton = (
    <Button
      color="secondary"
      variant="contained"
      sx={{ mx: 2 }}
      onClick={async () => await freezeQueue()}
    >
      Freeze
    </Button>
  );

  if (isMobileView) {
    return (
      <AppBar
        position="static"
        style={{ background: theme.alternateColors.navbar }}
        enableColorOnDark
      >
        <Toolbar sx={{ display: "flex space-between" }}>
          {((pages && pages.length > 0) || isAuthenticated) && (
            <Box sx={{ flexGrow: 1, display: "flex" }}>
              <IconButton
                size="large"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="navbar-menu"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: "block" }}
              >
                {isTA &&
                  isHome &&
                  (queueData?.is_frozen ? (
                    <MenuItem onClick={unfreezeQueue}>
                      <Typography variant="subtitle2" sx={{ mx: 2 }}>
                        Unfreeze
                      </Typography>
                    </MenuItem>
                  ) : (
                    <MenuItem onClick={freezeQueue}>
                      <Typography variant="subtitle2" sx={{ mx: 2 }}>
                        Freeze
                      </Typography>
                    </MenuItem>
                  ))}
                {notificationPermission !== "granted" && (
                  <MenuItem
                    onClick={() => {
                      if ("Notification" in window) {
                        Notification.requestPermission((permission) => {
                          setNotificationPermission(permission);
                        });
                      }
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ mx: 2 }}>
                      Enable Notifications
                    </Typography>
                  </MenuItem>
                )}
                {pages?.map((page) => (
                  <MenuItem key={page.page} onClick={goToPage(page.link)}>
                    <Typography variant="subtitle2" sx={{ mx: 2 }}>
                      {page.page}
                    </Typography>
                  </MenuItem>
                ))}
                {isAuthenticated && (
                  <ChangeNameBtn
                    mobile={true}
                    pname={pname}
                    setpname={setpname}
                  />
                )}
                {isAuthenticated && (
                  <MenuItem onClick={handleLogoutClicked}>
                    <Typography variant="subtitle2" sx={{ mx: 2 }}>
                      Logout
                    </Typography>
                  </MenuItem>
                )}
              </Menu>
            </Box>
          )}

          <Box sx={{ flexGrow: 1, display: "flex" }}>
            <OHQueueHeader />
          </Box>
          <Box
            sx={{ flexGrow: 0, display: "flex", justifyContent: "flex-end" }}
          >
            {!isAuthenticated && <GoogleLogin />}
          </Box>
          <AlertOnLogout
            isOpen={alertOpen}
            setOpen={setAlertOpen}
            handleConfirm={handleLogout}
          />
        </Toolbar>
      </AppBar>
    );
  }

  // Desktop view
  return (
    <AppBar
      position="sticky"
      enableColorOnDark
      style={{ background: theme.alternateColors.navbar }}
    >
      <Toolbar sx={{ display: "flex space-between" }}>
        <Box sx={{ flexGrow: 1, display: "flex" }}>
          <OHQueueHeader />
          {isTA &&
            isHome &&
            (queueData?.is_frozen ? unfreezeButton : freezeButton)}
          {notificationPermission !== "granted" && (
            <IconButton
              color="secondary"
              onClick={() => {
                if ("Notification" in window) {
                  Notification.requestPermission((permission) => {
                    setNotificationPermission(permission);
                  });
                }
              }}
            >
              <NotificationsActive />
            </IconButton>
          )}
        </Box>
        <Box sx={{ flexGrow: 0, display: "flex", color: "#FFFFFF" }}>
          {isAuthenticated && "Currently Logged in as " + pname}
        </Box>
        <Box sx={{ flexGrow: 0, display: "flex" }}>
          {isAuthenticated && (
            <ChangeNameBtn mobile={false} pname={pname} setpname={setpname} />
          )}
        </Box>

        <Box sx={{ flexGrow: 0, display: "flex" }}>
          {pages?.map((page) => (
            <NavbarButton key={page.page} href={page.link}>
              {page.page}
            </NavbarButton>
          ))}
          {isAuthenticated ? (
            <NavbarButton onClick={handleLogoutClicked}>Logout</NavbarButton>
          ) : (
            <GoogleLogin />
          )}
        </Box>
        <AlertOnLogout
          isOpen={alertOpen}
          setOpen={setAlertOpen}
          handleConfirm={handleLogout}
        />
      </Toolbar>
    </AppBar>
  );
}
