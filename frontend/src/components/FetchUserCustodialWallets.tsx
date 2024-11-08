import { useAuthenticatedApiClient } from "@/services/apiClient";
import { toast } from "react-toastify";

interface FetchUserCustodialWalletsProps {
  setItems: (item: any) => void;
}

const FetchUserCustodialWalletsComponent: React.FC<
  FetchUserCustodialWalletsProps
> = ({ setItems }) => {
  const apiClient = useAuthenticatedApiClient();

  const handleFetchUserCustodialWallets = async () => {
    try {
      const response = await apiClient.get("/custodial/wallets");
      setItems(response.data);
    } catch (error: any) {
      toast.error(`Error fetching custodial wallets: ${error}`);
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 border border-gray-300 rounded-md shadow-md">
      <button
        onClick={handleFetchUserCustodialWallets}
        className="px-6 py-2 bg-black text-white font-semibold rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50"
      >
        Refresh My Custodial Wallets
      </button>
    </div>
  );
};

export default FetchUserCustodialWalletsComponent;
