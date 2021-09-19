import data from '../../build/contracts/MultiSigFactory.json' assert { type: "json" };
import data1  from '../../build/contracts/MultiSigWallet.json' assert { type: "json" };

Moralis.initialize("GDTzbp8tldymuUuarksnrmguFjGjPtzIvTDHPMsq"); // Application id from moralis.io
Moralis.serverURL = "https://um3tbvvvky01.bigmoralis.com:2053/server"; //Server url from moralis.io

var currentSelectedToken
var account = ""
var acc = ""
var contractFactoryInstance
var contractInstance

export async function loadWeb3() {
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

var retrieveCurrentLoggedInUser = localStorage.getItem('currentLoggedInUserObject');
var currentLoggedInUser = JSON.parse(retrieveCurrentLoggedInUser).user

export async function loadFactory() {
  const web3 = window.web3

  //gets all user accounts and displays the current user on the UI (navbar)
  var accounts = await web3.eth.getAccounts()
  var acc = accounts[0]
  account = currentLoggedInUser;    
 
  
  const networkId = await web3.eth.net.getId()
  const networkData = data.networks[networkId]
  
  if(networkData) {

    contractFactoryInstance = new web3.eth.Contract(data.abi, networkData.address, {from: account})
      
  } else {
    window.alert('contract not deployed to detected network.')
    
  }

  await contractFactoryInstance.methods.getWalletID(currentSelectedWallet).call().then(function(result) {
    document.getElementById("display-wallet-id").innerHTML = "Wallet ID: " + result;

  })

  await contractFactoryInstance.methods.getUserWallets().call().then(function(result) {
    var found = false
    for(let i = 0; i < result.length; i++) {
      if(currentSelectedWallet = result[i]){
        found = true
        break
      }
    }
    console.log(found)
    if (found == false) {
      window.location.href = "walletInterface.html"
    }
  })

}

export async function loadBlockchainData() {

  const web3 = window.web3

  //gets all user accounts and displays the current user on the UI (navbar)
  var accounts = await web3.eth.getAccounts()
  account = currentLoggedInUser;;    
  document.getElementById("display-address").innerHTML = "Account: " + account.slice(0, 6) + "..";

  const networkId = await web3.eth.net.getId()
  const networkData = data1.networks[networkId]
  if(networkData) {
      
    contractInstance = new web3.eth.Contract(data1.abi, currentSelectedWallet, {from: account})
     
  } else {
      window.alert('contract not deployed to detected network.')
      
  }
  // contractInstance1 = new web3.eth.Contract(data1.abi, "0xBc9d279729B41871Ec6d0b075D3713eb3c5DB143", {from: account})
 

  displayBalance()

  
}

function displayBalance() {
  const balance = contractInstance.methods.getAccountBalance(currentSelectedToken).call().then(function(balance) {
    balance = balance / 10 ** 18;
    balance = balance.toFixed(3)
    document.getElementById("display-balance").innerHTML = "balance: " + balance + " " + currentSelectedToken;
  })
}

var testObject 
var pageLoadObject
var retrievedObject = localStorage.getItem('testObject');
var currentSelectedToken = JSON.parse(retrievedObject).token
const ERC20TokenMenu = document.getElementById("ERC20-token-menu")
ERC20TokenMenu.innerHTML = currentSelectedToken


retrievedSectionObject = localStorage.getItem('pageLoadObject');
var retrievedSectionObject = localStorage.getItem('pageLoadObject');
var currentSelectedSection = JSON.parse(retrievedSectionObject).section




var retrievedUserWalletObject = localStorage.getItem('userWalletObject');
var currentSelectedWallet = JSON.parse(retrievedUserWalletObject).wallet


function toggleAdminSection() {
  var x = document.getElementById("accounts-section").style.display = "none";
  var x = document.getElementById("transfer-section").style.display = "none";
  var x = document.getElementById("admin-section").style.display = "block";
  var x = document.getElementById("stats-section").style.display = "none";
  var x = document.getElementById("wallets-section").style.display = "none";

  pageLoadObject = { 'section': "admin-section"};
  localStorage.setItem('pageLoadObject', JSON.stringify(pageLoadObject));
  retrievedSectionObject = localStorage.getItem('testObject');
  currentSelectedSection = JSON.parse(retrievedSectionObject).section
  
}
const toggleAdmin = document.getElementById("toggle-admin-section");
toggleAdmin.onclick = toggleAdminSection;

function toggleAccountsSection() {
  var x = document.getElementById("accounts-section").style.display = "block";
  var x = document.getElementById("transfer-section").style.display = "none";
  var x = document.getElementById("admin-section").style.display = "none";
  var x = document.getElementById("stats-section").style.display = "none";
  var x = document.getElementById("wallets-section").style.display = "none";

  pageLoadObject = { 'section': "accounts-section"};
  localStorage.setItem('pageLoadObject', JSON.stringify(pageLoadObject));
  retrievedSectionObject = localStorage.getItem('pageLoadObject');
  currentSelectedSection = JSON.parse(retrievedSectionObject).section
  
}
const toggleAccounts = document.getElementById("toggle-accounts-section");
toggleAccounts.onclick = toggleAccountsSection;

function toggleTransferSection() {
  var x = document.getElementById("accounts-section").style.display = "none";
  var x = document.getElementById("transfer-section").style.display = "block";
  var x = document.getElementById("admin-section").style.display = "none";
  var x = document.getElementById("stats-section").style.display = "none";
  var x = document.getElementById("wallets-section").style.display = "none";
  pageLoadObject = { 'section': "transfer-section"};
  localStorage.setItem('pageLoadObject', JSON.stringify(pageLoadObject));
  retrievedSectionObject = localStorage.getItem('pageLoadObject');
  currentSelectedSection = JSON.parse(retrievedSectionObject).section
}

const toggleTransfers = document.getElementById("toggle-transfer-section");
toggleTransfers.onclick = toggleTransferSection;

function toggleWalletSection() {
  var x = document.getElementById("accounts-section").style.display = "none";
  var x = document.getElementById("transfer-section").style.display = "none";
  var x = document.getElementById("admin-section").style.display = "none";
  var x = document.getElementById("stats-section").style.display = "none";
  var x = document.getElementById("wallets-section").style.display = "block";
  pageLoadObject = { 'section': "wallets-section"};
  localStorage.setItem('pageLoadObject', JSON.stringify(pageLoadObject));
  retrievedSectionObject = localStorage.getItem('pageLoadObject');
  currentSelectedSection = JSON.parse(retrievedSectionObject).section
  console.log(currentSelectedSection)
}

const toggleWallets = document.getElementById("toggle-Wallet-section");
toggleWallets.onclick = toggleWalletSection;




ETH.onclick = function() {
  console.log("clicked ETH")
  ERC20TokenMenu.innerHTML = "ETH"
  testObject = { 'token': "ETH"};
  localStorage.setItem('testObject', JSON.stringify(testObject));
  retrievedObject = localStorage.getItem('testObject');
  currentSelectedToken = JSON.parse(retrievedObject).token
  displayBalance()
}
LINK.onclick = function() {
  ERC20TokenMenu.innerHTML = "LINK"
  testObject = { 'token': "LINK"};
  localStorage.setItem('testObject', JSON.stringify(testObject));
  retrievedObject = localStorage.getItem('testObject');
  currentSelectedToken = JSON.parse(retrievedObject).token
  displayBalance()
}
UNI.onclick = function() {
  ERC20TokenMenu.innerHTML = "UNI"
  testObject = { 'token': "UNI"};
  localStorage.setItem('testObject', JSON.stringify(testObject));
  retrievedObject = localStorage.getItem('testObject');
  currentSelectedToken = JSON.parse(retrievedObject).token
  displayBalance()
}
BNB.onclick = function() {
  ERC20TokenMenu.innerHTML = "BNB"
  testObject = { 'token': "BNB"};
  localStorage.setItem('testObject', JSON.stringify(testObject));
  retrievedObject = localStorage.getItem('testObject');
  currentSelectedToken = JSON.parse(retrievedObject).token
  displayBalance()
}
VET.onclick = function() {
  ERC20TokenMenu.innerHTML = "VET"
  testObject = { 'token': "VET"};
  localStorage.setItem('testObject', JSON.stringify(testObject));
  retrievedObject = localStorage.getItem('testObject');
  currentSelectedToken = JSON.parse(retrievedObject).token
  displayBalance()
}


const toggleTransfer = document.getElementById("toggle-transfer-section");
toggleTransfer.onclick = toggleTransferSection;


document.getElementById("accounts-section").style.display = "none";
document.getElementById("transfer-section").style.display = "none";
document.getElementById("admin-section").style.display = "none";
document.getElementById("stats-section").style.display = "none";
var x = document.getElementById("wallets-section").style.display = "none";
document.getElementById(currentSelectedSection).style.display = "block";
console.log(currentSelectedSection)
loadWeb3();
loadFactory()
loadBlockchainData()
// displayBalance()