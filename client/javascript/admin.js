import data from '../../build/contracts/MultiSigFactory.json' assert { type: "json" };
import data1  from '../../build/contracts/MultiSigWallet.json' assert { type: "json" };
import { loadWeb3, } from "./index.js"

Moralis.initialize("GDTzbp8tldymuUuarksnrmguFjGjPtzIvTDHPMsq"); // Application id from moralis.io
Moralis.serverURL = "https://um3tbvvvky01.bigmoralis.com:2053/server"; //Server url from moralis.io

var contractInstance = "";
var contractFactoryInstance = "";
var account = ""
var currentSelectedToken
var factoryAddress

// Retrieve the object from storage
var retrievedObject = localStorage.getItem('testObject');
var currentSelectedToken = JSON.parse(retrievedObject).token

// Retrieve the object from storage
var retrievedUserWalletObject = localStorage.getItem('userWalletObject');
var currentSelectedWallet = JSON.parse(retrievedUserWalletObject).wallet

var retrieveCurrentLoggedInUser = localStorage.getItem('currentLoggedInUserObject');
var currentLoggedInUser = JSON.parse(retrieveCurrentLoggedInUser).user

var testObject 

async function loadFactory() {
  const web3 = window.web3

  //gets all user accounts and displays the current user on the UI (navbar)
  var accounts = await web3.eth.getAccounts()
  account = currentLoggedInUser;    
 
  
  const networkId = await web3.eth.net.getId()
  const networkData = data.networks[networkId]
  factoryAddress = networkData.address
  if(networkData) {

    contractFactoryInstance = new web3.eth.Contract(data.abi, networkData.address, {from: account})
      
  } else {
    window.alert('contract not deployed to detected network.')
    
  }

  await contractFactoryInstance.methods.getWalletID(currentSelectedWallet).call().then(function(result) {
    document.getElementById("display-wallet-id").innerHTML = "Wallet ID: " + result;

  })

  
}

async function loadBlockchainData() {

    const web3 = window.web3

    //gets all user accounts and displays the current user on the UI (navbar)
    var accounts = await web3.eth.getAccounts()
    account = currentLoggedInUser;    
    document.getElementById("display-address").innerHTML = "Account: " + account.slice(0, 6) + "..";
 
    
    const networkId = await web3.eth.net.getId()
    const networkData = data1.networks[networkId]
    if(networkData) {
        
        contractInstance = new web3.eth.Contract(data1.abi, currentSelectedWallet, {from: account})
     
    } else {
        window.alert('contract not deployed to detected network.')
        
    }

    loadWalletOwners()
}
 


async function loadWalletOwners() {

  const owners = contractInstance.methods.getUsers().call({from: account.toString()}).then(function(result) {
    for (let i = 0; i < result.length; i++) {
          addUserToTable1.innerHTML += `
          <tr "class="tablerow">
              <td>${result[i]}</td>
              <td>${"Evan McGrane"}</td>
              <td><span id ="${result[i]}">Remove</span></td>
          </tr>`  
    }
  })
}

function addUser(){
    console.log(currentSelectedToken)
    var addUserNullAddressField = document.getElementById("add-user-address-field");
    var addUserNullNameField = document.getElementById("add-user-name-field");

    if (addUserNullAddressField.value == "" || addUserNullNameField == "") {
      document.getElementById("popup-1").classList.toggle("active");
      return;
    }

    contractInstance.methods.addUsers(addUserNullAddressField.value, factoryAddress, currentSelectedWallet ).send({from: account}).on("transactionHash", function(hash) {
          loadLoader();  
    }).on("receipt", function(receipt) {
          
          hideLoader();
          var popupMessage = document.getElementById("msg").innerHTML = "Wallet owner has been added";
          displayAddOwnerPopup(popupMessage);
          
          addUserToTable1.innerHTML += `
          <tr class="tablerow">
              <td>${addUserNullAddressField.value}</td>
              <td>${"No name provided"}</td>
              <td ><span id=${addUserNullAddressField.value} class="testb">Remove</span></td>
          </tr>`

          // contractFactoryInstance.methods.addOwner(addUserNullAddressField.value, currentSelectedWallet).send({from: account})

      }).on("error", function(error) {
          var popupMessage = document.getElementById("msg").innerHTML = "User denied the tranaction";
          displayAddOwnerPopup(popupMessage);
          hideLoader();
      })

}

//function that lets the main wallet owner (contract deployer) remove a new wallet signatory
async function removeUser(){
  
  var nullAddressField = document.getElementById("remove-user-address-field");
  var nullNameField = document.getElementById("remove-user-name-field");

  if (nullAddressField.value == "" || nullNameField == "") {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }

  var counter = 1;
  await contractInstance.methods.getUsers().call().then(function(transferss) {
    for (let i = 0; i < transferss.length; i++) {
      if (transferss[i] == nullAddressField.value) {
         break;
      }
      counter++;
    }
  })
  
  const removeUser = contractInstance.methods.removeUser(nullAddressField.value, factoryAddress, currentSelectedWallet).send({from: account}).on("transactionHash", function(hash) {
        loadLoader();  

    }).on("receipt", function(receipt) {
       
        hideLoader();
        var popupMessage = document.getElementById("msg").innerHTML = "Wallet owner has been removed";
        displayAddOwnerPopup(popupMessage);
        addUserToTable1.deleteRow(counter); 

    }).on("error", function(error) {
        var popupMessage = document.getElementById("msg").innerHTML = "User denied the tranaction";
        displayAddOwnerPopup(popupMessage);
        hideLoader();
    })
}

async function removeWallletOwner(e) {
  
  const ownerId = e.target.id;
  var counter = 1;
  await contractInstance.methods.getUsers().call().then(function(transferss) {
    for (let i = 0; i < transferss.length; i++) {
      if (transferss[i] == ownerId) {
         break;
      }
      counter++;
    }
  })

  const removeUser = contractInstance.methods.removeUser(ownerId, factoryAddress, currentSelectedWallet).send({from: account}).on("transactionHash", function(hash) {
        loadLoader();  
    }).on("receipt", function(receipt) {
       
        hideLoader();
        var popupMessage = document.getElementById("msg").innerHTML = "Wallet owner has been removed";
        displayAddOwnerPopup(popupMessage);
        addUserToTable1.deleteRow(counter);

    }).on("error", function(error) {
        var popupMessage = document.getElementById("msg").innerHTML = "User denied the transaction";
        displayAddOwnerPopup(popupMessage);
        hideLoader();
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
  
  
const t1 = document.querySelectorAll("table")[0];
t1.addEventListener("click", removeWallletOwner);

const addUserToTable1 = document.getElementById("owners-table")
const addUserToTable = document.getElementById("owners-table1")

var removeUserButton = document.getElementById("remove-user-from-wallet")
removeUserButton.onclick = removeUser;

var addUserButton = document.getElementById("add-user-to-wallet");
addUserButton.onclick = addUser;

loadWeb3();
loadFactory()
loadBlockchainData()
