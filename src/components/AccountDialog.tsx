import { Divider, Box, Button, Popover, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useGlobalState } from '../GlobalStateProvider';
import PendulumApi from '../lib/api';
import OnClickSetup from '../lib/OneClickSetup'

export default function Topbar(props: any) {
    const { state, setState } = useGlobalState();
    const [accountName, setAccountName] = useState("");
    const [accountSecret, setAccountSecret] = useState("");
    const api = PendulumApi.get();
    
    useEffect(() => {
        localStorage.setItem("state", JSON.stringify(state));
    }, [state]);

    const handleOneClickSetup = () => {
        const setup = new OnClickSetup();
        setup.createAccount();
      }
    
    const connectAccount = () => {
        const accountExtraData = api.addAccountFromStellarSeed(accountSecret, accountName);
        setState({accountName, accountSecret, accountExtraData});
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
                    padding: "20px",
                }}
            >
            <Box
                justifyContent="center"
                sx={{
                    paddingBottom: "20px"
                }}
            >
                <Button onClick={ (e) => handleOneClickSetup() } variant="contained"> Setup new account </Button>
            </Box>
            <Divider sx={{ mt: "2", mb: "2"}} />
            <Box>
            </Box>
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