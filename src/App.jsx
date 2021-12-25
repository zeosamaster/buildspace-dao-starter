import React from "react";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useWeb3 } from "@3rdweb/hooks";

const sdk = new ThirdwebSDK("rinkeby");

const bundleDropModule = sdk.getBundleDropModule(
  "0x4C63B7D8933c88d2E924141c8EC3951A2E395A48"
);

const App = () => {
  const { connectWallet, address } = useWeb3();
  const [hasClaimedNFT, setHasClaimedNFT] = React.useState(false);

  React.useEffect(() => {
    console.log("👋 Address:", address);
    if (!address) {
      return;
    }

    const fetchBalance = async () => {
      try {
        const balance = await bundleDropModule.balanceOf(address, "0");
        if (balance.gt(0)) {
          setHasClaimedNFT(true);
          console.log("🌟 this user has a membership NFT!");
        } else {
          setHasClaimedNFT(false);
          console.log("😭 this user doesn't have a membership NFT.");
        }
      } catch (e) {
        setHasClaimedNFT(false);
        console.error("failed to check NFT balance", e);
      }
    };

    fetchBalance();
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
