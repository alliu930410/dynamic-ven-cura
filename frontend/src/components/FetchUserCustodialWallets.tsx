import { useAuthenticatedApiClient } from "@/services/apiClient";

interface FetchUserCustodialWalletsProps {
  setItem: (item: any) => void;
}

const FetchUserCustodialWalletsComponent: React.FC<
  FetchUserCustodialWalletsProps
> = ({ setItem }) => {
  const apiClient = useAuthenticatedApiClient();

  const handleFetchUserCustodialWallets = async () => {
    try {
      const response = await apiClient.get("/custodial/wallets");
      setItem(response.data);
    } catch (error) {
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
