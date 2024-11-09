import { useAuthenticatedApiClient } from "@/services/apiClient";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CreateCustodialWalletProps {
  token: string | null;
  interactionToggle: boolean;
  setInteractionToggle: (value: boolean) => void;
}

const CreateCustodialWalletComponent: React.FC<CreateCustodialWalletProps> = ({
  token,
  interactionToggle,
  setInteractionToggle,
}) => {
  const apiClient = useAuthenticatedApiClient();

  const handleCreateCustodialWallet = async () => {
    try {
      const response = await apiClient.post("/custodial/wallet");
      toast.success(
        `Created ${response.data.nickName}: ${response.data.address}`
      );
      setInteractionToggle(!interactionToggle);
    } catch (error: any) {
      toast.error(`Error creating custodial wallet: ${error}`);
      console.error("Error creating wallet:", error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 border border-gray-300 rounded-md shadow-md">
      <button
        onClick={handleCreateCustodialWallet}
        className={`px-6 py-2 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-50 
        ${
          !token
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black hover:bg-gray-800"
        }`}
      >
        Create a Custodial Wallet
      </button>
    </div>
  );
};

export default CreateCustodialWalletComponent;
