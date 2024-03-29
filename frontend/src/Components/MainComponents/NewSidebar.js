import * as React from "react"
import GlobalStyles from "@mui/joy/GlobalStyles"

import Box from "@mui/joy/Box"

import Divider from "@mui/joy/Divider"

import List from "@mui/joy/List"
import ListItem from "@mui/joy/ListItem"
import ListItemButton, { listItemButtonClasses } from "@mui/joy/ListItemButton"
import ListItemContent from "@mui/joy/ListItemContent"
import Typography from "@mui/joy/Typography"
import Sheet from "@mui/joy/Sheet"
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded"

import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import InsertChartRoundedIcon from '@mui/icons-material/InsertChartRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

import {ReactComponent as Logo} from "../../LOGO-SoC-RGB.svg";


export const closeSidebar = () => {
  if (typeof document !== 'undefined') {
    document.documentElement.style.removeProperty('--SideNavigation-slideIn');
    document.body.style.removeProperty('overflow');
  }
};

function Toggler({ defaultExpanded = false, renderToggle, children }) {
  const [open, setOpen] = React.useState(defaultExpanded)
  return (
    <React.Fragment>
      {renderToggle({ open, setOpen })}
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "0.2s ease",
          "& > *": {
            overflow: "hidden"
          }
        }}
      >
        {children}
      </Box>
    </React.Fragment>
  )
}

export default function NewSidebar({activePage, setActivePage}) {
  return (
    <Sheet
      className="Sidebar"
      sx={{
        position: {
          xs: "fixed",
          md: "sticky"
        },
        transform: {
          xs: "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1)))",
          md: "none"
        },
        transition: "transform 0.4s, width 0.4s",
        zIndex: 10000,
        height: "100vh",
        width: "var(--Sidebar-width)",
        top: 0,
        p: 2,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2, 
        borderRight: "1px solid",
        borderColor: "divider",
        boxSizing: "border-box"
      }}
    >
      <GlobalStyles
        styles={theme => ({
          ":root": {
            "--Sidebar-width": "200px",
            [theme.breakpoints.up("lg")]: {
              "--Sidebar-width": "240px"
            }
          }
        })}
      />
      <Box
        className="Sidebar-overlay"
        sx={{
          position: "fixed",
          zIndex: 9998,
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          opacity: "var(--SideNavigation-slideIn)",
          backgroundColor: "var(--joy-palette-background-backdrop)",
          transition: "opacity 0.4s",
          transform: {
            xs:
              "translateX(calc(100% * (var(--SideNavigation-slideIn, 0) - 1) + var(--SideNavigation-slideIn, 0) * var(--Sidebar-width, 0px)))",
            lg: "translateX(-100%)"
          }
        }}
        onClick={() => closeSidebar()}
      />
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        {/* <IconButton variant="soft" color="primary" size="sm">
          <BrightnessAutoRoundedIcon />
        </IconButton> */}
        <Logo style={{height:70}} />
        
      </Box>
      <Typography level="title-lg">Urban Data Centre</Typography>

      <Box
        sx={{
          minHeight: 0,
          overflow: "hidden auto",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5
          }
        }}
      >
        {/* This is where to set the pages on the sidebar (Home, Search, etc.) */}
        <List
          size="sm"
          sx={{
            gap: 1,
            "--List-nestedInsetStart": "30px",
            "--ListItem-radius": theme => theme.vars.radius.sm
          }}
        >
          <ListItem sx={{userSelect: "none"}}>
            <ListItemButton onClick={() => setActivePage("dashboard")}>
              <InsertChartRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm" sx={{...(activePage === "dashboard" && {fontWeight:"bold"})}}>Dashboard</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <ListItem sx={{userSelect: "none"}}>
            <ListItemButton onClick={() => setActivePage("search")}>
              <DashboardRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm" sx={{...(activePage === "search" && {fontWeight:"bold"})}}>Search Indicators</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>

          <Divider />

          <ListItem sx={{userSelect: "none"}}>
            <ListItemButton onClick={() => setActivePage("faq")}>
              <HelpOutlineRoundedIcon />
              <ListItemContent>
                <Typography level="title-sm" sx={{...(activePage === "faq" && {fontWeight:"bold"})}}>FAQ</Typography>
              </ListItemContent>
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      <Divider />
      <Box
        sx={{
          
          overflow: "hidden auto",
          // flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          [`& .${listItemButtonClasses.root}`]: {
            gap: 1.5
          }
        }}
      >
        <List
          size="sm"
          sx={{
            gap: 1,
            "--List-nestedInsetStart": "30px",
            "--ListItem-radius": theme => theme.vars.radius.sm
          }}
        >
          <ListItem>
            <ListItemButton>
              <ListItemContent>
                <a href="#">
                  <Typography level="title-sm">Urban Data Centre</Typography>
                </a>
              </ListItemContent>
              <OpenInNewRoundedIcon />
            </ListItemButton>
            
          </ListItem>

          <ListItem>
            <ListItemButton>
              <ListItemContent>
                <a href="#">
                  <Typography level="title-sm">School of Cities</Typography>
                </a>
              </ListItemContent>
              <OpenInNewRoundedIcon />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Sheet>
  )
}
