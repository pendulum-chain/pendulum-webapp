import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { SxProps } from '@mui/system';
import React from 'react';
import { useGlobalState } from '../../GlobalStateProvider';
import PendulumApi from '../../lib/api';
import { getDefaultNode, knownNodes, Node, setDefaultNode } from '../../lib/nodes';

interface NodeSelectionProps {
  onSave: () => void;
}

function NodeSelection(props: NodeSelectionProps) {
  const { state, setState } = useGlobalState();
  const [selectedNode, setSelectedNode] = React.useState<Node>(state.currentNode || getDefaultNode());

  const [customNodeInputError, setCustomNodeInputError] = React.useState<string | null>(null);
  const [customNodeEndpoint, setCustomNodeEndpoint] = React.useState<string>('ws://localhost:8844');
  const [customAMMAddress, setCustomAMMAddress] = React.useState<string>(selectedNode.amm_address);
  const [showCustomNodeField, setShowCustomNodeField] = React.useState(selectedNode?.display_name === 'Custom');

  const [loading, setLoading] = React.useState(false);

  const handleChange = (event: SelectChangeEvent) => {
    const newNodeDisplayName = event.target.value;
    const existingNode = knownNodes.find((n) => n.display_name === newNodeDisplayName);
    if (existingNode) {
      setShowCustomNodeField(false);
      setSelectedNode(existingNode);
    } else {
      setShowCustomNodeField(true);
      setSelectedNode({ display_name: 'Custom', wss_endpoint: customNodeEndpoint, amm_address: customAMMAddress });
    }
  };

  const handleCustomNodeEndpointChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      setCustomNodeInputError('Invalid WSS endpoint URL');
    } else {
      setCustomNodeInputError(null);
    }

    setCustomNodeEndpoint(url);
  };

  const onSave = async () => {
    setLoading(true);
    if (selectedNode?.display_name === 'Custom') {
      const customNode = { ...selectedNode, url: customNodeEndpoint, amm_address: customAMMAddress };
      // await initialization before changing global state because
      // other components listen to state and would use potentially outdated api
      try {
        await PendulumApi.get().init(customNode.url);

        setState({
          ...state,
          currentNode: customNode,
          toast: { message: `Connected to ${customNode.url}`, type: 'success' }
        });
        setDefaultNode(customNode);
        props.onSave();
      } catch (error) {
        // change currentNode even on error to prevent inconsistency
        setState({
          ...state,
          currentNode: customNode,
          toast: { message: `Failed to connect to ${customNode.url}`, type: 'error' }
        });
      }
    } else if (selectedNode) {
      try {
        await PendulumApi.get().init(selectedNode.wss_endpoint);
        setDefaultNode(selectedNode);
        setState({
          ...state,
          currentNode: selectedNode,
          toast: { message: `Connected to ${selectedNode.wss_endpoint}`, type: 'success' }
        });
        props.onSave();
      } catch (error) {
        // change currentNode even on error to prevent inconsistency
        setState({
          ...state,
          currentNode: selectedNode,
          toast: { message: `Failed to connect to ${selectedNode.wss_endpoint}`, type: 'error' }
        });
      }
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minWidth: 120, margin: 1 }}>
      <Typography variant='h5' sx={{ marginBottom: 2 }}>
        Node selection
      </Typography>
      <FormControl fullWidth>
        <InputLabel id='node-select-label'>Node</InputLabel>
        <Select
          labelId='node-select-label'
          id='node-select'
          value={selectedNode?.display_name}
          label='Node'
          onChange={handleChange}
        >
          {knownNodes.map((node, index) => (
            <MenuItem key={index} value={node.display_name}>
              {node.display_name}
            </MenuItem>
          ))}
          <MenuItem key='custom' value='Custom'>
            Custom node
          </MenuItem>
        </Select>
        {showCustomNodeField && (
          <>
            <TextField
              label='Custom Node Endpoint'
              error={Boolean(customNodeInputError)}
              helperText={customNodeInputError}
              onChange={handleCustomNodeEndpointChange}
              value={customNodeEndpoint}
              sx={{ marginTop: 2 }}
              placeholder='wss://...'
            />
            <TextField
              label='AMM Address (optional)'
              onChange={(e) => setCustomAMMAddress(e.target.value)}
              value={customAMMAddress}
              sx={{ marginTop: 2 }}
              placeholder='5CcuLN...'
            />
          </>
        )}
        <LoadingButton
          disabled={Boolean(customNodeInputError)}
          loading={loading}
          onClick={onSave}
          sx={{ marginTop: 1 }}
        >
          Save
        </LoadingButton>
      </FormControl>
    </Box>
  );
}

interface Props {
  buttonStyle?: SxProps;
}

function NodeSelectionDrawer(props: Props) {
  const { state } = useGlobalState();

  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }

    setOpen(open);
  };

  const closeDrawer = () => setOpen(false);

  return (
    <>
      <Tooltip title={state.currentNode?.wss_endpoint || ''}>
        <Button onClick={toggleDrawer(true)} endIcon={<KeyboardArrowDownIcon />} color='primary' sx={props.buttonStyle}>
          {state.currentNode ? state.currentNode.display_name : 'Not connected'}
        </Button>
      </Tooltip>
      <Drawer anchor='left' open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 300, padding: 2 }} role='presentation'>
          <NodeSelection onSave={closeDrawer} />
        </Box>
      </Drawer>
    </>
  );
}

export default NodeSelectionDrawer;
