import { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { AccountKeyPairs } from './interfaces';
import { Node } from './lib/nodes';

export interface Toast {
  message: string;
  type: 'success' | 'error';
}
export interface GlobalStateInterface {
  accountSecret: string;
  accountName: string;
  accountExtraData?: AccountKeyPairs;
  currentNode: Node;
  infoMessage?: string;
  toast?: Toast;
}

const GlobalStateContext = createContext({
  state: {} as Partial<GlobalStateInterface>,
  setState: {} as Dispatch<SetStateAction<Partial<GlobalStateInterface>>>
});

const GlobalStateProvider = ({
  children,
  value = {} as GlobalStateInterface
}: {
  children: React.ReactNode;
  value?: Partial<GlobalStateInterface>;
}) => {
  const [state, setState] = useState(value);
  return <GlobalStateContext.Provider value={{ state, setState }}>{children}</GlobalStateContext.Provider>;
};

const useGlobalState = () => useContext(GlobalStateContext);

export { GlobalStateProvider, useGlobalState };
