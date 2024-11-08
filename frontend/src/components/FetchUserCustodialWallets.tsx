import { useAuthenticatedApiClient } from "@/services/apiClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
    <div>
      <button onClick={handleFetchUserCustodialWallets}>
        Get My Custodial Wallets
      </button>
    </div>
  );
};

export default FetchUserCustodialWalletsComponent;
