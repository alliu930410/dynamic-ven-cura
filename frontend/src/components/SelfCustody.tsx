const SelfCustody: React.FC = () => {
  return (
    <div className="relative flex items-center ml-2">
      <div className="flex items-center group">
        <img src="/icons/key.svg" alt="key" className="w-6 h-6" />
        <div className="tooltip hidden group-hover:block absolute z-10 w-48 p-2 text-sm text-white bg-black bg-opacity-80 rounded-md">
          You will reveal the private key of this wallet by pressing, and it's
          not safe if it's leaked.
        </div>
      </div>
    </div>
  );
};

export default SelfCustody;
