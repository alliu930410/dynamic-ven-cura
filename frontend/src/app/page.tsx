"use client"; // Add this line at the top

import {
  DynamicContextProvider,
  DynamicWidget,
  getAuthToken,
} from "@dynamic-labs/sdk-react-core";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { useEffect, useState } from "react";

const App = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      const jwtToken = await getAuthToken();
      if (jwtToken) {
        setToken(jwtToken);
      }
    };

    fetchToken();
  }, []);

  return (
    <DynamicContextProvider
      settings={{
        environmentId: "e95369b8-4e91-43f6-b483-dac1a163b57e",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <DynamicWidget />
      {token && <p>JWT Token: {token}</p>}
    </DynamicContextProvider>
  );
};

export default App;
