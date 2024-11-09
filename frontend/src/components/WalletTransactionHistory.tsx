import { useState } from "react";

interface CustodialWallet {
  address: string;
  nickName: string;
  createdAt: string;
}

interface WalletTransactionHistoryProps {
  chainId: number;
  selectedWallet: CustodialWallet;
}

const WalletTransactionHistory: React.FC<WalletTransactionHistoryProps> = ({
  selectedWallet,
  chainId,
}) => {
  const [transactionHistory, setTransactionHistory] = useState<any[]>([]);

  return (
    <div className="w-full h-full">
      {transactionHistory.length > 0 ? (
        <ul>
          {transactionHistory.map((transaction, index) => (
            <li key={index}>
              <p>Transaction ID: {transaction.id}</p>
              <p>Amount: {transaction.amount}</p>
              <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No transaction history available.</p>
      )}
    </div>
  );
};

export default WalletTransactionHistory;
