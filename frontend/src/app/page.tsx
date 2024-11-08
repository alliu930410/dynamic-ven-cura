"use client"; // Add this line at the top

import React, { useEffect } from "react";
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

const DynamicApp = () => {
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
    </DynamicContextProvider>
  );
};

const App = () => (
  <DynamicTokenProvider>
    <DynamicApp />
  </DynamicTokenProvider>
);

export default App;
