export type Node = { display_name: string; wss_endpoint: string; amm_address: string };

const rococo_wss_endpoint = process.env.REACT_APP_ROCOCO_WSS_ENDPOINT || 'wss://testnet-1.pendulum.satoshipay.tech:443';
const rococo_amm_address = process.env.REACT_APP_ROCOCO_AMM_ADDRESS || '';

export const knownNodes: Node[] = [
  {
    display_name: 'Rococo',
    wss_endpoint: rococo_wss_endpoint,
    amm_address: rococo_amm_address
  }
];

const selectedNodeKey = 'defaultNode';

export function getDefaultNode(): Node {
  const storageSelectedNode = localStorage.getItem(selectedNodeKey);
  if (storageSelectedNode) {
    return JSON.parse(storageSelectedNode);
  } else {
    return knownNodes[0];
  }
}

export function setDefaultNode(node: Node) {
  localStorage.setItem(selectedNodeKey, JSON.stringify(node));
}
