import { useEffect, useState } from "react";
import { useAuthenticatedApiClient } from "@/services/apiClient";
import { toast } from "react-toastify";
import { baseSepolia, sepolia } from "viem/chains";
import BlockiesSvg from "blockies-react-svg";

interface CustodialWallet {
  address: string;
  nickName: string;
  createdAt: string;
}

interface CustodialWalletItemProps {
  chainId: number;
  walletItem: CustodialWallet;
  refreshBalanceToggle: boolean;
}

const CustodialWalletItem: React.FC<CustodialWalletItemProps> = ({
  chainId,
  walletItem,
  refreshBalanceToggle,
}) => {
  const apiClient = useAuthenticatedApiClient();

  const { address, nickName, createdAt } = walletItem;
  const [balance, setBalance] = useState<string | null>(null);

  const chainIdToNativeTokenName: Record<number, string> = {
    [sepolia.id]: sepolia.nativeCurrency.name,
    [baseSepolia.id]: baseSepolia.nativeCurrency.name,
  };

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await apiClient.get(
          `/custodial/wallet/balance/${chainId}/${address}`
        );
        setBalance(response.data.balance);
      } catch (error: any) {
        toast.error(`Error fetching custodial wallets: ${error}`);
      }
    };

    fetchBalance();
  }, [chainId, address, apiClient, refreshBalanceToggle]);

  return (
    <div className="flex items-center justify-between p-4 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer hover:bg-gray-400 transition duration-200">
      <div className="flex items-center mr-4">
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <BlockiesSvg address={address} />
        </div>
        <div className="ml-2">
          <p className="font-semibold">{nickName}</p>
          <p className="font-semibold">{address}</p>
          <p className="font-semibold">
            {balance} {chainIdToNativeTokenName[chainId]}
          </p>
          <p>Created At: {new Date(createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
};

export default CustodialWalletItem;
