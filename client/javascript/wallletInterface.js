
import data from '../../build/contracts/MultiSigFactory.json' assert { type: "json" };
import data1  from '../../build/contracts/MultiSigWallet.json' assert { type: "json" };

Moralis.initialize("GDTzbp8tldymuUuarksnrmguFjGjPtzIvTDHPMsq"); // Application id from moralis.io
Moralis.serverURL = "https://um3tbvvvky01.bigmoralis.com:2053/server"; //Server url from moralis.io

$(window).on("load",function(){
    $(".loader-wrapper").fadeOut(1200);
    
});

var account;
var contractFactoryInstance = "";
var currentSelectedWallet

async function loadWeb3() {
    if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        await window.ethereum.enable()
    }
    else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
}


async function loadFactory() {
    const web3 = window.web3
  
    //gets all user accounts and displays the current user on the UI (navbar)
    var accounts = await web3.eth.getAccounts()
    account = currentLoggedInUser
    console.log("your account is " + account)    
   
    document.getElementById("display-address").innerHTML = "Account: " + account.slice(0, 6) + "..";
    const networkId = await web3.eth.net.getId()
    const networkData = data.networks[networkId]
    if(networkData) {
      contractFactoryInstance = new web3.eth.Contract(data.abi,  networkData.address, {from: account})
      
    } else {
      window.alert('contract not deployed to detected network.')
      
    }

   
    await contractFactoryInstance.methods.getUserWallets().call().then(function(result) {
      for(let i = 0; i < result.length; i++) {
          console.log(result)
        userWallets.innerHTML += `
        <tr "class="tablerow">
            <td>${result[i].walletID}</td>
            <td id="${result[i].walletAddress}">${result[i].walletAddress}</td>
           
            
        </tr>`  
        
      }
    })
  
  
  }
  
  function createNewWallet() {
    
    contractFactoryInstance.methods.createMultiSig().send({from: account}).then(function(result) {
      contractFactoryInstance.methods.getUserWallets().call().then(function(result) {
        var walletID = result.length - 1
        userWallets.innerHTML += `
          <tr "class="tablerow">
              <td>${result[result.length - 1].walletID}</td>
              <td id="${result[result.length - 1].walletAddress}">${result[result.length - 1].walletAddress}</td>
             
              
          </tr>`  
      })
    })
  
  }
  
  const createNewWalletButton = document.getElementById("create-new-wallet")
  createNewWalletButton.onclick = createNewWallet

  const userWallets = document.querySelectorAll("table")[0];
  userWallets.addEventListener("click", setCurrentWallet);
// const userWallets = document.querySelectorAll("table")[7];
// userWallets.addEventListener("click", setCurrentWallet);

function setCurrentWallet(e) {
    var id = e.target.id
    console.log(id)
  
    userWalletObject = { 'wallet': id};
    localStorage.setItem('userWalletObject', JSON.stringify(userWalletObject));
    var retrievedUserWalletObject = localStorage.getItem('userWalletObject');
    currentSelectedWallet = JSON.parse(retrievedUserWalletObject).wallet

    setTimeout(function(){
        window.location.href = "/multisig.html"
   }, 2000);//wa
    
}
  
var userWalletObject 


// Retrieve the object from storage
var retrieveCurrentLoggedInUser = localStorage.getItem('currentLoggedInUserObject');
var currentLoggedInUser = JSON.parse(retrieveCurrentLoggedInUser).user
console.log('retrieveCurrentLoggedInUser: ', JSON.parse(retrieveCurrentLoggedInUser).user);
console.log(currentLoggedInUser)

loadWeb3()
loadFactory()
// loadBlockchainData()