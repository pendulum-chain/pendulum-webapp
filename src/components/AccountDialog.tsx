import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
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
        <Dialog open={props.open} onClose={props.onClose}>
            <DialogTitle>Connect account</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To import your existing Stellar account into Pendulum, please paste your secret key here.
                    It wont be shared, only stored locally.
                </DialogContentText>
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
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>Cancel</Button>
                <Button onClick={connectAccount}>Connect account</Button>
            </DialogActions>
        </Dialog>
    )
}