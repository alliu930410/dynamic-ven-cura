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

const DynamicApp = () => {
  const [custodialWallets, setCustodialWallets]: any[] = useState([]);
  const { token, setToken } = useDynamicToken();

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

  return (
    <div className="bg-white text-black min-h-screen flex items-center justify-center p-4">
      <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg max-w-lg w-full space-y-6">
        <DynamicContextProvider
          settings={{
            environmentId: "e95369b8-4e91-43f6-b483-dac1a163b57e",
            walletConnectors: [EthereumWalletConnectors],
          }}
        >
          <DynamicWidget />

          {custodialWallets.map((walletItem: any) => (
            <CustodialWalletItem
              key={walletItem.address}
              walletItem={walletItem}
            />
          ))}
          {custodialWallets.length === 0 && (
            <FetchUserCustodialWalletsComponent
              setItems={setCustodialWallets}
            />
          )}
          <CreateCustodialWalletComponent />
        </DynamicContextProvider>
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
