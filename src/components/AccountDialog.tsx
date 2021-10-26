import {Box, Button, Popover, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useGlobalState } from '../GlobalStateProvider';
import PendulumApi from '../lib/api';

export default function Topbar(props: any) {
    const { state, setState } = useGlobalState();
    const [accountName, setAccountName] = useState("");
    const [accountSecret, setAccountSecret] = useState("");
    const api = PendulumApi.get();
    
    const connectAccount = () => {
        setState({accountName, accountSecret})
        api.addAccountFromStellarSeed(accountSecret, accountName);
        props.onClose();
    }

    return (
        <Popover
            open={props.open}
            onClose={props.onClose}
            anchorEl={props.caller}
            sx={{
                position: "absolute",
                top: "70px"                
            }}
        >
            <Box
                sx={{
                    width: "400px",
                    padding: "20px"
                }}
            >
                <Typography variant="h6">{ state.accountSecret ? "Edit" : "Connect"} account</Typography>
                <Typography variant="caption">
                    To import your existing Stellar account into Pendulum, please paste your secret key here.
                    It wont be shared, only stored locally.
                </Typography>
                <TextField
                    autoFocus
                    id="name"
                    label="Account name"
                    type="text"
                    fullWidth
                    variant="outlined"
                    style={{ marginBottom: "2em", marginTop: "2em" }}
                    defaultValue={state.accountName}
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                />
                <TextField
                    autoFocus
                    id="secret-key"
                    label="Stellar secret key"
                    type="text"
                    fullWidth
                    variant="outlined"
                    style={{ marginBottom: "2em" }}
                    defaultValue={state.accountSecret}
                    value={accountSecret}
                    onChange={(e) => setAccountSecret(e.target.value)}
                />
                <Button onClick={props.onClose}>Cancel</Button>
                <Button onClick={connectAccount}>Connect account</Button>
            </Box>
        </Popover>
    )
}