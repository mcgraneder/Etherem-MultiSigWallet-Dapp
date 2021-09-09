import data from '../../build/contracts/MultiSigFactory.json' assert { type: "json" };
import data1  from '../../build/contracts/MultiSigWallet.json' assert { type: "json" };

Moralis.initialize("GDTzbp8tldymuUuarksnrmguFjGjPtzIvTDHPMsq"); // Application id from moralis.io
Moralis.serverURL = "https://um3tbvvvky01.bigmoralis.com:2053/server"; //Server url from moralis.io

var contractInstance = "";
var contractFactoryInstance = "";
var account = ""
var quickSelect
var currentSelectedToken



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
var testObject 



// Retrieve the object from storage
var retrievedObject = localStorage.getItem('testObject');
var currentSelectedToken = JSON.parse(retrievedObject).token
console.log('retrievedObject: ', JSON.parse(retrievedObject).token);
const ERC20TokenMenu = document.getElementById("ERC20-token-menu")
ERC20TokenMenu.innerHTML = currentSelectedToken


var pageLoadObject = {'section': "admin-section"}



// Retrieve the object from storage
// localStorage.setItem('pageLoadObject', JSON.stringify(pageLoadObject));
var retrievedSectionObject = localStorage.getItem('pageLoadObject');
var currentSelectedSection = JSON.parse(retrievedSectionObject).section
console.log('retrievedSectionObject: ', JSON.parse(retrievedSectionObject).section)
// the loadBlockchainData() function loads al Dapp information on the page load. We initialisise
// a connection to our smart contract and get the users ethereum account so that we can call the
// functions defined in our smart contract. Other information like user data such as
// transaction histroy is also extracted from the BC and loaded using this function

var currentLoggedInUserObject 
// Retrieve the object from storage
var retrieveCurrentLoggedInUser = localStorage.getItem('currentLoggedInUserObject');
var currentLoggedInUser = JSON.parse(retrieveCurrentLoggedInUser).user
console.log('retrieveCurrentLoggedInUser: ', JSON.parse(retrieveCurrentLoggedInUser).user);
console.log(currentLoggedInUser)

// Retrieve the object from storage
var retrievedUserWalletObject = localStorage.getItem('userWalletObject');
var currentSelectedWallet = JSON.parse(retrievedUserWalletObject).wallet
console.log('retrievedWalletObject: ', JSON.parse(retrievedUserWalletObject).wallet);
console.log("the current wallet is" + currentSelectedWallet)


async function loadFactory() {
  const web3 = window.web3

  //gets all user accounts and displays the current user on the UI (navbar)
  var accounts = await web3.eth.getAccounts()
  account = accounts[0];    
 
  
  const networkId = await web3.eth.net.getId()
  const networkData = data.networks[networkId]
  if(networkData) {
    contractFactoryInstance = new web3.eth.Contract(data.abi, networkData.address, {from: account})
    console.log("the smart contract is " + networkData.address);
    console.log(contractFactoryInstance)
      
  } else {
    window.alert('contract not deployed to detected network.')
    
  }
}



async function loadBlockchainData() {

  const web3 = window.web3

  //gets all user accounts and displays the current user on the UI (navbar)
  var accounts = await web3.eth.getAccounts()
  account = accounts[0];    
  document.getElementById("display-address").innerHTML = "Account: " + account.slice(0, 6) + "..";
 
  
  

    console.log("you do own this wallet")
    //gets the current network tableRowIndex (e.g ropsten, kovan, mainnet) and uses the contract abi imported at the
    //top of this file to make a new contract instamce using web3.js new contract function. 
    const networkId = await web3.eth.net.getId()
    const networkData = data1.networks[networkId]
    if(networkData) {
      
      contractInstance = new web3.eth.Contract(data1.abi, currentSelectedWallet, {from: account})
      console.log("the smart contract is " + currentSelectedWallet);
      console.log(contractInstance)

      
        
    } else {
      window.alert('contract not deployed to detected network.')
      
    }

  
  
    document.getElementById("display-wallet-id").innerHTML = "WalletID: 1";
    displayBalance();
    loadPendingTransfers()
    loadAccountsTables("transferRequestApproved")
    loadAccountsTables("transferRequestCancelled")
    loadAdminTables("fundsDeposited")
    loadAdminTables("fundsWithdrawed")
    loadWalletOwners()
    // loadChart()
}
 




//function to display user balance
function displayBalance() {
  const balance = contractInstance.methods.getAccountBalance(currentSelectedToken).call().then(function(balance) {
    balance = balance / 10 ** 18;
    balance = balance.toFixed(4)
    document.getElementById("display-balance").innerHTML = "balance: " + balance + "" + currentSelectedToken;
  })
}

function loadLoader() {
  $(".loading").show();
}

function hideLoader() {
  $(".loading").fadeOut(1200);
}


function displayAddOwnerPopup(popupMessage){
  popupMessage
  $('.alert').addClass("show");
  $('.alert').removeClass("hide");
  $('.alert').addClass("showAlert");
  setTimeout(function(){
    $('.alert').removeClass("show");
    $('.alert').addClass("hide");
  },5000);
}
function hideAddOwnerPopup(){
  $('.alert').removeClass("show");
  $('.alert').addClass("hide");
}

function togglePopup2(){

  document.getElementById("popup-2").classList.toggle("active");
  var x = document.getElementById("nav");
  if (x.style.display === "none") {
      x.style.display = "flex";
  } else {
      x.style.display = "none";
  }
  var length = showDepositInfo.rows.length
  for (let i = 0; i < length; i++) {
    showDepositInfo.deleteRow(0);
  }

  var all_links = document.getElementsByTagName("a");
  all_links[all_links.length - 1].removeAttribute("href");
  all_links[all_links.length - 1].innerHTML = ""
}
function tableRowClicked(e) {
  tableRowIndex = e.target.id;
  quickSelect = true 
  }

function toggleAdminSection() {
  var x = document.getElementById("accounts-section").style.display = "none";
  var x = document.getElementById("transfer-section").style.display = "none";
  var x = document.getElementById("admin-section").style.display = "block";
  var x = document.getElementById("stats-section").style.display = "none";
  pageLoadObject = { 'section': "admin-section"};
  localStorage.setItem('pageLoadObject', JSON.stringify(pageLoadObject));
  retrievedSectionObject = localStorage.getItem('testObject');
  currentSelectedSection = JSON.parse(retrievedSectionObject).section
  console.log(currentSelectedSection)

  
}
const toggleAdmin = document.getElementById("toggle-admin-section");
toggleAdmin.onclick = toggleAdminSection;

function toggleAccountsSection() {
  var x = document.getElementById("accounts-section").style.display = "block";
  var x = document.getElementById("transfer-section").style.display = "none";
  var x = document.getElementById("admin-section").style.display = "none";
  var x = document.getElementById("stats-section").style.display = "none";
  pageLoadObject = { 'section': "accounts-section"};
  localStorage.setItem('pageLoadObject', JSON.stringify(pageLoadObject));
  retrievedSectionObject = localStorage.getItem('pageLoadObject');
  currentSelectedSection = JSON.parse(retrievedSectionObject).section
  console.log(currentSelectedSection)
  
}
const toggleAccounts = document.getElementById("toggle-accounts-section");
toggleAccounts.onclick = toggleAccountsSection;

function toggleTransferSection() {
  var x = document.getElementById("accounts-section").style.display = "none";
  var x = document.getElementById("transfer-section").style.display = "block";
  var x = document.getElementById("admin-section").style.display = "none";
  var x = document.getElementById("stats-section").style.display = "none";
  pageLoadObject = { 'section': "transfer-section"};
  localStorage.setItem('pageLoadObject', JSON.stringify(pageLoadObject));
  retrievedSectionObject = localStorage.getItem('pageLoadObject');
  currentSelectedSection = JSON.parse(retrievedSectionObject).section
  console.log(currentSelectedSection)  
}

const toggleTransfers = document.getElementById("toggle-transfer-section");
toggleTransfers.onclick = toggleTransferSection;



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


const t = document.querySelectorAll("table")[3];
t.addEventListener("click", tableRowClicked);



const toggleTransfer = document.getElementById("toggle-transfer-section");
toggleTransfer.onclick = toggleTransferSection;


document.getElementById("accounts-section").style.display = "none";
document.getElementById("transfer-section").style.display = "none";
document.getElementById("admin-section").style.display = "none";
document.getElementById("stats-section").style.display = "none";
document.getElementById(currentSelectedSection).style.display = "block";
console.log("cccccccccccccccccccccccccccccc" + currentSelectedSection)



const showDepositInfo = document.querySelectorAll("tbody")[6];

var transfer = document.getElementById("transfer");
transfer.onclick = createTransferRequest;

var cancelTransfer = document.getElementById("cancel-transfer");
cancelTransfer.onclick = cancelTransferRequest;

var depositToWallet = document.getElementById("deposit");
depositToWallet.onclick = depositFunds;

var withdrawFromWallet = document.getElementById("withdraw");
withdrawFromWallet.onclick = withdrawFunds;

var addUserButton = document.getElementById("add-user-to-wallet");
addUserButton.onclick = addUser;

const depositInfo = document.querySelectorAll("table")[1];
depositInfo.addEventListener("click", showTxInformation);

const withdrawalInfo = document.querySelectorAll("table")[2];
withdrawalInfo.addEventListener("click", showTxInformation);

const pendingtransferInfo = document.querySelectorAll("table")[3];
pendingtransferInfo.addEventListener("click", showTxInformation);

const transferInfo = document.querySelectorAll("table")[4];
transferInfo.addEventListener("click", showTxInformation);

const CancelledTransferInfo = document.querySelectorAll("table")[5];
CancelledTransferInfo.addEventListener("click", showTxInformation);

loadWeb3();
loadFactory();
loadBlockchainData()