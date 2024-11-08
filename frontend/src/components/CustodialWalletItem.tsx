interface CustodialWallet {
  address: string;
  nickName: string;
  createdAt: string;
}

interface CustodialWalletItemProps {
  walletItem: CustodialWallet;
}

const CustodialWalletItem: React.FC<CustodialWalletItemProps> = ({
  walletItem,
}) => {
  const { address, nickName, createdAt } = walletItem;

  return (
    <div className="p-4 border border-gray-300 rounded-md shadow-sm bg-white">
      <p className="font-semibold">{nickName}</p>
      <p className="font-semibold">{address}</p>
      <p>Created At: {new Date(createdAt).toLocaleDateString()}</p>
    </div>
  );
};

export default CustodialWalletItem;
