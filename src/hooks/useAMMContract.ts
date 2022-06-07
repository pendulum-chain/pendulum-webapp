import PendulumApi, { AMMContract } from '../lib/api';
import React from 'react';
import { useGlobalState } from '../GlobalStateProvider';

export function useAMMContract(): AMMContract | undefined {
  const { state } = useGlobalState();

  const contract = React.useMemo(() => {
    try {
      if (state.currentNode?.amm_address && state.accountExtraData?.address) {
        const api = PendulumApi.get();

        if (state.accountExtraData === undefined) return;
        const userKeypair = api.getSubstrateKeypairfromStellarSecret(state.accountExtraData.stellar_seed);

        if (userKeypair) {
          if (userKeypair.isLocked) {
            try {
              userKeypair.unlock(undefined);
            } catch {}
          }

          return api.getAMMContract(userKeypair, state.currentNode.amm_address);
        } else {
          return undefined;
        }
      }
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }, [state.accountExtraData, state.currentNode]);

  return contract;
}
