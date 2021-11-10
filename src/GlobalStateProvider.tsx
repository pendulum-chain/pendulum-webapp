import { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';
import { AccountKeyPairs } from './interfaces';

export interface GlobalStateInterface {
  accountSecret: string;
  accountName: string;
  accountExtraData?: AccountKeyPairs;
  infoMessage?: string;
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
