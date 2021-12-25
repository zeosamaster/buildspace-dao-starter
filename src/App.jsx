import React from "react";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useWeb3 } from "@3rdweb/hooks";
import { ethers } from "ethers";

const sdk = new ThirdwebSDK("rinkeby");

const bundleDropModule = sdk.getBundleDropModule(
  "0x4C63B7D8933c88d2E924141c8EC3951A2E395A48"
);

const tokenModule = sdk.getTokenModule(
  "0x16F5F60FB05E965382Bf19ee55982E3B7984b69a"
);

const shortenAddress = (str) => {
  return str.substring(0, 6) + "..." + str.substring(str.length - 4);
};

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();
  const [hasClaimedNFT, setHasClaimedNFT] = React.useState(false);
  const [isClaiming, setIsClaiming] = React.useState(false);

  const [memberTokenAmounts, setMemberTokenAmounts] = React.useState({});
  const [memberAddresses, setMemberAddresses] = React.useState([]);

  const signer = provider ? provider.getSigner() : undefined;

  React.useEffect(() => {
    sdk.setProviderOrSigner(signer);
  }, [signer]);

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

  const mintNft = React.useCallback(async () => {
    setIsClaiming(true);
    try {
      await bundleDropModule.claim("0", 1);
      setHasClaimedNFT(true);
      console.log(
        `🌊 Successfully Minted! Check it out on OpenSea: https://testnets.opensea.io/assets/${bundleDropModule.address}/0`
      );
    } catch (e) {
      setHasClaimedNFT(false);
      console.error("failed to claim", e);
    }

    setIsClaiming(false);
  }, []);

  React.useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getMemberAddresses = async () => {
      try {
        const addresses = await bundleDropModule.getAllClaimerAddresses("0");
        console.log("🚀 Member addresses", addresses);
        setMemberAddresses(addresses);
      } catch (e) {
        setMemberAddresses([]);
        console.error("failed to get member list", e);
      }
    };

    getMemberAddresses();
  }, [hasClaimedNFT]);

  React.useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const fetchTokenBalances = async () => {
      try {
        const amounts = await tokenModule.getAllHolderBalances();
        console.log("👜 Amounts", amounts);
        setMemberTokenAmounts(amounts);
      } catch (e) {
        setMemberTokenAmounts({});
        console.error("failed to get token amounts", e);
      }
    };

    fetchTokenBalances();
  }, [hasClaimedNFT]);

  const memberList = React.useMemo(() => {
    return memberAddresses.map((address) => {
      return {
        address,
        tokenAmount: ethers.utils.formatUnits(
          memberTokenAmounts[address] || 0,
          18
        ),
      };
    });
  }, [memberAddresses, memberTokenAmounts]);

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

  if (hasClaimedNFT) {
    return (
      <div className="member-page">
        <h1>🍪DAO Member Page</h1>
        <p>Congratulations on being a member</p>
      </div>
    );
  }

  return (
    <div className="mint-nft">
      <h1>Mint your free 🍪DAO Membership NFT</h1>
      <button disabled={isClaiming} onClick={mintNft}>
        {isClaiming ? "Minting..." : "Mint your nft (FREE)"}
      </button>
    </div>
  );
};

export default App;
