import data from './build/contracts/MultiSigWallet.json' assert { type: "json" };

//0x9Dad734fEC00e2b1aE42DFA2eaf26a40eE31aFB1
var account = "";
var account = "";
var contractInstance = "";
var quickSelect
var currentSelectedToken
// var currentSelectedToken = "ETH"
//fix contract to make events time the same name
//fix line 598 have result of id be the index not tx id
//connect browser to blockchain through metamask
////////////////////////////////////////////////////////////////////////////////
//                                                                            //   
//                FUNCTIONS FOR LOAD DAPP DATA ON PAGE LOAD                                                           //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////
//The init() function is called on page load and connects to metamask in order to connect our broweser to
//the ethereum blockchain. If no current provider is found an error message is alerted letting the user
//know than a non ethereum browser has been detected
var ID;
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
//the loadBlockchainData() function loads al Dapp information on the page load. We initialisise
//a connection to our smart contract and get the users ethereum account so that we can call the
//functions defined in our smart contract. Other information like user data such as
//transaction histroy is also extracted from the BC and loaded using this function
async function loadBlockchainData() {

  const web3 = window.web3

  //gets all user accounts and displays the current user on the UI (navbar)
  var accounts = await web3.eth.getAccounts()
  account = accounts[0];    
  document.getElementById("display-address").innerHTML = "Account: " + account.slice(0, 6) + "..";
 

  //gets the current network ID (e.g ropsten, kovan, mainnet) and uses the contract abi imported at the
  //top of this file to make a new contract instamce using web3.js new contract function. 
  const networkId = await web3.eth.net.getId()
  const networkData = data.networks[networkId]
  if(networkData) {
    contractInstance = new web3.eth.Contract(data.abi, networkData.address, {from: account})
    console.log("the smart contract is " + networkData.address);
    console.log(contractInstance)
      
  } else {
    window.alert('contract not deployed to detected network.')
  }

  document.getElementById("display-wallet-id").innerHTML = "Wallet ID: 1";
  displayBalance();
  loadAccountsTables("transferRequestApproved")
  loadAccountsTables("transferRequestCancelled")
  loadAdminTables("fundsDeposited")
  loadAdminTables("fundsWithdrawed")
  loadWalletOwners()
  loadPendingTransfers()
  loadChart()
  
}

loadWeb3();
loadBlockchainData();


async function loadWalletOwners() {
  const owners = contractInstance.methods.getUsers().call().then(function(result) {
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
//loads the table data from the accounts section on page load. This function is called from the loadBlockchainData()
//function
async function loadAccountsTables(tableName) {

  var table;
  if(tableName == "transferRequestApproved") table = addTranferToTable;
  else if(tableName == "transferRequestCancelled") table = addCancelledTranferToTable

  var results = await contractInstance.getPastEvents(tableName,{fromBlock: 0}).then(function(result) {
    console.log(result)
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

////////////////////////////////////////////////////////////////////////////////
//                                                                            //   
//           FUNCTIONS FOR THE ADMIN SECTION ADD/REMOOVE USER                                                           //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

//function that lets the main wallet owner (contract deployer) add a new wallet signatory
function addUser(){
    console.log(currentSelectedToken)
    var addUserNullAddressField = document.getElementById("add-user-address-field");
    var addUserNullNameField = document.getElementById("add-user-name-field");

    if (addUserNullAddressField.value == "" || addUserNullNameField == "") {
      document.getElementById("popup-1").classList.toggle("active");
      return;
    }

    contractInstance.methods.addUsers(addUserNullAddressField.value).send({from: account}).on("transactionHash", function(hash) {
          loadLoader();  
    }).on("receipt", function(receipt) {
          
          hideLoader();
          var popupMessage = document.getElementById("msg").innerHTML = "Wallet owner has been added";
          displayAddOwnerPopup(popupMessage);
          
          addUserToTable1.innerHTML += `
          <tr class="tablerow">
              <td>${addUserNullAddressField.value}</td>
              <td>${"Evan McGrane"}</td>
              <td ><span id=${addUserNullAddressField.value} class="testb">Remove</span></td>
          </tr>`

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

  var counter = 0;
  await contractInstance.methods.getUsers().call().then(function(transferss) {
    for (let i = 0; i < transferss.length; i++) {
      if (transferss[i] == nullAddressField.value) {
         break;
      }
      counter++;
    }
  })
  
  const removeUser = contractInstance.methods.removeUser(nullAddressField.value).send({from: account}).on("transactionHash", function(hash) {
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

  const removeUser = contractInstance.methods.removeUser(ownerId).send({from: account}).on("transactionHash", function(hash) {
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

////////////////////////////////////////////////////////////////////////////////
//                                                                            //   
//           FUNCTIONS FOR THE Accounts SECTION DEPOSIT/WITHDRAW                                                           //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

//lets any of the wallet owners deposit both ETH nad ERC20 tokens into the wallet
function depositFunds(token) {
  
  var nullDepositField = document.getElementById("deposit-field");
  if (nullDepositField.value == "") {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }
  
  if(currentSelectedToken == "ETH") {
    var dep = contractInstance.methods.deposit().send({value: web3.utils.toWei(String(nullDepositField.value), "ether"), from: account}).on("transactionHash", function(hash) {   
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
    var dep = contractInstance.methods.depositERC20Token(web3.utils.toWei(String(nullDepositField.value), "ether"), currentSelectedToken).send({from: account}).on("transactionHash", function(hash) {   
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
  
  updateAdminTables("fundsDeposited")
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
      
    })
    //get receipt when ransaction is first mined
    .on("receipt", function(receipt) {
        
        hideLoader();
        var popupMessage = document.getElementById("msg").innerHTML = "Withdrawal successful! Balance has been updated";
        displayAddOwnerPopup(popupMessage);
  
    }).on("error", function(error) {
        hideLoader();
        
    }).then(function(result) {
        displayBalance()
    })
  }
  else {
    var dep = contractInstance.methods.withdrawERC20Token(web3.utils.toWei(String(nullWithdrawalField.value), "ether"), currentSelectedToken).send({from: account}).on("transactionHash", function(hash) {   
      loadLoader();
      
    })
    //get receipt when ransaction is first mined
    .on("receipt", function(receipt) {
        
        hideLoader();
        var popupMessage = document.getElementById("msg").innerHTML = "Withdrawal successful! Balance has been updated";
        displayAddOwnerPopup(popupMessage);
  
    }).on("error", function(error) {
        hideLoader();
        
    }).then(function(result) {
        displayBalance()
    })
  }
  

  updateAdminTables("fundsWithdrawed")
}

//function that updates the deposit and wthdraw histroy tables in real time whenever the deposit or withdraw functions are
//called. These functions are called in the deposit and withdraw functions
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

var x = document.getElementById("quick-cancel")
var yy = document.getElementById("quick-cancel")
yy.onclick = cancelTransferRequest

var y = document.getElementById("quick-approve")
y.onclick = approveTransferRequest
///////////////////////////////////#/////////////////////////////////////////////
//                                                                            //   
//   FUNCTIONS FOR THE TRANSFER SECTION CREATE/CANCEL/APPROVE TRANSFERS                                                           //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

function createTransferRequest() {
  console.log(currentSelectedToken)
  var receiverAddress = document.getElementById("create-transfer-reciever-address-field");
  var transferAmount = document.getElementById("create-transfer-amount-field");

  if (receiverAddress.value == "" || transferAmount.value == "" ) {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }
  
  const createTransferRequest = contractInstance.methods.createTransfer(currentSelectedToken, web3.utils.toWei(String(transferAmount.value), "ether"), receiverAddress.value).send({from: account}).on("transactionHash", function(hash) {
    loadLoader();
  })
  //get receipt when ransaction is first mined
  .on("receipt", function(receipt) {
     
      hideLoader();
      var popupMessage = document.getElementById("msg").innerHTML = "Transfer Request has successfully been created";
      const pendingTranfer = contractInstance.methods.getTransferRequests().call().then(function(result) {
        var date = result[result.length - 1].timeStamp;
        var date1 = new Date(date * 1000);
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
    
  }).on("error", function(error) {
      hideLoader();
  })

}


async function cancelTransferRequest() {
  // console.log("THE ID IS: " + ID)
  // var counter = 1;
  var transferID = document.getElementById("cancel-transfer-id-field");
  // if (transferId.value == "") {
  //   document.getElementById("popup-1").classList.toggle("active");
  //   return;
  // }
  if(quickSelect != true) {
    console.log("yess")
    ID = transferID.value
  }
  console.log(quickSelect)
  var counter = 0;
  console.log("hey")
  console.log("The butto is" + ID)
  console.log("the btn us " + ID)
  // var x1 = btn.toNumber
  var btn = ID
  
  
  const cancelTransferRequest = await contractInstance.methods.cancelTransfer(currentSelectedToken, btn).send({from: account}).on("transactionHash", function(hash) {
    loadLoader();
  })
  //get receipt when ransaction is first mined
  .on("receipt", function(receipt) {
      
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
        console.log("The counter us " + counter)
        if (hasBeenFound == true) {
          return;
        }
        else {
          var results = contractInstance.getPastEvents(
            "transferRequestCancelled",
            {fromBlock: 0}
          ).then(function(result) {
            var amount = result[result.length - 1].returnValues.amount;
            amount = amount / 10 ** 18;
            var date = result[result.length - 1].returnValues.timeStamp;
            var date1 = new Date(date * 1000);
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
        addPendingTranferToTable.deleteRow(counter)
        quickSelect = false;
      })
      
  }).on("error", function(error) {
      hideLoader();  
  })

}
1
function tableRowClicked(e) {
  ID = e.target.id;
  console.log(ID)
  console.log("The butto is")
  quickSelect = true 
  }


async function approveTransferRequest(e) {
  
  var transferID = document.getElementById("approve-transfer-field");
  if(quickSelect != true) {
    console.log("yess")
    ID = transferID.value
  }
  console.log(quickSelect)
  console.log("id is " + ID)
  console.log("the id is " + ID)
  var approvalCounter = 1;
  var counter = 1;
  const approveTransferRequest = await contractInstance.methods.Transferapprove(currentSelectedToken, ID).send({from: account}).on("transactionHash", function(hash) {  
    loadLoader();

  }).on("confirmation", function(confirmationNr) {
      console.log(confirmationNr);

  }).on("receipt", function(receipt) {
    
      hideLoader();
      var popupMessage = document.getElementById("msg").innerHTML = "Transfer Request has successfully been approved";
      displayAddOwnerPopup(popupMessage);
      contractInstance.methods.getTransferRequests().call().then(function(transferss) {

        var hasBeenFound = false;
        for (let i = 0; i < transferss.length; i++) {
         
          if (transferss[i].id == ID) {
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
              console.log("the result isss")
              console.log(result[i])
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
  }).on("error", function(error) {
      console.log("user denied transaction");
      hideLoader();
  })
}

async function showTxInformation(e) {

  var id = e.target.id;
  var event = e.target.closest("table").className
  console.log(event)
  var eventName
  var tableName;
  console.log("id is " + id)
  //do something with counter to get id
  var div = document.getElementById("etherscan-link")
  var etherscanLink = document.createElement("a")
  etherscanLink.setAttribute('target', "_blank")
  etherscanLink.innerHTML = "View Transaction on Etherscan"
  
  if (event == "deposit-detail-table") {
    eventName = "fundsDeposited"
    tableName = "Deposit ID: "
  }
  if (event == "pending-transfer-detail-table") {
    eventName = "TransferRequestCreated"
    tableName = "Transfer ID: "
  }
  else if(event == "withdrawal-detail-table") {
    eventName = "fundsWithdrawed"
    tableName = "Withdrawal ID: "
  }
  else if (event == "transfer-detail-table") {
    eventName = "transferRequestApproved"
    tableName = "Transfer ID: "
    console.log("success")
  }
  else if(event =="cancelled-transfer-detail-table") {
    eventName = "transferRequestCancelled"
    tableName = "Cancelled-Trnasfer ID: "
  }
  console.log(eventName)

  document.getElementById("tx-details").innerHTML = tableName + id;
  togglePopup2()
  var counter = 0;
  var hasBeenFound = false;
  var results = await contractInstance.getPastEvents(
    eventName,
    {fromBlock: 0}
  ).then(function(result) {
    console.log(result)

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
                <td>TX ID</td>
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

////////////////////////////////////////////////////////////////////////////////
//                                                                            //   
//                           HELPER FUNCTIONS                                                           //
//                                                                            //
////////////////////////////////////////////////////////////////////////////////

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

function toggleStatisticsSection() {
  
  var x = document.getElementById("accounts-section").style.display = "none";
  var x = document.getElementById("transfer-section").style.display = "none";
  var x = document.getElementById("admin-section").style.display = "none";
  var x = document.getElementById("stats-section").style.display = "block";
  pageLoadObject = { 'section': "stats-section"};
  localStorage.setItem('pageLoadObject', JSON.stringify(pageLoadObject));
  retrievedSectionObject = localStorage.getItem('pageLoadObject');
  currentSelectedSection = JSON.parse(retrievedSectionObject).section
  console.log(currentSelectedSection)  
  loadChart()
          
        
}


function loadChart() {
  var ctx = document.getElementById('myChart').getContext('2d');
                    var myChart = new Chart(ctx, {
                        type: 'pie',
                        responsive:true,
                        data: {
                            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
                            datasets: [{
                                label: '# of Votes',
                                data: [12, 19, 3, 5, 2],
                                backgroundColor: [
                                    'rgba(255, 99, 132, 0.2)',
                                    'rgba(54, 162, 235, 0.2)',
                                    'rgba(255, 206, 86, 0.2)',
                                    'rgba(75, 192, 192, 0.2)',
                                    'rgba(153, 102, 255, 0.2)',
    
                                ],
                                borderColor: [
                                    'rgba(255, 99, 132, 1)',
                                    'rgba(54, 162, 235, 1)',
                                    'rgba(255, 206, 86, 1)',
                                    'rgba(75, 192, 192, 1)',
                                    'rgba(153, 102, 255, 1)',
                                    
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            scales: {
                                y: {
                                    beginAtZero: true
                                },
                                responsive: true,
                                maintainAspectRatio: false
                            }
                        }
                    });
                    setTimeout(function(){
                
                      var ctx = document.getElementById('myChart2').getContext('2d');
                          var myChart2 = new Chart(ctx, {
                              type: 'line',
                              responsive:true,
                              data: {
                                  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
                                  datasets: [{
                                      label: '# of Votes',
                                      data: [12, 19, 3, 5, 2,],
                                      backgroundColor: [
                                          'rgba(54, 162, 235, 0.2)',
                                          'rgba(255, 206, 86, 0.2)',
                                          'rgba(75, 192, 192, 0.2)',
                                          'rgba(153, 102, 255, 0.2)',
                                          
                                      ],
                                      borderColor: [
                                          'rgba(255, 99, 132, 1)',
                                          'rgba(54, 162, 235, 1)',
                                          'rgba(255, 206, 86, 1)',
                                          'rgba(75, 192, 192, 1)',
                                          'rgba(153, 102, 255, 1)',
                                         
                                      ],
                                      borderWidth: 1
                                  }]
                              },
                              options: {
                                  scales: {
                                      y: {
                                          beginAtZero: true
                                      },
                                      responsive: true,
                                      maintainAspectRatio: false
                                  }
                              }
                          })
                      }, 600);
}
const toggleStatistics = document.getElementById("toggle-stats-section");
toggleStatistics.onclick = toggleStatisticsSection;

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

console.group(currentSelectedToken)
const t = document.querySelectorAll("table")[3];
t.addEventListener("click", tableRowClicked);


const t1 = document.querySelectorAll("table")[0];
t1.addEventListener("click", removeWallletOwner);

const toggleTransfer = document.getElementById("toggle-transfer-section");
toggleTransfer.onclick = toggleTransferSection;

const transferApproveButton = document.getElementById("approveTransfer");
transferApproveButton.onclick = approveTransferRequest;
const addDepositToTable = document.querySelectorAll("tbody")[1];
const addWithdrawalToTable = document.querySelectorAll("tbody")[2];
const addPendingTranferToTable = document.querySelectorAll("tbody")[3];


document.getElementById("accounts-section").style.display = "none";
document.getElementById("transfer-section").style.display = "none";
document.getElementById("admin-section").style.display = "none";
document.getElementById("stats-section").style.display = "none";
document.getElementById(currentSelectedSection).style.display = "block";



const addTranferToTable = document.querySelectorAll("tbody")[4];
const addCancelledTranferToTable = document.querySelectorAll("tbody")[5];
const showDepositInfo = document.querySelectorAll("tbody")[6];
var removeUserButton = document.getElementById("remove-user-from-wallet")
removeUserButton.onclick = removeUser;
var hideAddOwner = document.getElementById("close-btn")
hideAddOwner.onclick = hideAddOwnerPopup();

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

const addUserToTable1 = document.getElementById("owners-table")
const addUserToTable = document.getElementById("owners-table1")

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



