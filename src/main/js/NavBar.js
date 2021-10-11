import React from "react";
import {NavLink} from "react-router-dom";

import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
} from "@mui/material";
import GitHubIcon from '@mui/icons-material/GitHub';
import PersonIcon from '@mui/icons-material/Person';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import AuthService from "./AuthService";
import {LoginDialog, RegisterDialog} from "./formDialog";
import axios from "axios";
import authHeader from "./authHeader";

// TODO: this navbar also handles logic for expiring logins... that is not very clean
export class NavBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = {path: "/"};

        this.testJwt();
    }

    // test if we have a token and whether it is still valid
    // if not we log out
    testJwt() {
        if (AuthService.getCurrentUser()) {
            axios.get('/api/user/profile', { headers: authHeader() })
                .then(/* token is valid, we do not have to do anything */)
                .catch(_ => {AuthService.logout(); this.props.onUserChange()});
        }
    }

    // also test every hour (the JWT are only good for a limited amount of time
    componentDidMount() {
        this.interval = setInterval(() => this.testJwt(), 60*60*1000);
        this.setState({path: location.pathname})
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    tabChanged(e) {
        // this seems very brittle. Why do I do this?
        this.setState({path: e.target.parentElement.pathname});
        console.log(e);
    }

    render() {
        return(
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ marginRight: "3em" }}>
                            {this.props.section}
                        </Typography>

                        <NavLink to="/" className={"navlink"}>
                            <Button color="inherit" startIcon={<SportsEsportsIcon />}>
                                Game
                            </Button>
                        </NavLink>

                        {this.props.currentUser &&
                        <NavLink to="/profile" className={"navlink"}>
                            <Button color="inherit" startIcon={<PersonIcon />}>
                                Profile
                            </Button>
                        </NavLink>
                        }

                        <Button
                            color="inherit"
                            href={"https://github.com/surt91/multiJSnake"}
                            startIcon={<GitHubIcon />}
                        >
                            GitHub
                        </Button>

                        {this.props.currentUser &&
                        <Button color="inherit" startIcon={<LogoutIcon />} onClick={_ => {
                            AuthService.logout();
                            this.props.onUserChange()

                        }}>
                            Logout
                        </Button>
                        }
                        {!this.props.currentUser &&
                        <LoginDialog
                            buttonText={"Login"}
                            button={{color:"inherit", startIcon:<LoginIcon />}}
                            authService={AuthService}
                            onSuccess={_ => this.props.onUserChange()}
                        />
                        }
                        {!this.props.currentUser &&
                        <RegisterDialog
                            buttonText={"Register"}
                            button={{color:"inherit"}}
                            authService={AuthService}
                            onSuccess={_ => this.props.onUserChange()}
                        />
                        }
                    </Toolbar>
                </AppBar>
            </Box>
        );
    }
}


