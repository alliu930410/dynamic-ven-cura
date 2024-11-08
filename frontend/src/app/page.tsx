"use client"; // Add this line at the top

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
  const [item, setItem] = useState(null);
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
    <DynamicContextProvider
      settings={{
        environmentId: "e95369b8-4e91-43f6-b483-dac1a163b57e",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <DynamicWidget />
      {`Token: ${token}`}
      <h1>
        Custodial Wallets:{" "}
        {item ? JSON.stringify(item) : "Haven't fetched any yet"}
      </h1>
      <FetchUserCustodialWalletsComponent setItem={setItem} />
    </DynamicContextProvider>
  );
};

const App = () => (
  <DynamicTokenProvider>
    <DynamicApp />
  </DynamicTokenProvider>
);

export default App;
