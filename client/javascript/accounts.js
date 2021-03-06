import data from '../../build/contracts/MultiSigFactory.json' assert { type: "json" };
import data1  from '../../build/contracts/MultiSigWallet.json' assert { type: "json" };
import erc20abi from "./ERC20Abi.json" assert { type: "json" };
import { loadWeb3, loadFactory } from "./index.js"

Moralis.initialize("GDTzbp8tldymuUuarksnrmguFjGjPtzIvTDHPMsq"); // Application id from moralis.io
Moralis.serverURL = "https://um3tbvvvky01.bigmoralis.com:2053/server"; //Server url from moralis.io

var contractInstance = "";
var contractInstance1
var contractFactoryInstance = "";
var account = ""
var currentSelectedToken

const LINK = "0xBc9d279729B41871Ec6d0b075D3713eb3c5DB143"
const VET = "0xF8d738896207687dd1C3d7E2235aDa67bbBe57f2"
const UNI = "0xD8972BB15Ed596661f12d223f55a531F0e649694"
const BNB = "0x6d8D8845165EF37eCb6695e183B45Fa759F1d603"
// Retrieve the object from storage
var retrievedObject = localStorage.getItem('testObject');
var currentSelectedToken = JSON.parse(retrievedObject).token
console.log(currentSelectedToken)
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
    account = currentLoggedInUser;;    
    document.getElementById("display-address").innerHTML = "Account: " + account.slice(0, 6) + "..";
 
    
    const networkId = await web3.eth.net.getId()
    const networkData = data1.networks[networkId]
    if(networkData) {
        
      contractInstance = new web3.eth.Contract(data1.abi, currentSelectedWallet, {from: account})
       
    } else {
        window.alert('contract not deployed to detected network.')
        
    }

    // document.getElementById("display-wallet-id").innerHTML = "WalletID: 1";
    if(currentSelectedToken == "LINK") {
    contractInstance1 = new web3.eth.Contract(erc20abi, "0xBc9d279729B41871Ec6d0b075D3713eb3c5DB143", {from: account})

    }
    else if (currentSelectedToken == "BNB") {
    contractInstance1 = new web3.eth.Contract(erc20abi, "0x6d8D8845165EF37eCb6695e183B45Fa759F1d603", {from: account})

    }
    else if (currentSelectedToken == "VET") {
      contractInstance1 = new web3.eth.Contract(erc20abi, "0xF8d738896207687dd1C3d7E2235aDa67bbBe57f2", {from: account})
  
    }
    else if (currentSelectedToken == "UNI") {
      contractInstance1 = new web3.eth.Contract(erc20abi, "0xD890xD8972BB15Ed596661f12d223f55a531F0e6496942BB15Ed596661f12d223f55a531F0e649694", {from: account})
  
      }
    
   
    loadAdminTables("fundsDeposited")
    loadAdminTables("fundsWithdrawed")
}

//loads the table data from the admin section on page load. This function is called from the loadBlockchainData()
//function
async function loadAdminTables(tableName) {
    var table;
    if(tableName == "fundsDeposited") table = addDepositToTable;
    else if(tableName == "fundsWithdrawed") table = addWithdrawalToTable
    
    var results = await contractInstance.getPastEvents(tableName, {fromBlock: 0}).then(function(result) {
      for (let i = 0; i < result.length; i++) {
        var amount = result[i].returnValues.amount / 10 ** 18;
        var date1 = new Date(result[i].returnValues.timeStamp * 1000);
        table.innerHTML += `
            <tr "class="tablerow">
                <td id=${result[i].returnValues.id}>${result[i].returnValues.ticker}</td>
                <td id=${result[i].returnValues.id}>${result[i].returnValues.id}</td>
                <td id=${result[i].returnValues.id}>${result[i].returnValues.from}</td>
                <td id=${result[i].returnValues.id}>${amount + " ETH"}</td>
                <td id=${result[i].returnValues.id}>${date1.toUTCString()}</td>
            </tr>`
      }
    })
}

async function depositFunds(token) {
  
    var nullDepositField = document.getElementById("deposit-field");
    if (nullDepositField.value == "") {
      document.getElementById("popup-1").classList.toggle("active");
      return;
    }
    
    if(currentSelectedToken == "ETH") {
      var dep = await contractInstance.methods.deposit().send({value: web3.utils.toWei(String(nullDepositField.value), "ether"), from: account}).on("transactionHash", function(hash) {   
        loadLoader();
        
      }).on("receipt", function(receipt) {
          
          hideLoader();
          var popupMessage = document.getElementById("msg").innerHTML = "Deposit successful! Balance has been updated";
          displayAddOwnerPopup(popupMessage);
    
      }).on("error", function(error) {
          var popupMessage = document.getElementById("msg").innerHTML = "User denied the transaction";
          displayAddOwnerPopup(popupMessage);
          hideLoader();
          
      }).then(function(result) {
          displayBalance()
      })
    }
    else {
        await contractInstance1.methods.approve(currentSelectedWallet, web3.utils.toWei(String(nullDepositField.value), "ether")).send({from: account})
        await contractInstance.methods.depositERC20Token(web3.utils.toWei(String(nullDepositField.value), "ether"), currentSelectedToken).send({from: account}).on("transactionHash", function(hash) {   
        loadLoader();
        
      }).on("receipt", function(receipt) {
          
          hideLoader();
          var popupMessage = document.getElementById("msg").innerHTML = "Deposit successful! Balance has been updated";
          displayAddOwnerPopup(popupMessage);
    
      }).on("error", function(error) {
          var popupMessage = document.getElementById("msg").innerHTML = "User denied the transaction";
          displayAddOwnerPopup(popupMessage);
          hideLoader();
          
      }).then(function(result) {
          displayBalance()
      })
    }
    
    await updateAdminTables("fundsDeposited")
  }
  
  //lets any of the wallet owners withdraw both ETH nad ERC20 tokens into the wallet
  function withdrawFunds() {
    
    var nullWithdrawalField = document.getElementById("withdraw-field");
    if (nullWithdrawalField.value == "") {
      document.getElementById("popup-1").classList.toggle("active");
      return;
    }
  
    if(currentSelectedToken == "ETH") {
      var dep = contractInstance.methods.withdraw(web3.utils.toWei(String(nullWithdrawalField.value), "ether")).send({from: account}).on("transactionHash", function(hash) {   
        loadLoader();
        
      }).on("receipt", function(receipt) {
          
          hideLoader();
          var popupMessage = document.getElementById("msg").innerHTML = "Withdrawal successful! Balance has been updated";
          displayAddOwnerPopup(popupMessage);
    
      }).on("error", function(error) {
          var popupMessage = document.getElementById("msg").innerHTML = "User denied the transaction";
          displayAddOwnerPopup(popupMessage);
          hideLoader();
          
      }).then(function(result) {
          displayBalance()
      })
    }
    else {
      var dep = contractInstance.methods.withdrawERC20Token(web3.utils.toWei(String(nullWithdrawalField.value), "ether"), currentSelectedToken).send({from: account}).on("transactionHash", function(hash) {   
        loadLoader();
        
      }).on("receipt", function(receipt) {
          
          hideLoader();
          var popupMessage = document.getElementById("msg").innerHTML = "Withdrawal successful! Balance has been updated";
          displayAddOwnerPopup(popupMessage);
    
      }).on("error", function(error) {
          hideLoader();
          
      }).then(function(result) {
          var popupMessage = document.getElementById("msg").innerHTML = "User denied the transaction";
          displayAddOwnerPopup(popupMessage);
          displayBalance()
      })
    }
    
    updateAdminTables("fundsWithdrawed")
  }

  
  function updateAdminTables(eventName) {
  
    var table;
    if(eventName == "fundsDeposited") table = addDepositToTable
    else if(eventName == "fundsWithdrawed") table = addWithdrawalToTable
  
    contractInstance.once(eventName, 
          {
          filter: { player: account },
          fromBlock: 'latest'
          }, (error, event) => {
          if(error) throw("Error fetching events");
          var date = event.returnValues.timeStamp;
          var date1 = new Date(date * 1000);
          var amount = event.returnValues.amount;
          amount = amount / 10 ** 18;
          table.innerHTML += `
            <tr class="tablerow">
                <td id=${event.returnValues.id}>${event.returnValues.ticker}</td>
                <td id=${event.returnValues.id}>${event.returnValues.id}</td>
                <td id=${event.returnValues.id}>${event.returnValues.from}</td>
                <td id=${event.returnValues.id}>${amount + " ETH"}</td>
                <td id=${event.returnValues.id}>${date1.toUTCString()}</td>
            </tr>`
        })
  
  }

  async function showTxInformation(e) {

    var id = e.target.id;
    console.log(id)
    var event = e.target.closest("table").className
    var eventName
    var tableName;
   
    var div = document.getElementById("etherscan-link")
    var etherscanLink = document.createElement("a")
    etherscanLink.setAttribute('target', "_blank")
    etherscanLink.innerHTML = "View Transaction on Etherscan"
    
    if (event == "deposit-detail-table") {
      eventName = "fundsDeposited"
      tableName = "Deposit table: "
    }
    if (event == "pending-transfer-detail-table") {
      eventName = "TransferRequestCreated"
      tableName = "Transfer table: "
    }
    else if(event == "withdrawal-detail-table") {
      eventName = "fundsWithdrawed"
      tableName = "Withdrawal table: "
    }
    else if (event == "transfer-detail-table") {
      eventName = "transferRequestApproved"
      tableName = "Transfer table: "
    
    }
    else if(event =="cancelled-transfer-detail-table") {
      eventName = "transferRequestCancelled"
      tableName = "Cancelled-Trnasfer table: "
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
    
      etherscanLink.setAttribute('href', "https://rinkeby.etherscan.io//tx/"+`${result[counter].transactionHash}`)
      div.appendChild(etherscanLink)
      var tx = web3.eth.getTransaction(result[counter].transactionHash).then(function(gas) {
          console.log(gas)
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
  
 

const addDepositToTable = document.querySelectorAll("tbody")[1];
const addWithdrawalToTable = document.querySelectorAll("tbody")[2];

const depositInfo = document.querySelectorAll("table")[1];
depositInfo.addEventListener("click", showTxInformation);

const withdrawalInfo = document.querySelectorAll("table")[2];
withdrawalInfo.addEventListener("click", showTxInformation);

var depositToWallet = document.getElementById("deposit");
depositToWallet.onclick = depositFunds;

var withdrawFromWallet = document.getElementById("withdraw");
withdrawFromWallet.onclick = withdrawFunds;

const showDepositInfo = document.querySelectorAll("tbody")[6];



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
  loadWeb3();

 
  
  
loadFactory();
loadBlockchainData()
// console.log("the factory adress is " + factoryAddress)