"use client";

import * as React from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/theme";
import Copyright from "@/components/Copyright";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";

import SvgIcon from "@mui/material/SvgIcon";

import { ReactComponent as LogoIcon } from "@/icons/logo.svg";

const pages = [
  {
    name: "Fills",
    link: "fills",
  },
  {
    name: "Visuals",
    link: "visual",
  },
  {
    name: "History",
    link: "history",
  },
];
const settings = ["Profile", "Account", "Dashboard", "Logout"];

export default function RootLayout(props) {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
              <CssBaseline />
              <AppBar position="static">
                <Container maxWidth="xl">
                  <Toolbar disableGutters>
                    <SvgIcon component={LogoIcon} />
                    <Typography
                      variant="h6"
                      noWrap
                      component="a"
                      href="/"
                      sx={{
                        mr: 2,
                        display: { xs: "none", md: "flex" },
                        fontFamily: "monospace",
                        fontWeight: 700,
                        letterSpacing: ".3rem",
                        color: "inherit",
                        textDecoration: "none",
                      }}
                    >
                      Dive Tec
                    </Typography>

                    <Box
                      sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}
                    >
                      <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleOpenNavMenu}
                        color="inherit"
                      >
                        <MenuIcon />
                      </IconButton>
                      <Menu
                        id="menu-appbar"
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
                        sx={{ display: { xs: "block", md: "none" } }}
                      >
                        {pages.map((item) => (
                          <MenuItem
                            key={item.name}
                            onClick={handleCloseNavMenu}
                          >
                            {" "}
                            href={item.link}
                            <Typography sx={{ textAlign: "center" }}>
                              {item.name}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Menu>
                    </Box>
                    <AdbIcon
                      sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
                    />
                    <Typography
                      variant="h5"
                      noWrap
                      component="a"
                      href="#app-bar-with-responsive-menu"
                      sx={{
                        mr: 2,
                        display: { xs: "flex", md: "none" },
                        flexGrow: 1,
                        fontFamily: "monospace",
                        fontWeight: 700,
                        letterSpacing: ".3rem",
                        color: "inherit",
                        textDecoration: "none",
                      }}
                    >
                      LOGO
                    </Typography>
                    <Box
                      sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}
                    >
                      {pages.map((item) => (
                        <Button
                          key={item.name}
                          onClick={handleCloseNavMenu}
                          href={item.link}
                          sx={{ my: 2, color: "white", display: "block" }}
                        >
                          {item.name}
                        </Button>
                      ))}
                    </Box>
                    <Box sx={{ flexGrow: 0 }}>
                      <Tooltip title="Open settings">
                        <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                          <Avatar
                            alt="Remy Sharp"
                            src="/static/images/avatar/2.jpg"
                          />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        sx={{ mt: "45px" }}
                        id="menu-appbar"
                        anchorEl={anchorElUser}
                        anchorOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        keepMounted
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "right",
                        }}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                      >
                        {settings.map((setting) => (
                          <MenuItem key={setting} onClick={handleCloseUserMenu}>
                            <Typography sx={{ textAlign: "center" }}>
                              {setting}
                            </Typography>
                          </MenuItem>
                        ))}
                      </Menu>
                    </Box>
                  </Toolbar>
                </Container>
              </AppBar>

              {props.children}
              <Copyright />
            </LocalizationProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
