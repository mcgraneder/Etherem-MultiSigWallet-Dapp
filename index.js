import data from './build/contracts/MultiSigWallet.json' assert { type: "json" };
//0x9Dad734fEC00e2b1aE42DFA2eaf26a40eE31aFB1
var acc = "";
var account = "";
var contractInstance = "";
//fix contract to make events time the same name
//fix line 598 have result of id be the index not tx id
//connect browser to blockchain through metamask
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


  async function loadBlockchainData() {

    const web3 = window.web3
    var accounts = await web3.eth.getAccounts()
    account = accounts[0].slice(0, 6);
    acc = accounts[0];    
    document.getElementById("display-address").innerHTML = "Account: " + acc.slice(0, 6) + "..";
    document.getElementById("display-balance").innerHTML = "balance: 20 ETH";

    const networkId = await web3.eth.net.getId()
    const networkData = data.networks[networkId]
    if(networkData) {
      contractInstance = new web3.eth.Contract(data.abi, networkData.address, {from: acc})
      console.log("the smart contract is" + networkData.address);
      console.log(contractInstance)
      
    } else {
      window.alert('IPFSViewer contract not deployed to detected network.')
    }
  displayBalance();
  document.getElementById("display-wallet-id").innerHTML = "Wallet ID: 1";

  const owners = contractInstance.methods.getUsers().call().then(function(result) {
    for (let i = 0; i < result.length; i++) {
          addUserToTable1.innerHTML += `
          <tr "class="tablerow">
              <td id ="${result[i]}">${result[i]}</td>
              <td>${"Evan McGrane"}</td>
              <td><span id="hh">Remove</span></td>
          </tr>`  
    }
  })

  loadAdminTables("fundsDeposited")
  loadAdminTables("fundsWithdrawed")
  loadAccountsTables("transferRequestApproved")
  loadAccountsTables("transferRequestCancelled")
  
  const pending = contractInstance.methods.getTransferRequests().call().then(function(result) {
    for (let i = 0; i < result.length; i++) {
      var transferDate = result[i].timeStamp;
      var transferDate1 = new Date(transferDate * 1000);
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

  console.log(currentSelectedToken)
  
}

var currentSelectedToken = "ETH"
const ERC20TokenMenu = document.getElementById("ERC20-token-menu")
ETH.onclick = function() {
  ERC20TokenMenu.innerHTML = "ETH"
  currentSelectedToken = "ETH"
  displayBalance()
}
LINK.onclick = function() {
  ERC20TokenMenu.innerHTML = "LINK"
  currentSelectedToken = "LINK"
  displayBalance()

}
UNI.onclick = function() {
  ERC20TokenMenu.innerHTML = "UNI"
  currentSelectedToken = "UNI"
  displayBalance()

}
BNB.onclick = function() {
  ERC20TokenMenu.innerHTML = "BNB"
  currentSelectedToken = "BNB"
  displayBalance()

}
VET.onclick = function() {
  ERC20TokenMenu.innerHTML = "VET"
  currentSelectedToken = "VET"
  displayBalance()

}

function displayBalance() {
  const balance = contractInstance.methods.getAccountBalance(currentSelectedToken).call().then(function(balance) {
    balance = balance / 10 ** 18;
    balance = balance.toFixed(4)
    document.getElementById("display-balance").innerHTML = "balance: " + balance + currentSelectedToken;
  })
}

function loadAdminTables(tableName) {

  var table;
  if(tableName == "fundsDeposited") table = addDepositToTable;
  else if(tableName == "fundsWithdrawed") table = addWithdrawalToTable
  
  var results = contractInstance.getPastEvents(
    tableName,
    {fromBlock: 0}
  ).then(function(result) {
    for (let i = 0; i < result.length; i++) {
      var amount = result[i].returnValues.amount;
      amount = amount / 10 ** 18;
      var date = result[i].returnValues.timeStamp;//change contract to time in both withdraw and deoposit event
      var date1 = new Date(date * 1000);
      table.innerHTML += `
          <tr "class="tablerow">
              <td id=${result[i].returnValues.id}>${result[i].returnValues.ticker}</td>
              <td id=${result[i].returnValues.id}>${result[i].returnValues.id}</td>
              <td id=${result[i].returnValues.id}>${result[i].returnValues.from}</td>
              <td id=${result[i].returnValues.id}>${returnedDepositAmount + " ETH"}</td>
              <td id=${result[i].returnValues.id}>${date1.toUTCString()}</td>
          </tr>`
    }
  })
}

function loadAccountsTables(tableName) {

  var table;
  if(tableName == "transferRequestApproved") table = addTranferToTable;
  else if(tableName == "transferRequestCancelled") table = addCancelledTranferToTable

  var results = contractInstance.getPastEvents(
    tableName,
    {fromBlock: 0}
  ).then(function(result) {
    console.log(result)
    for (let i = 0; i < result.length; i++) {
      var amount = result[i].returnValues.amount;
      amount = amount / 10 ** 18;
      var date = result[i].returnValues.timeStamp;
      var date1 = new Date(date * 1000);
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
function addUser(){
    console.log(currentSelectedToken)
    var addUserNullAddressField = document.getElementById("add-user-address-field");
    var addUserNullNameField = document.getElementById("add-user-name-field");

    if (addUserNullAddressField.value == "" || addUserNullNameField == "") {
      document.getElementById("popup-1").classList.toggle("active");
      return;
    }

    contractInstance.methods.addUsers(addUserNullAddressField.value).send({from: acc}).on("transactionHash", function(hash) {
          loadLoader();  
    })
      //get receipt when ransaction is first mined
      .on("receipt", function(receipt) {
          
          hideLoader();
          var popupMessage = document.getElementById("msg").innerHTML = "Wallet owner has been added";
          displayAddOwnerPopup(popupMessage);
          addUserToTable1.innerHTML += `
          <tr class="tablerow">
              <td>${addUserNullAddressField.value}</td>
              <td>${"Evan McGrane"}</td>
              <td><span class="testb">Remove</span></td>
          </tr>`

      }).on("error", function(error) {
          console.log("user denied transaction");
          hideLoader();
      })
}

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
  
  const removeUser = contractInstance.methods.removeUser(nullAddressField.value).send({from: acc}).on("transactionHash", function(hash) {
        loadLoader();  
    })
    //get receipt when ransaction is first mined
    .on("receipt", function(receipt) {
       
        hideLoader();
        var popupMessage = document.getElementById("msg").innerHTML = "Wallet owner has been removed";
        displayAddOwnerPopup(popupMessage);
        addUserToTable1.deleteRow(counter); 
    }).on("error", function(error) {
        hideLoader();
    })
}


function depositFunds(token) {
  console.log(token)
  var nullDepositField = document.getElementById("deposit-field");
  
  if (nullDepositField.value == "") {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }
  
  if(currentSelectedToken == "ETH") {
    console.log("made ti")
    var dep = contractInstance.methods.deposit().send({value: web3.utils.toWei(String(nullDepositField.value), "ether"), from: acc}).on("transactionHash", function(hash) {   
      loadLoader();
      
    })
    //get receipt when ransaction is first mined
    .on("receipt", function(receipt) {
        
        hideLoader();
        var popupMessage = document.getElementById("msg").innerHTML = "Deposit successful! Balance has been updated";
        displayAddOwnerPopup(popupMessage);
  
    }).on("error", function(error) {
        hideLoader();
        
    }).then(function(result) {
        displayBalance()
    })
  }
  else {
    var dep = contractInstance.methods.depositERC20Token(web3.utils.toWei(String(nullDepositField.value), "ether"), currentSelectedToken).send({from: acc}).on("transactionHash", function(hash) {   
      loadLoader();
      
    })
    //get receipt when ransaction is first mined
    .on("receipt", function(receipt) {
        
        hideLoader();
        var popupMessage = document.getElementById("msg").innerHTML = "Deposit successful! Balance has been updated";
        displayAddOwnerPopup(popupMessage);
  
    }).on("error", function(error) {
        hideLoader();
        
    }).then(function(result) {
        displayBalance()
    })
  }
  
  updateAdminTables("fundsDeposited")
}

function withdrawFunds() {
  
  var nullWithdrawalField = document.getElementById("withdraw-field");
  
  if (nullWithdrawalField.value == "") {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }

  if(currentSelectedToken == "ETH") {
    var dep = contractInstance.methods.withdraw().send(web3.utils.toWei(String(nullWithdrawalField.value), "ether"), {from: acc}).on("transactionHash", function(hash) {   
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
    var dep = contractInstance.methods.withdrawERC20Token(web3.utils.toWei(String(nullDepositField.value), "ether"), currentSelectedToken).send({from: acc}).on("transactionHash", function(hash) {   
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

function updateAdminTables(eventName) {

  var table;
  if(eventName == "fundsDeposited") table = addDepositToTable
  else if(eventName == "fundsWithdrawed") table = addWithdrawalToTable

  contractInstance.once(eventName, 
        {
        filter: { player: acc },
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
              <td id=${event.returnValues.id}>${returnedDepositAmount + " ETH"}</td>
              <td id=${event.returnValues.id}>${date1.toUTCString()}</td>
          </tr>`
      })
}

function createTransferRequest() {

  var receiverAddress = document.getElementById("create-transfer-reciever-address-field");
  var transferAmount = document.getElementById("create-transfer-amount-field");

  if (receiverAddress.value == "" || transferAmount.value == "" ) {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }
  
  const createTransferRequest = contractInstance.methods.createTransfer(currentSelectedToken, web3.utils.toWei(String(transferAmount.value), "ether"), receiverAddress.value).send({from: acc}).on("transactionHash", function(hash) {
    loadLoader();
  })
  //get receipt when ransaction is first mined
  .on("receipt", function(receipt) {
     
      hideLoader();
      var popupMessage = document.getElementById("msg").innerHTML = "Transfer Request has successfully been created";
      const pendingTranfer = contractInstance.methods.getTransferRequests().call().then(function(result) {
        var Date = result[result.length - 1].timeStamp;
        var Date1 = new Date(Date * 1000);
        addPendingTranferToTable.innerHTML += `
        <tr class="tablerow">
              <td>${result[result.length - 1].ticker}</td>
              <td>${result[result.length - 1].id}</td>
              <td>${result[result.length - 1].receiver.slice(0, 15) + "..."}</td>
              <td>${result[result.length - 1].sender.slice(0, 15) + "..."}</td>
              <td>${result[result.length - 1].amount / 10**18 + " ETH"}</td>
              <td>${Date1.toUTCString()}</td>
              <td>${result[result.length - 1].approvals}</td>
          </tr>`
      })
      displayAddOwnerPopup(popupMessage);
      displayBalance()
    
  }).on("error", function(error) {
      hideLoader();
  })

}


async function cancelTransferRequest(id) {

  var counter = 1;
  var transferId = document.getElementById("cancel-transfer-id-field");
  if (transferId.value == "") {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }
  id = transferId.value
  
  const cancelTransferRequest = await contractInstance.methods.cancelTransfer(currentSelectedToken, id).send({from: acc}).on("transactionHash", function(hash) {
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
         
          if (transferss[i].id == transferId.value) {
            hasBeenFound = true;
            break;
          }
          counter++;
        }
        console.log(counter)
        if (hasBeenFound == true) {
          return;
        }
        else {
          var results = contractInstance.getPastEvents(
            "transferRequestCancelled",
            {fromBlock: 0}
          ).then(function(result) {
            var amount = result[result.length - 1].returnValues.amount;
          aAmount = amount / 10 ** 18;
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
      })
      
  }).on("error", function(error) {
      hideLoader();  
  })

}

  const t = document.querySelectorAll("table")[3];
  t.addEventListener("click", removeTransferRequestOnCancellation);

function removeTransferRequestOnCancellation(e) {

  togglePopup2()
  const bt = e.target;
  const btn = e.target.id;
  const cancelTransferRequest = contractInstance.methods.cancelTransfer(currentSelectedToken, btn).send({from: acc}).on("transactionHash", function(hash) {
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
        }
        if (hasBeenFound == true) {
          return;
        }
        else {
          var results = contractInstance.getPastEvents(
            "transferRequestCancelled",
            {fromBlock: 0}
          ).then(function(result) {
            var amountmount = result[result.length - 1].returnValues.amount;
            amountmount = amountmount / 10 ** 18;
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

        bt.closest("tr").remove();
      })    
  }).on("error", function(error) {
      console.log("user denied transaction"); 
      hideLoader();
  })
  }

  const t1 = document.querySelectorAll("table")[0];
  t1.addEventListener("click", removeWallletOwner);

async function removeWallletOwner(e) {
  
  const bt = e.target;
  const btn = e.target.id;
  var counter = 1;
  await contractInstance.methods.getUsers().call().then(function(transferss) {
    for (let i = 0; i < transferss.length; i++) {
      if (transferss[i] == btn) {
         break;
      }
      counter++;
    }
  })

  const removeUser = contractInstance.methods.removeUser(btn).send({from: acc}).on("transactionHash", function(hash) {
        loadLoader();  
    })
    //get receipt when ransaction is first mined
    .on("receipt", function(receipt) {
       
        hideLoader();
        var popupMessage = document.getElementById("msg").innerHTML = "Wallet owner has been removed";
        displayAddOwnerPopup(popupMessage);
        addUserToTable1.deleteRow(counter);

    }).on("error", function(error) {
        hideLoader();
    })
  }

const depositInfo = document.querySelectorAll("table")[1];
depositInfo.addEventListener("click", showTxInformation);

const withdrawalInfo = document.querySelectorAll("table")[2];
withdrawalInfo.addEventListener("click", showTxInformation);

const transferInfo = document.querySelectorAll("table")[4];
transferInfo.addEventListener("click", showTxInformation);

const CancelledTransferInfo = document.querySelectorAll("table")[5];
CancelledTransferInfo.addEventListener("click", showTxInformation);

async function showTxInformation(e) {
  //do something with counter to get id
  var div = document.getElementById("etherscan-link")
  var etherscanLink = document.createElement("a")
  etherscanLink.setAttribute('target', "_blank")
  etherscanLink.innerHTML = "View Transaction on Etherscan"

  var id = e.target.id;
  var event = e.target.closest("table").className
  var eventName
  var tableName;

  if (event == "deposit-detail-table") {
    eventName = "fundsDeposited"
    tableName = "Deposit ID: "
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

  document.getElementById("tx-details").innerHTML = tableName + id;
  togglePopup2()
 
  var results = await contractInstance.getPastEvents(
    eventName,
    {fromBlock: 0}
  ).then(function(result) {
    console.log(result)
    etherscanLink.setAttribute('href', "https://rinkeby.etherscan.io//tx/"+`${result[id].transactionHash}`)
    div.appendChild(etherscanLink)
    var tx = web3.eth.getTransaction(result[id].transactionHash).then(function(gas) {
        var blockHash = result[id].blockHash;
        var txAddress = result[id].address;
        var txHash = result[id].transactionHash
        var txSig = result[id].signature;
        showDepositInfo.innerHTML += `
              <tr>
                <td>Block Hash</td>
                <td>${blockHash.slice(0, 21) + "..."}</td>
              </tr>
              <tr>
                <td>Block Number</td>
                <td>${result[id].blockNumber}</td>
              </tr>
              <tr>
                <td>TX ID</td>
                <td>${result[id].id}</td>
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

async function approveTransferRequest(transferId) {
  
  var approvalCounter = 1;
  var counter = 1;

  var transferID = document.getElementById("approve-transfer-field");
  if(transferID.value =="") {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }
  
  const approveTransferRequest = await contractInstance.methods.Transferapprove(currentSelectedToken, transferID.value).send({from: acc}).on("transactionHash", function(hash) {  
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
         
          if (transferss[i].id == transferID.value) {
            hasBeenFound = true;
            break;
          }
          approvalCounter++;
        }
        if (hasBeenFound) {
          addPendingTranferToTable.rows[approvalCounter].cells[5].innerHTML = transferss[approvalCounter - 1].approvals;
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
  console.log("clicked")
  document.getElementById("popup-2").classList.toggle("active");
  var x = document.getElementById("nav");
  if (x.style.display === "none") {
      x.style.display = "flex";
  } else {
      x.style.display = "none";
  }
  var tableHeaderC = 1;
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
  
}
const toggleAdmin = document.getElementById("toggle-admin-section");
toggleAdmin.onclick = toggleAdminSection;

function toggleAccountsSection() {
  var x = document.getElementById("accounts-section").style.display = "block";
  var x = document.getElementById("transfer-section").style.display = "none";
  var x = document.getElementById("admin-section").style.display = "none";
  
}
const toggleAccounts = document.getElementById("toggle-accounts-section");
toggleAccounts.onclick = toggleAccountsSection;

function toggleTransferSection() {
  var x = document.getElementById("accounts-section").style.display = "none";
  var x = document.getElementById("transfer-section").style.display = "block";
  var x = document.getElementById("admin-section").style.display = "none";
  
}

function loadLoader() {
  $(".loading").show();
}

function hideLoader() {
  $(".loading").fadeOut(1200);
}

const toggleTransfer = document.getElementById("toggle-transfer-section");
toggleTransfer.onclick = toggleTransferSection;

const transferApproveButton = document.getElementById("approveTransfer");
transferApproveButton.onclick = approveTransferRequest;
const addDepositToTable = document.querySelectorAll("tbody")[1];
const addWithdrawalToTable = document.querySelectorAll("tbody")[2];
const addPendingTranferToTable = document.querySelectorAll("tbody")[3];

document.getElementById("accounts-section").style.display = "none";
document.getElementById("transfer-section").style.display = "none";
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

loadWeb3();
loadBlockchainData();

