import data from '../../build/contracts/MultiSigFactory.json' assert { type: "json" };
import data1  from '../../build/contracts/MultiSigWallet.json' assert { type: "json" };

Moralis.initialize("GDTzbp8tldymuUuarksnrmguFjGjPtzIvTDHPMsq"); // Application id from moralis.io
Moralis.serverURL = "https://um3tbvvvky01.bigmoralis.com:2053/server"; //Server url from moralis.io

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
var retrievedObject = localStorage.getItem('testObject');
var currentSelectedToken = JSON.parse(retrievedObject).token
const ERC20TokenMenu = document.getElementById("ERC20-token-menu")
ERC20TokenMenu.innerHTML = currentSelectedToken

var retrievedSectionObject = localStorage.getItem('pageLoadObject');
var currentSelectedSection = JSON.parse(retrievedSectionObject).section

var currentLoggedInUserObject 
var retrieveCurrentLoggedInUser = localStorage.getItem('currentLoggedInUserObject');
var currentLoggedInUser = JSON.parse(retrieveCurrentLoggedInUser).user


var retrievedUserWalletObject = localStorage.getItem('userWalletObject');
var currentSelectedWallet = JSON.parse(retrievedUserWalletObject).wallet


function toggleAdminSection() {
  var x = document.getElementById("accounts-section").style.display = "none";
  var x = document.getElementById("transfer-section").style.display = "none";
  var x = document.getElementById("admin-section").style.display = "block";
  var x = document.getElementById("stats-section").style.display = "none";
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
  pageLoadObject = { 'section': "transfer-section"};
  localStorage.setItem('pageLoadObject', JSON.stringify(pageLoadObject));
  retrievedSectionObject = localStorage.getItem('pageLoadObject');
  currentSelectedSection = JSON.parse(retrievedSectionObject).section
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


const toggleTransfer = document.getElementById("toggle-transfer-section");
toggleTransfer.onclick = toggleTransferSection;


document.getElementById("accounts-section").style.display = "none";
document.getElementById("transfer-section").style.display = "none";
document.getElementById("admin-section").style.display = "none";
document.getElementById("stats-section").style.display = "none";
document.getElementById(currentSelectedSection).style.display = "block";

loadWeb3();
