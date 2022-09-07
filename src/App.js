import "./App.css";
import "./components/spinner.css";
import React, { useEffect, useState } from "react";
import web3 from "./web3";
import lottery from "./lottery";
const { ethereum } = window;

function App() {
  const emojis = ['😊', '🙃', '🤪', '🤓', '🤯', '😴', '💩', '👻', '👽', '🤖', '👾', '🐭', '🦕', '🦖', '🐉']
  const [currentAccount, setCurrentAccount] = useState("");
  const [manager, setManager] = useState("");
  const [players, setPlayers] = useState([]);
  const [contractAddress, setContractAddress] = useState("");
  const [contractBalance, setContractBalance] = useState("");
  const [etherValue, setEtherValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const shortenAddress = (address) => `${address.slice(0, 5)}...${address.slice(address.length - 4)}`;
  const checkIfWalletIsConnect = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);
      } else {
        console.log("No accounts found");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const connectWallet = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask.");

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object");
    }
  };
  const fetchManager = async () => {
    try {
      const managerAddress = await lottery.methods.manager().call();
      if (managerAddress.length) {
        setManager(managerAddress);
      } else {
        console.log("No manager found");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchAddress = async () => {
    const address = lottery.options.address;
    setContractAddress(address);
  };
  const fetchPlayers = async () => {
    try {
      let playersArray = await lottery.methods
        .getPlayer()
        .call({ from: currentAccount });
      if (playersArray.length) {
        playersArray = playersArray.map(address => {
          return address.toLowerCase();
        })
        setPlayers(playersArray);
      } else {
        console.log("No players found");
      }
    } catch (error) {
      console.log(error);
    }
  };
  const fetchBalance = async () => {
    try {
      const balance = await web3.eth.getBalance(contractAddress);
      setContractBalance(balance);
    } catch (error) {

    }

  };
  const handleChange = event => {
    setEtherValue(event.target.value);
  };
  const handleClick = async () => {
    if (players.includes(currentAccount)) {
      alert("Sorry ... your'e already in 🤷!!")
      setEtherValue("")
    } else {
      setIsLoading(true);
      await lottery.methods.enter().send({
        from: currentAccount,
        value: web3.utils.toWei(etherValue, "ether")
      });
      setIsLoading(false)
      alert("Congratulations 🙌!! your'e now member of this lottery 🤟.")
      setEtherValue("")
    }
  }
  const checkIfManagerIsHere = () => {
    return manager.toLowerCase() === currentAccount.toLowerCase();
  }
  const handlePickWinner = async () => {
    if (players.length > 0) {
      setIsLoading(true);
      await lottery.methods.pickWinner().send({
        from: currentAccount
      })
      setIsLoading(false)
      setPlayers([])
      alert("Wooooo hooooooo 🏆, our winner got selected and price money has trasnfered to winner 🤑!!")
    } else {
      alert("oops 🤭!! for picking winner at least one player required ⚠️.")
    }
  }
  useEffect(() => {
    checkIfWalletIsConnect();
    checkIfManagerIsHere();
    fetchManager();
    fetchAddress();
    fetchPlayers();
    fetchBalance();
  });
  return (
    <div className="app">
      <div className="navbar">
        <h2>Welcome to lottery system 🎰</h2>
        {currentAccount
          ? (
            <button className="address">{emojis[9]} {`${shortenAddress(currentAccount)}`}</button>
          )
          : (
            <button className="connect" type="button" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
      </div>
      <div>
        <p>
          This lottery contract is deployed at address 🚀 {contractAddress}
        </p>
        <p>This lottery contract is managed by 👨‍💼 {manager}</p>
        <p>
          There are currently {players.length} people entered, competing to win
          {" "}
          {web3.utils.fromWei(contractBalance, "ether")} ether!
        </p>
      </div>
      <hr />


      {checkIfManagerIsHere()
        ? (
          <div>
            <h4>Hello manager 👋</h4>
            <label>Would you like to pick winner? </label>
            <button onClick={handlePickWinner} disabled={isLoading} type="button">
              {isLoading
                ? "Picking..."
                : "Pick Winner"
              }
            </button>
          </div>
        )
        : (
          <div>
            <h4>Want to try your luck? 🍀</h4>
            <label>Amount of ether to enter in lottery: </label>
            <input
              id="ether"
              name="ether"
              type="number"
              step="0.0001"
              min="0.011"
              placeholder="Enter amount in eth..."
              onChange={handleChange}
              value={etherValue}
            />
            <button type="submit" disabled={isLoading} onClick={handleClick}>
              {isLoading
                ? "Waiting for confirmation..."
                : "Enter"}
            </button>
            <p>Winner will be picked automatically by our automated algorithm 🙏!!</p>
            <hr />
          </div>
        )
      }
    </div>
  );
}
export default App;
