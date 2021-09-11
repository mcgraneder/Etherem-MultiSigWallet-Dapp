import data from '../../build/contracts/MultiSigFactory.json' assert { type: "json" };
import data1  from '../../build/contracts/MultiSigWallet.json' assert { type: "json" };
import { loadWeb3, loadFactory } from "./index.js"
Moralis.initialize("GDTzbp8tldymuUuarksnrmguFjGjPtzIvTDHPMsq"); // Application id from moralis.io
Moralis.serverURL = "https://um3tbvvvky01.bigmoralis.com:2053/server"; //Server url from moralis.io

var contractInstance = "";
var contractFactoryInstance = "";
var account = ""
var currentSelectedToken
var quickSelect
// Retrieve the object from storage
var retrievedObject = localStorage.getItem('testObject');
var currentSelectedToken = JSON.parse(retrievedObject).token

// Retrieve the object from storage
var retrievedUserWalletObject = localStorage.getItem('userWalletObject');
var currentSelectedWallet = JSON.parse(retrievedUserWalletObject).wallet

var retrieveCurrentLoggedInUser = localStorage.getItem('currentLoggedInUserObject');
var currentLoggedInUser = JSON.parse(retrieveCurrentLoggedInUser).user

var testObject 





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

    loadPendingTransfers()
    loadAccountsTables("transferRequestApproved")
    loadAccountsTables("transferRequestCancelled")
}

async function loadPendingTransfers() {
    const pending = contractInstance.methods.getTransferRequests().call().then(function(result) {
      for (let i = 0; i < result.length; i++) {
        var transferDate1 = new Date(result[i].timeOfCreation * 1000);
        addPendingTranferToTable.innerHTML += `
        <tr id="tablerow">
              <td id="${result[i].id}">${result[i].ticker}</td>
              <td id="${result[i].id}">${result[i].id}</td>
              <td id="${result[i].id}">${result[i].receiver.slice(0, 20) + "..."}</td>
              <td id="${result[i].id}">${result[i].sender.slice(0, 20) + "..."}</td>
              <td id="${result[i].id}">${result[i].amount / 10**18 + currentSelectedToken}</td>
              <td id="${result[i].id}">${transferDate1.toUTCString()}</td>
              <td id="${result[i].id}">${result[i].approvals}</td> 
          </tr>`    
      }
    })
  }

  async function loadAccountsTables(tableName) {

    var table;
    if(tableName == "transferRequestApproved") table = addTranferToTable;
    else if(tableName == "transferRequestCancelled") table = addCancelledTranferToTable
  
    var results = await contractInstance.getPastEvents(tableName,{fromBlock: 0}).then(function(result) {
     
      for (let i = 0; i < result.length; i++) {
        var amount = result[i].returnValues.amount / 10 ** 18;
        var date1 = new Date(result[i].returnValues.timeStamp * 1000);
        table.innerHTML += `
        <tr onclick="console.log('hello')" id="tablerow">
              <td id="${result[i].returnValues.id}">${result[i].returnValues.ticker}</td>
              <td id="${result[i].returnValues.id}">${result[i].returnValues.id}</td>
              <td id="${result[i].returnValues.id}">${result[i].returnValues.receiver.slice(0, 20) + "..."}</td>
              <td id="${result[i].returnValues.id}">${result[i].returnValues.sender.slice(0, 20) + "..."}</td>
              <td id="${result[i].returnValues.id}">${result[i].returnValues.amount / 10**18 + " ETH"}</td>
              <td id="${result[i].returnValues.id}">${date1.toUTCString()}</td>
          </tr>`
      }
    })
  }

  

  var quickTransferCancelButton = document.getElementById("quick-cancel")
quickTransferCancelButton.onclick = cancelTransferRequest

var quickTransferApproveButton = document.getElementById("quick-approve")
quickTransferApproveButton.onclick = approveTransferRequest
///////////////////////////////////#/////////////////////////////////////////////
//                                                                            //   
//   FUNCTIONS FOR THE TRANSFER SECTION CREATE/CANCEL/APPROVE TRANSFERS                                                           //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

function createTransferRequest() {

  var receiverAddress = document.getElementById("create-transfer-reciever-address-field");
  var transferAmount = document.getElementById("create-transfer-amount-field");

  if (receiverAddress.value == "" || transferAmount.value == "" ) {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }
  
  const createTransferRequest = contractInstance.methods.createTransfer(currentSelectedToken, web3.utils.toWei(String(transferAmount.value), "ether"), receiverAddress.value).send({from: account}).on("transactionHash", function(hash) {
    loadLoader();
  }).on("receipt", function(receipt) {
     
      hideLoader();
      var popupMessage = document.getElementById("msg").innerHTML = "Transfer Request has successfully been created";
      const pendingTranfer = contractInstance.methods.getTransferRequests().call().then(function(result) {
        var date1 = new Date(result[result.length - 1].timeStamp * 1000);
        addPendingTranferToTable.innerHTML += `
        <tr class="tablerow">
              <td>${result[result.length - 1].ticker}</td>
              <td>${result[result.length - 1].id}</td>
              <td>${result[result.length - 1].receiver.slice(0, 15) + "..."}</td>
              <td>${result[result.length - 1].sender.slice(0, 15) + "..."}</td>
              <td>${result[result.length - 1].amount / 10**18 + " ETH"}</td>
              <td>${date1.toUTCString()}</td>
              <td>${result[result.length - 1].approvals}</td>
          </tr>`
      })
      displayAddOwnerPopup(popupMessage);
      displayBalance()
      window.location.reload(true)
    
  }).on("error", function(error) {
      var popupMessage = document.getElementById("msg").innerHTML = "User denied the transaction";
      displayAddOwnerPopup(popupMessage);
      hideLoader();
  })

}

var tableRowIndex
async function cancelTransferRequest() {
 
  var transferID = document.getElementById("cancel-transfer-id-field");
  if(quickSelect != true) {
    tableRowIndex = transferID.value
  }
  var counter = 1;
  var btn = tableRowIndex
  
  const cancelTransferRequest = await contractInstance.methods.cancelTransfer(currentSelectedToken, btn).send({from: account}).on("transactionHash", function(hash) {
    loadLoader();
  }).on("receipt", function(receipt) {
      
      hideLoader();
      var popupMessage = document.getElementById("msg").innerHTML = "Transfer Request has successfully been canceled";
      displayAddOwnerPopup(popupMessage);

      contractInstance.methods.getTransferRequests().call().then(function(transferss) {
        var hasBeenFound = false;
        for (let i = 0; i < transferss.length; i++) {
         
          if (transferss[i].id == btn) {
            hasBeenFound = true;
            break;
          }
          counter++;
        }
        if (hasBeenFound == true) {
          return;
        }
        else {
          var results = contractInstance.getPastEvents(
            "transferRequestCancelled",
            {fromBlock: 0}
          ).then(function(result) {
            var amount = result[result.length - 1].returnValues.amount / 10 ** 18;
            var date1 = new Date(result[result.length - 1].returnValues.timeStamp * 1000);
            addCancelledTranferToTable.innerHTML += `
                <tr onclick="console.log('hello')" id="tablerow">
                      <td id="${result[result.length - 1].id}">${result[result.length - 1].returnValues.ticker}</td>
                      <td id="${result[result.length - 1].id}">${result[result.length - 1].returnValues.id}</td>
                      <td id="${result[result.length - 1].id}">${result[result.length - 1].returnValues.receiver.slice(0, 20) + "..."}</td>
                      <td id="${result[result.length - 1].id}">${result[result.length - 1].returnValues.sender.slice(0, 20) + "..."}</td>
                      <td id="${result[result.length - 1].id}">${result[result.length - 1].returnValues.amount / 10**18 + " ETH"}</td>
                      <td id="${result[result.length - 1].id}">${date1.toUTCString()}</td>
                </tr>`    
          })
        }
        displayBalance();
        addPendingTranferToTable.deleteRow(counter)
        quickSelect = false;
      })
      
  }).on("error", function(error) {
      hideLoader();  
  })

}
1
function tableRowClicked(e) {
  tableRowIndex = e.target.id;
  quickSelect = true 
  }


async function approveTransferRequest(e) {
  
  var transferID = document.getElementById("approve-transfer-field");
  if(quickSelect != true) {
    tableRowIndex = transferID.value
  }

  var approvalCounter = 1;
  var counter = 1;
  const approveTransferRequest = await contractInstance.methods.Transferapprove(currentSelectedToken, tableRowIndex).send({from: account}).on("transactionHash", function(hash) {  
    loadLoader();

  }).on("confirmation", function(confirmationNr) {
    
  }).on("receipt", function(receipt) {
    
      hideLoader();
      var popupMessage = document.getElementById("msg").innerHTML = "Transfer Request has successfully been approved";
      displayAddOwnerPopup(popupMessage);
      contractInstance.methods.getTransferRequests().call().then(function(transferss) {

        var hasBeenFound = false;
        for (let i = 0; i < transferss.length; i++) {
         
          if (transferss[i].id == tableRowIndex) {
            hasBeenFound = true;
            break;
          }
          approvalCounter++;
        }
        if (hasBeenFound) {
          addPendingTranferToTable.rows[approvalCounter].cells[6].innerHTML = transferss[approvalCounter - 1].approvals;
        }
        
        if (hasBeenFound == true) {
          return;
        }
        else {
          var results = contractInstance.getPastEvents(
            "transferRequestApproved",
            {fromBlock: 0}
          ).then(function(result) {

            for (let i = 0; i < result.length; i++) {
      
              if(result[i].id == transferID.value) {
                break;
              }
              counter++
            }
            
            var amount = result[result.length - 1].returnValues.amount;
            amount = amount / 10 ** 18;
            var date = result[result.length - 1].returnValues.timeStamp;
            var date1 = new Date(date * 1000);
            addTranferToTable.innerHTML += `
                <tr onclick="console.log('hello')" id="tablerow">
                      <td id="${result[result.length - 1].returnValues.id}">${result[result.length - 1].returnValues.ticker}</td>
                      <td id="${result[result.length - 1].returnValues.id}">${result[result.length - 1].returnValues.id}</td>
                      <td id="${result[result.length - 1].returnValues.id}">${result[result.length - 1].returnValues.receiver.slice(0, 20) + "..."}</td>
                      <td id="${result[result.length - 1].returnValues.id}">${result[result.length - 1].returnValues.sender.slice(0, 20) + "..."}</td>
                      <td id="${result[result.length - 1].returnValues.id}">${result[result.length - 1].returnValues.amount / 10**18 + " ETH"}</td>
                      <td id="${result[result.length - 1].returnValues.id}">${date1.toUTCString()}</td>
                </tr>` 
          })
        }
        quickSelect = false;
        if (transferss.length == 1) {
          addPendingTranferToTable.deleteRow(counter + 1);
        }
        else {
          addPendingTranferToTable.deleteRow(counter);
        }  
      })
      displayBalance()
  }).on("error", function(error) {
      console.log("user denied transaction");
      hideLoader();
  })
}

async function showTxInformation(e) {

  var id = e.target.id;
  var event = e.target.closest("table").className
  var eventName
  var tableName;
 
  var div = document.getElementById("etherscan-link")
  var etherscanLink = document.createElement("a")
  etherscanLink.setAttribute('target', "_blank")
  etherscanLink.innerHTML = "View Transaction on Etherscan"
  
  if (event == "deposit-detail-table") {
    eventName = "fundsDeposited"
    tableName = "Deposit tableRowIndex: "
  }
  if (event == "pending-transfer-detail-table") {
    eventName = "TransferRequestCreated"
    tableName = "Transfer tableRowIndex: "
  }
  else if(event == "withdrawal-detail-table") {
    eventName = "fundsWithdrawed"
    tableName = "Withdrawal tableRowIndex: "
  }
  else if (event == "transfer-detail-table") {
    eventName = "transferRequestApproved"
    tableName = "Transfer tableRowIndex: "
    console.log("success")
  }
  else if(event =="cancelled-transfer-detail-table") {
    eventName = "transferRequestCancelled"
    tableName = "Cancelled-Trnasfer tableRowIndex: "
  }
 
  document.getElementById("tx-details").innerHTML = tableName + id;
  togglePopup2()

  var counter = 0;
  var hasBeenFound = false;
  var results = await contractInstance.getPastEvents(eventName, {fromBlock: 0}).then(function(result) {
    
    //here before we enter past events get table id.rows from DOM. Then predetermine the row index to save the below for loop
    for (let i = 0; i < result.length; i++ ) {
      if(result[i].returnValues.id == id) {
        hasBeenFound = true;
        break;
      }
      counter++
    }
    if(hasBeenFound == false) {
      return
    }
    console.log(counter)
    etherscanLink.setAttribute('href', "https://rinkeby.etherscan.io//tx/"+`${result[counter].transactionHash}`)
    div.appendChild(etherscanLink)
    var tx = web3.eth.getTransaction(result[counter].transactionHash).then(function(gas) {
        var blockHash = result[counter].blockHash;
        var txAddress = result[counter].address;
        var txHash = result[counter].transactionHash
        var txSig = result[counter].signature;
        showDepositInfo.innerHTML += `
              <tr>
                <td>Block Hash</td>
                <td>${blockHash.slice(0, 21) + "..."}</td>
              </tr>
              <tr>
                <td>Block Number</td>
                <td>${result[counter].blockNumber}</td>
              </tr>
              <tr>
                <td>TX tableRowIndex</td>
                <td>${result[counter].id}</td>
              </tr>
              <tr>
                <td>TX Nonce</td>
                <td>${gas.nonce}</td>
              </tr>
              <tr>
                <td>Gas Used</td>
                <td>${gas.gas}</td>
              </tr>
              <tr>
                <td>Gas Price</td>
                <td>${gas.gasPrice}</td>
              </tr>`
        })   
  })
}

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

const t = document.querySelectorAll("table")[3];
t.addEventListener("click", tableRowClicked);

const addPendingTranferToTable = document.querySelectorAll("tbody")[3];

const addTranferToTable = document.querySelectorAll("tbody")[4];
const addCancelledTranferToTable = document.querySelectorAll("tbody")[5];
const showDepositInfo = document.querySelectorAll("tbody")[6];

var transfer = document.getElementById("transfer");
transfer.onclick = createTransferRequest;

var cancelTransfer = document.getElementById("cancel-transfer");
cancelTransfer.onclick = cancelTransferRequest;

const pendingtransferInfo = document.querySelectorAll("table")[3];
pendingtransferInfo.addEventListener("click", showTxInformation);

const transferInfo = document.querySelectorAll("table")[4];
transferInfo.addEventListener("click", showTxInformation);

const CancelledTransferInfo = document.querySelectorAll("table")[5];
CancelledTransferInfo.addEventListener("click", showTxInformation);

loadWeb3();
loadBlockchainData()