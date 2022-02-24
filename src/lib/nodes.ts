export type Node = { display_name: string; url: string; amm_address: string };

const rococo_amm_address = process.env.REACT_APP_ROCOCO_AMM_ADDRESS || '';
const self_hosted_amm_address = process.env.REACT_APP_SELF_HOSTED_AMM_ADDRESS || '';

export const knownNodes: Node[] = [
  {
    display_name: 'Rococo Testnet',
    url: 'wss://testnet-1.pendulum.satoshipay.tech:443',
    amm_address: rococo_amm_address
  },
  {
    display_name: 'Self-hosted Testnet',
    url: 'wss://testnet-1.pendulum.satoshipay.tech:443',
    amm_address: self_hosted_amm_address
  }
];

const selectedNodeKey = 'selectedNode';

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
