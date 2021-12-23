import React from "react";
import { useWeb3 } from "@3rdweb/hooks";

const App = () => {
  const { connectWallet, address } = useWeb3();

  React.useEffect(() => {
    console.log("👋 Address:", address);
  }, [address]);

  if (!address) {
    return (
      <div className="landing">
        <h1>Welcome to FootyDAO</h1>
        <button onClick={() => connectWallet("injected")} className="btn-hero">
          Connect your wallet
        </button>
      </div>
    );
  }

  return (
    <div className="landing">
      <h1>👀 wallet connected, now what!</h1>
    </div>
  );
};

export default App;
