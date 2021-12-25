import React from "react";
import { ThirdwebSDK } from "@3rdweb/sdk";
import { useWeb3 } from "@3rdweb/hooks";
import { ethers } from "ethers";
import { Dashboard } from "./Dashboard";

const sdk = new ThirdwebSDK("rinkeby");

const bundleDropModule = sdk.getBundleDropModule(
  "0x4C63B7D8933c88d2E924141c8EC3951A2E395A48"
);

const tokenModule = sdk.getTokenModule(
  "0x16F5F60FB05E965382Bf19ee55982E3B7984b69a"
);

const voteModule = sdk.getVoteModule(
  "0x3d76b0075C7ef693A94bFf5bb81c1c6e025eF0d3"
);

const App = () => {
  const { connectWallet, address, error, provider } = useWeb3();
  const [hasClaimedNFT, setHasClaimedNFT] = React.useState(false);
  const [isClaiming, setIsClaiming] = React.useState(false);

  const [memberTokenAmounts, setMemberTokenAmounts] = React.useState({});
  const [memberAddresses, setMemberAddresses] = React.useState([]);

  const [proposals, setProposals] = React.useState([]);
  const [isVoting, setIsVoting] = React.useState(false);
  const [hasVoted, setHasVoted] = React.useState(false);

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

  React.useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const fetchProposals = async () => {
      try {
        const proposals = await voteModule.getAll();

        setProposals(proposals);
        console.log("🌈 Proposals:", proposals);
      } catch (e) {
        console.error("failed to get proposals", e);
      }
    };

    fetchProposals();
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

  React.useEffect(() => {
    if (!hasClaimedNFT || !proposals.length) {
      return;
    }

    const checkVoteStatus = async () => {
      // Check if the user has already voted on the first proposal.
      try {
        const hasVoted = await voteModule.hasVoted(
          proposals[0].proposalId,
          address
        );
        setHasVoted(hasVoted);
        if (hasVoted) {
          console.log("🥵 User has already voted");
        } else {
          console.log("🥵 User hasn't voted yet");
        }
      } catch (e) {
        console.error("failed to check if wallet has voted", e);
      }
    };

    checkVoteStatus();
  }, [hasClaimedNFT, proposals, address]);

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
      <Dashboard
        tokenModule={tokenModule}
        voteModule={voteModule}
        address={address}
        memberList={memberList}
        proposals={proposals}
        isVoting={isVoting}
        hasVoted={hasVoted}
        setIsVoting={setIsVoting}
        setHasVoted={setHasVoted}
      />
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
