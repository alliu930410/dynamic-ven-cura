import { useState, useContext, ReactNode, createContext } from "react";

interface DynamicTokenContextType {
  token: string | null;
  setToken: (token: string | null) => void;
}

const DynamicTokenContext = createContext<DynamicTokenContextType | undefined>(
  undefined
);

export const DynamicTokenProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  return (
    <DynamicTokenContext.Provider value={{ token, setToken }}>
      {children}
    </DynamicTokenContext.Provider>
  );
};

export const useDynamicToken = () => {
  const context = useContext(DynamicTokenContext);
  if (!context) {
    throw new Error("must wrap in DynamicTokenProvider");
  }
  return context;
};
