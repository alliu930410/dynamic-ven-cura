"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import React, { useEffect, useState } from "react";
import {
  DynamicContextProvider,
  DynamicWidget,
  getAuthToken,
  useDynamicContext,
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
import WalletOperations from "@/components/WalletOperations";

const DynamicApp = () => {
  const [custodialWallets, setCustodialWallets]: any[] = useState([]);
  const [network, setNetwork] = useState<string>(sepolia.name);
  const [chainId, setChainId] = useState<number>(sepolia.id);
  const { setToken } = useDynamicToken();
  const [selectedWallet, setSelectedWallet] = useState<any | null>(null);
  const [interactionToggle, setInteractionToggle] = useState<boolean>(false);
  const { authToken } = useDynamicContext();

  const chainNameToId: Record<string, number> = {
    [sepolia.name]: sepolia.id,
    [baseSepolia.name]: baseSepolia.id,
  };

  useEffect(() => {
    const fetchToken = async () => {
      if (!authToken) {
        setToken(null);
        setSelectedWallet(null);
        setCustodialWallets([]);
      }

      const jwtToken = getAuthToken();
      if (jwtToken) {
        // Set global token with Dynamic jwt token
        setToken(jwtToken);
      }
    };

    fetchToken();
  }, [authToken, interactionToggle, setToken]);

  const handleNetworkChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNetwork(event.target.value);

    setChainId(chainNameToId[event.target.value]);
  };

  const handleWalletSelect = (wallet: any) => {
    setSelectedWallet(wallet);
    // // Fetch transaction history for the selected wallet
    // fetchTransactionHistory(wallet.address);
  };

  return (
    <div className="bg-white text-black min-h-screen flex p-4">
      <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg w-1/3 space-y-6">
        <DynamicWidget />
        {/* Network Toggle Section */}
        <div className="flex items-center">
          <h2 className="text-lg font-bold">{`Network(id: ${chainId})`}: </h2>
          <select
            id="network-select"
            value={network}
            onChange={handleNetworkChange}
            className="border border-gray-300 rounded-md p-2"
          >
            <option value={sepolia.name}>{sepolia.name}</option>
            <option value={baseSepolia.name}>{baseSepolia.name}</option>
          </select>
        </div>
        {/* Admin panel section */}
        <h2 className="text-lg font-bold">Admin Panel</h2>
        <FetchUserCustodialWalletsComponent
          interactionToggle={interactionToggle}
          setItems={setCustodialWallets}
          setInteractionToggle={setInteractionToggle}
        />
        <CreateCustodialWalletComponent
          interactionToggle={interactionToggle}
          setInteractionToggle={setInteractionToggle}
        />
      </div>

      <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg w-2/3 ml-6 space-y-6">
        {/* Custodial wallets section */}
        <h2 className="text-lg font-bold">Custodial Wallets</h2>

        {custodialWallets.map((walletItem: any) => (
          <div
            key={walletItem.address}
            onClick={() => handleWalletSelect(walletItem)}
          >
            <CustodialWalletItem
              walletItem={walletItem}
              chainId={chainId}
              interactionToggle={interactionToggle}
            />
          </div>
        ))}
      </div>

      {/* Expandable Panel for Wallet-Specific Operations */}
      {selectedWallet && (
        <WalletOperations
          interactionToggle={interactionToggle}
          setInteractionToggle={setInteractionToggle}
          chainId={chainId}
          selectedWallet={selectedWallet}
          custodialWallets={custodialWallets}
        />
      )}
    </div>
  );
};

const App = () => (
  <DynamicTokenProvider>
    <DynamicContextProvider
      settings={{
        environmentId: "e95369b8-4e91-43f6-b483-dac1a163b57e",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <ToastContainer />
      <DynamicApp />
    </DynamicContextProvider>
  </DynamicTokenProvider>
);

export default App;
