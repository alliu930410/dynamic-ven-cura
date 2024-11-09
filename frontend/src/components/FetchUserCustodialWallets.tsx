import { useAuthenticatedApiClient } from "@/services/apiClient";
import { useCallback, useEffect } from "react";
import { toast } from "react-toastify";

interface FetchUserCustodialWalletsProps {
  token: string | null;
  interactionToggle: boolean;
  setItems: (item: any) => void;
}

const FetchUserCustodialWalletsComponent: React.FC<
  FetchUserCustodialWalletsProps
> = ({ token, interactionToggle, setItems }) => {
  const apiClient = useAuthenticatedApiClient();

  const handleFetchUserCustodialWallets = useCallback(async () => {
    try {
      const response = await apiClient.get("/custodial/wallets");
      setItems(response.data);
    } catch (error: any) {
      toast.error(`Error fetching custodial wallets: ${error}`);
      console.error("Error fetching data:", error);
    }
  }, [apiClient, setItems]);

  useEffect(() => {
    if (token) {
      handleFetchUserCustodialWallets();
    }
  }, [token, interactionToggle, handleFetchUserCustodialWallets]);

  return (
    <div className="flex flex-col items-center space-y-4 p-6 border border-gray-300 rounded-md shadow-md">
      <button
        onClick={handleFetchUserCustodialWallets}
        className={`px-6 py-2 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 
        ${
          !token
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black hover:bg-gray-800"
        }`}
      >
        Refresh My Custodial Wallets
      </button>
    </div>
  );
};

export default FetchUserCustodialWalletsComponent;
