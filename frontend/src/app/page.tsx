"use client";

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

const DynamicApp = () => {
  const [custodialWallets, setCustodialWallets] = useState([]);
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
    <div className="bg-gray-900 text-white min-h-screen flex items-center justify-center p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg w-full space-y-6">
        <DynamicContextProvider
          settings={{
            environmentId: "e95369b8-4e91-43f6-b483-dac1a163b57e",
            walletConnectors: [EthereumWalletConnectors],
          }}
        >
          <DynamicWidget />
          <h1>
            Custodial Wallets:{" "}
            {custodialWallets
              ? JSON.stringify(custodialWallets)
              : "Haven't fetched any yet"}
          </h1>
          <FetchUserCustodialWalletsComponent setItems={setCustodialWallets} />
        </DynamicContextProvider>
      </div>
    </div>
  );
};

const App = () => (
  <DynamicTokenProvider>
    <DynamicApp />
  </DynamicTokenProvider>
);

export default App;
