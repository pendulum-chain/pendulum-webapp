import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import React from 'react';
import { useGlobalState } from '../../GlobalStateProvider';
import { getDefaultNode, knownNodes, Node, setDefaultNode } from '../../lib/nodes';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import PendulumApi from '../../lib/api';

interface NodeSelectionProps {
  onSave: () => void;
}

function NodeSelection(props: NodeSelectionProps) {
  const { state, setState } = useGlobalState();
  const [selectedNode, setSelectedNode] = React.useState<Node>(state.currentNode || getDefaultNode());

  const [customNodeURL, setCustomNodeURL] = React.useState<string>(selectedNode.url);
  const [customAMMAddress, setCustomAMMAddress] = React.useState<string>(selectedNode.amm_address);
  const [showCustomNodeField, setShowCustomNodeField] = React.useState(selectedNode?.display_name === 'Custom');

  const handleChange = (event: SelectChangeEvent) => {
    const newNodeDisplayName = event.target.value;
    const existingNode = knownNodes.find((n) => n.display_name === newNodeDisplayName);
    if (existingNode) {
      setShowCustomNodeField(false);
      setSelectedNode(existingNode);
    } else {
      setShowCustomNodeField(true);
      setSelectedNode({ display_name: 'Custom', url: customNodeURL, amm_address: customAMMAddress });
    }
  };

  const onSave = () => {
    if (selectedNode?.display_name === 'Custom') {
      const customNode = { ...selectedNode, url: customNodeURL, amm_address: customAMMAddress };
      PendulumApi.get().init(customNode.url);
      setState({ ...state, currentNode: customNode });
      setDefaultNode(customNode);
    } else if (selectedNode) {
      PendulumApi.get().init(selectedNode.url);
      setDefaultNode(selectedNode);
      setState({ ...state, currentNode: selectedNode });
    }

    props.onSave();
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
              label='Custom Node URL'
              onChange={(e) => setCustomNodeURL(e.target.value)}
              value={customNodeURL}
              sx={{ marginTop: 2 }}
              placeholder='ws://...'
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
        <Button onClick={onSave} sx={{ marginTop: 1 }}>
          Save
        </Button>
      </FormControl>
    </Box>
  );
}

function NodeSelectionDrawer() {
  const { state } = useGlobalState();

  console.log('state', state);

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
    <div>
      <Button onClick={toggleDrawer(true)} endIcon={<KeyboardArrowDownIcon />} color='primary'>
        {state.currentNode ? state.currentNode.display_name : 'Not connected'}
      </Button>
      <Drawer anchor='left' open={open} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 300, padding: 2 }} role='presentation'>
          <NodeSelection onSave={closeDrawer} />
        </Box>
      </Drawer>
    </div>
  );
}

export default NodeSelectionDrawer;
