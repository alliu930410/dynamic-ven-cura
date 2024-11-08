"use client";
import { ToastContainer } from "react-toastify";

import React, { useEffect, useState } from "react";
import {
  DynamicContextProvider,
  DynamicWidget,
  getAuthToken,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import {
  useDynamicToken,
  DynamicTokenProvider,
} from "@/context/DynamicTokenContext";
import FetchUserCustodialWalletsComponent from "@/components/FetchUserCustodialWallets";
import CreateCustodialWalletComponent from "@/components/CreateUserCustodialWallet";
import CustodialWalletItem from "@/components/CustodialWalletItem";
import { baseSepolia, sepolia } from "viem/chains";

const DynamicApp = () => {
  const [custodialWallets, setCustodialWallets]: any[] = useState([]);
  const [network, setNetwork] = useState<string>(sepolia.name);
  const [chainId, setChainId] = useState<number>(sepolia.id);
  const { token, setToken } = useDynamicToken();

  const chainNameToId: Record<string, number> = {
    [sepolia.name]: sepolia.id,
    [baseSepolia.name]: baseSepolia.id,
  };

  useEffect(() => {
    const fetchToken = async () => {
      const jwtToken = getAuthToken();
      if (jwtToken) {
        // Set global token with Dynamic jwt token
        setToken(jwtToken);
      }
    };

    fetchToken();
  }, [setToken]);

  const handleNetworkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNetwork(event.target.value);
    setChainId(chainNameToId[event.target.value]);
  };

  return (
    <div className="bg-white text-black min-h-screen flex p-4">
      <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg w-1/3 space-y-6">
        <DynamicContextProvider
          settings={{
            environmentId: "e95369b8-4e91-43f6-b483-dac1a163b57e",
            walletConnectors: [EthereumWalletConnectors],
          }}
        >
          <DynamicWidget />
        </DynamicContextProvider>
        {/* Network Toggle Section */}
        <div className="flex items-center">
          <h2 className="text-lg font-bold">Network: </h2>
          <select
            id="network-select"
            value={network}
            onChange={handleNetworkChange}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value="Sepolia">{sepolia.name}</option>
            <option value="Mainnet">{baseSepolia.name}</option>
          </select>
        </div>
        {/* Admin panel section */}
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <FetchUserCustodialWalletsComponent setItems={setCustodialWallets} />
        <CreateCustodialWalletComponent />
      </div>

      <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg w-2/3 ml-6 space-y-6">
        {/* Custodial wallets section */}
        <h2 className="text-lg font-bold">Custodial Wallets</h2>

        {custodialWallets.map((walletItem: any) => (
          <CustodialWalletItem
            key={walletItem.address}
            walletItem={walletItem}
          />
        ))}
      </div>
    </div>
  );
};

const App = () => (
  <DynamicTokenProvider>
    <ToastContainer />
    <DynamicApp />
  </DynamicTokenProvider>
);

export default App;
