import { useEffect, useState } from "react";
import { useAuthenticatedApiClient } from "@/services/apiClient";
import { toast } from "react-toastify";
import { baseSepolia, sepolia } from "viem/chains";

interface CustodialWallet {
  address: string;
  nickName: string;
  createdAt: string;
}

interface CustodialWalletItemProps {
  chainId: number;
  walletItem: CustodialWallet;
}

const CustodialWalletItem: React.FC<CustodialWalletItemProps> = ({
  chainId,
  walletItem,
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
  }, [chainId, address]);

  return (
    <div className="p-4 border border-gray-300 rounded-md shadow-sm bg-white">
      <p className="font-semibold">{nickName}</p>
      <p className="font-semibold">{address}</p>
      <p className="font-semibold">
        {balance} {chainIdToNativeTokenName[chainId]}
      </p>
      <p>Created At: {new Date(createdAt).toLocaleDateString()}</p>
    </div>
  );
};

export default CustodialWalletItem;
