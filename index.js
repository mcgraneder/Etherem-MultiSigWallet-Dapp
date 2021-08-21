
import data from './build/contracts/MultiSigWallet.json' assert { type: "json" };


console.log(data);
var acc = "";
var account = "";
var contractInstance = "";
var walletOwners = [];
var pendingTranfers;
var a = 20;


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
    
    a = 30;
    account = accounts[0].slice(0, 6);
    acc = accounts[0];
    console.log(acc)
    
    document.getElementById("display-address").innerHTML = "Account: " + acc.slice(0, 6) + "..";
    document.getElementById("display-balance").innerHTML = "balance: 20 ETH";

    const networkId = await web3.eth.net.getId()
    const networkData = data.networks[networkId]
    if(networkData) {
      contractInstance = new web3.eth.Contract(data.abi, networkData.address, {from: acc})
      console.log("the smart contract is" + networkData.address);
      
    } else {
      window.alert('IPFSViewer contract not deployed to detected network.')
    }
    // console.log(contractInstance);
    const balance = contractInstance.methods.getAccountBalance().call().then(function(balance) {
      balance = balance / 10 ** 18;
      balance = balance.toFixed(2)
      document.getElementById("display-balance").innerHTML = "balance: " + balance + " ETH";
      console.log(balance);
  })
  document.getElementById("display-wallet-id").innerHTML = "Wallet ID: 1";

  console.log(walletOwners);
  // getWalletOwners();
  console.log(walletOwners)
  const pendingTranfer = contractInstance.methods.getTransferRequests().call().then(function(result) {
      
    console.log(result[0].amount);

  })

  const owners = contractInstance.methods.getUsers().call().then(function(result) {
    
    for (let i = 0; i < result.length; i++) {
      // addUserToTable.innerHTML += `
      //     <tr class="tablerow">
      //         <td id="${result[i]}">${result[i]}</td>
      //         <td id="${result[i]}">${"Evan McGrane"}</td>
      //         <td id="${result[i]}"><span>Remove</span></td>
      //     </tr>`
          var x = addUserToTable1.insertRow(-1);
          x.insertCell(0).innerHTML=result[i]
          x.insertCell(1).innerHTML="Evan McGrane"
          x.insertCell(2).innerHTML=`<span id="hh">Remove</span>`
    }
  })

  var results = contractInstance.getPastEvents(
    "fundsDeposited",
    {fromBlock: 0}
  ).then(function(result) {
    console.log(result[0])
    for (let i = 0; i < result.length; i++) {
      var returnedDepositAmount = result[i].returnValues.amount;
      returnedDepositAmount = returnedDepositAmount / 10 ** 18;
      var date = result[i].returnValues.timeOfDeposit;
      var date1 = new Date(date * 1000);
      // console.log(date1.toUTCString())
      addDepositToTable.innerHTML += `
          <tr "class="tablerow">
              <td>${result[i].returnValues.id}</td>
              <td>${returnedDepositAmount + " ETH"}</td>
              <td>${date1.toUTCString()}</td>
          </tr>`
    }
  
  })
  

  var withdrawresults = contractInstance.getPastEvents(
    "fundsWithdrawed",
    {fromBlock: 0}
  ).then(function(result) {
    // console.log(result[0].returnValues.amount)
    console.log(result[0]);
    for (let i = 0; i < result.length; i++) {
      
      var returnedWithdrawedAmount = result[i].returnValues.amount;
      returnedWithdrawedAmount = returnedWithdrawedAmount / 10 ** 18;
      var withdrawDate = result[i].returnValues.timeOfWithdrawal;
      var withdrawDate1 = new Date(withdrawDate * 1000);
      // console.log(date1.toUTCString())
      addWithdrawalToTable.innerHTML += `
          <tr class="tablerow">
              <td>${result[i].returnValues.id}</td>
              <td>${returnedWithdrawedAmount + " ETH"}</td>
              <td>${withdrawDate1.toUTCString()}</td>
          </tr>`
    }
  
  })

  }

function addUser(){

    // loadBlockchainData();

    
    var addUserNullAddressField = document.getElementById("add-user-address-field");
    var addUserNullNameField = document.getElementById("add-user-name-field");

    
    
    
    if (addUserNullAddressField.value == "" || addUserNullNameField == "") {
      document.getElementById("popup-1").classList.toggle("active");
      return;
    }

    var walletInfor = {
      address: addUserNullAddressField.value,
      name: addUserNullNameField.value,
    };

    var address = document.getElementById("add-user-address-field").value;
    console.log(address);
    // console.log

    
    const addUser = contractInstance.methods.addUsers(address).send({from: acc}).on("transactionHash", function(hash) {
        
          console.log(hash);
          loadLoader();
          
      })
      //get confirmation message on confirmation
      .on("confirmation", function(confirmationNr) {
          console.log(confirmationNr);
          
          

      })
      //get receipt when ransaction is first mined
      .on("receipt", function(receipt) {
          console.log(receipt);
          alert("Transaction successful");
          updateWalletOwnersNameField(addUserNullNameField.value);
          console.log("your names are: " + walletOwners)
          hideLoader();
          var popupMessage = document.getElementById("msg").innerHTML = "Wallet owner has been addede";

          displayAddOwnerPopup(popupMessage);
          addUserToTable.innerHTML += `
          <tr class="tablerow">
              <td>${addUserNullAddressField.value}</td>
              <td>${"Evan McGrane"}</td>
              <td><span class="testb">Remove</span></td>
              
              
              
            
          </tr>`

          localStorage.setItem("walletInfor", JSON.stringify(walletInfor));
          const ll = localStorage.getItem("walletinfor");
          console.log(JSON.parse(ll));
          console.log("the local storage is" + walletInfor)

      }).on("error", function(error) {
          console.log("user denied transaction");
          hideLoader();
       
          // $(".loading").hide();
          
      })
}

function removeUser(){
  
  
  
  var nullAddressField = document.getElementById("remove-user-address-field");
  var nullNameField = document.getElementById("remove-user-name-field");

  
  if (nullAddressField.value == "" || nullNameField == "") {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }

  var addressForRemoval = document.getElementById("remove-user-address-field").value;
  console.log(addressForRemoval);
  console.log("DHDHDBDGDF")
  // console.log

  
  const removeUser = contractInstance.methods.removeUser(addressForRemoval).send({from: acc}).on("transactionHash", function(hash) {
        
        console.log(hash);
        loadLoader();
        
    })
    //get confirmation message on confirmation
    .on("confirmation", function(confirmationNr) {
        console.log(confirmationNr);
       

        

    })
    //get receipt when ransaction is first mined
    .on("receipt", function(receipt) {
        console.log(receipt);
        console.log("hello")
        alert("Transaction successful");
        hideLoader();
        var popupMessage = document.getElementById("msg").innerHTML = "Wallet owner has been removed";

        displayAddOwnerPopup(popupMessage);
        
        

    }).on("error", function(error) {
        console.log("user denied transaction");
        
        hideLoader();
        
        
        // $(".loading").hide();
        
    })
}

async function getWalletOwners() {

    const web3 = window.web3
    
    var accounts = await web3.eth.getAccounts()
    
    a = 30;
    account = accounts[0].slice(0, 6);
    acc = accounts[0];
    // console.log(account);
    document.getElementById("display-address").innerHTML = "Account: " + acc.slice(0, 6) + "..";
    document.getElementById("display-balance").innerHTML = "balance: 20 ETH";

    
    const networkId = await web3.eth.net.getId()
    const networkData = data.networks[networkId]
    if(networkData) {
      contractInstance = new web3.eth.Contract(data.abi, networkData.address,  {from: acc})
    //   contractInstance = contractInstance1;
      
      
    } else {
      window.alert('IPFSViewer contract not deployed to detected network.')
    }
  console.log("entered the getWalletOwners function")
  const owners = contractInstance.methods.getUsers().call().then(function(result) {
    
    for (let i = 0; i < result.length; i++) {
      // addUserToTable.innerHTML += `
      //     <tr class="tablerow">
      //         <td id="${result[i]}">${result[i]}</td>
      //         <td id="${result[i]}">${"Evan McGrane"}</td>
      //         <td id="${result[i]}"><span>Remove</span></td>
      //     </tr>`
          var x = addUserToTable1.insertRow(-1);
          x.insertCell(0).innerHTML=result[i]
          x.insertCell(1).innerHTML="Evan McGrane"
          x.insertCell(2).innerHTML=`<span id="hh">Remove</span>`
    }
  })
}

function depositFunds() {
 
  var nullDepositField = document.getElementById("deposit-field");
  
  if (nullDepositField.value == "") {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }


  var depositAmount = document.getElementById("deposit-field")

  var value = {
    value: web3.utils.toWei(String(depositAmount.value), "ether"),
    from: acc 
  };

  var dep = contractInstance.methods.deposit().send(value).on("transactionHash", function(hash) {
        
    console.log(hash);
    loadLoader();
    
  })
  //get confirmation message on confirmation
  .on("confirmation", function(confirmationNr) {
      console.log(confirmationNr);
    

      

  })
  //get receipt when ransaction is first mined
  .on("receipt", function(receipt) {
      console.log(receipt);
      alert("Transaction successful");
      hideLoader();
      var popupMessage = document.getElementById("msg").innerHTML = "Deposit successful! Balance has been updated";

      displayAddOwnerPopup(popupMessage);
      
      

  }).on("error", function(error) {
      console.log("user denied transaction");
      
      hideLoader();
      
      
      // $(".loading").hide();
      
  }).then(function(result) {
      const balance = contractInstance.methods.getAccountBalance().call().then(function(balance) {
      balance = balance / 10 ** 18;
      balance = balance.toFixed(2)
      document.getElementById("display-balance").innerHTML = "balance: " + balance + " ETH";
      console.log(balance);
      
    })
  })
  
  contractInstance.once('fundsDeposited', 
        {
        filter: { player: acc },
        fromBlock: 'latest'
        }, (error, event) => {
        if(error) throw("Error fetching events");
        console.log("oracle resolved");
        console.log(event.returnedValues);
        var date = event.returnValues.timeOfDeposit;
        var date1 = new Date(date * 1000);
        var returnedDepositAmount = event.returnValues.amount;
        returnedDepositAmount = returnedDepositAmount / 10 ** 18;
        addDepositToTable.innerHTML += `
          <tr class="tablerow">
              <td>${event.returnValues.id}</td>
              <td>${returnedDepositAmount + " ETH"}</td>
              <td>${date1.toUTCString()}</td>
          </tr>`
      })

  // const reciept = contractInstance.methods.emitEvent
 
}

function withdrawFunds() {
  

  var nullWithdrawalField = document.getElementById("withdraw-field");
  
  if (nullWithdrawalField.value == "") {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }

  var withdrawalAmount = document.getElementById("withdraw-field")
  console.log(web3.utils.toWei(String(withdrawalAmount.value), "ether"))
 
  var dep = contractInstance.methods.withdraw(web3.utils.toWei(String(withdrawalAmount.value), "ether")).send().on("transactionHash", function(hash) {
        
    console.log(hash);
    loadLoader();
    
  })
  //get confirmation message on confirmation
  .on("confirmation", function(confirmationNr) {
      console.log(confirmationNr);
    

      

  })
  //get receipt when ransaction is first mined
  .on("receipt", function(receipt) {
      console.log(receipt);
      alert("Transaction successful");
      hideLoader();
      var popupMessage = document.getElementById("msg").innerHTML = "Withdrawal successful! balance has been updated";

      displayAddOwnerPopup(popupMessage);
      
      

  }).on("error", function(error) {
      console.log("user denied transaction");
      
      hideLoader();
      
      
      // $(".loading").hide();
      
  }).then(function(result) {
      const balance = contractInstance.methods.getAccountBalance().call().then(function(balance) {
      balance = balance / 10 ** 18;
      balance = balance.toFixed(2)
      document.getElementById("display-balance").innerHTML = "balance: " + balance + " ETH";
      console.log(balance);

    })
  })

  contractInstance.once('fundsWithdrawed', 
        {
        filter: { player: acc },
        fromBlock: 'latest'
        }, (error, event) => {
        if(error) throw("Error fetching events");
        console.log("oracle resolved");
        console.log(event.returnedValues);
        var withdrawDate = event.returnValues.timeOfWithdrawal;
        var withdrawDate1 = new Date(withdrawDate * 1000);
        var returnedWithdrawedAmount = event.returnValues.amount;
        returnedWithdrawedAmount = returnedWithdrawedAmount / 10 ** 18;
        addWithdrawalToTable.innerHTML += `
          <tr class="tablerow">
              <td>${event.returnValues.id}</td>
              <td>${returnedWithdrawedAmount + " ETH"}</td>
              <td>${withdrawDate1.toUTCString()}</td>
          </tr>`
      })
}

function createTransferRequest() {

  loadBlockchainData();
  var receiverAddress = document.getElementById("create-transfer-reciever-address-field");
  var transferAmount = document.getElementById("create-transfer-amount-field");

  
  if (receiverAddress.value == "" || transferAmount.value == "" ) {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }
  

  const createTransferRequest = contractInstance.methods.createTransfer(web3.utils.toWei(String(transferAmount.value), "ether"), receiverAddress.value).send({from: acc}).on("transactionHash", function(hash) {
        
    console.log(hash);
    loadLoader();
    
  })
  //get confirmation message on confirmation
  .on("confirmation", function(confirmationNr) {
      console.log(confirmationNr);
    

      

  })
  //get receipt when ransaction is first mined
  .on("receipt", function(receipt) {
      console.log(receipt);
      alert("Transaction successful");
      hideLoader();
      var popupMessage = document.getElementById("msg").innerHTML = "Transfer Request has successfully been created";
      const pendingTranfer = contractInstance.methods.getTransferRequests().call().then(function(result) {
      
        console.log(result[result.length - 1].amount);
        var transferDate = result[result.length - 1].timeOfCreation;
        var transferDate1 = new Date(transferDate * 1000);
        addPendingTranferToTable.innerHTML += `
        <tr class="tablerow">
              <td>${result[result.length - 1].id}</td>
              <td>${result[result.length - 1].receiver.slice(0, 15) + "..."}</td>
              <td>${result[result.length - 1].sender.slice(0, 15) + "..."}</td>
              <td>${result[result.length - 1].amount / 10**18 + " ETH"}</td>
              <td>${transferDate1.toUTCString()}</td>
              <td>${result[result - 1].approvals}</td>
              <td><span>Cancel</span></td>
              <td><span>Approve</span></td>
             
              
              
              
            
          </tr>`
    
      })
      
      displayAddOwnerPopup(popupMessage);
      
      

  }).on("error", function(error) {
      console.log("user denied transaction");
      
      hideLoader();
      
      
      // $(".loading").hide();
      
  })

}

function approveTransfer() {

  loadBlockchainData();
  var receiverAddress = document.getElementById("create-transfer-reciever-address-field");
  var transferAmount = document.getElementById("create-transfer-amount-field");

  
  if (receiverAddress.value == "" || transferAmount.value == "" ) {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }
  

  const createTransferRequest = contractInstance.methods.createTransfer(web3.utils.toWei(String(transferAmount.value), "ether"), receiverAddress.value).send({from: acc}).on("transactionHash", function(hash) {
        
    console.log(hash);
    loadLoader();
    
  })
  //get confirmation message on confirmation
  .on("confirmation", function(confirmationNr) {
      console.log(confirmationNr);
    

      

  })
  //get receipt when ransaction is first mined
  .on("receipt", function(receipt) {
      console.log(receipt);
      alert("Transaction successful");
      hideLoader();
      var popupMessage = document.getElementById("msg").innerHTML = "Transfer Request has successfully been created";
      const pendingTranfer = contractInstance.methods.getTransferRequests().call().then(function(result) {
      
        console.log(result[result.length - 1].amount);
        var transferDate = result[result.length - 1].timeOfCreation;
        var transferDate1 = new Date(transferDate * 1000);
        addPendingTranferToTable.innerHTML += `
        <tr class="tablerow">
              <td>${result[result.length - 1].id}</td>
              <td>${result[result.length - 1].receiver.slice(0, 15) + "..."}</td>
              <td>${result[result.length - 1].sender.slice(0, 15) + "..."}</td>
              <td>${result[result.length - 1].amount / 10**18 + " ETH"}</td>
              <td>${transferDate1.toUTCString()}</td>
              <td>${result[result - 1].approvals}</td>
              <td><span>Cancel</span></td>
              <td><span>Approve</span></td>
             
              
              
              
            
          </tr>`
    
      })
      
      displayAddOwnerPopup(popupMessage);
      
      

  }).on("error", function(error) {
      console.log("user denied transaction");
      
      hideLoader();
      
      
      // $(".loading").hide();
      
  })

}

function cancelTransferRequest() {

  loadBlockchainData();
  var transferId = document.getElementById("cancel-transfer-id-field");
  

  
  if (transferId.value == "") {
    document.getElementById("popup-1").classList.toggle("active");
    return;
  }
  

  const cancelTransferRequest = contractInstance.methods.cancelTransfer(transferId.value).send({from: acc}).on("transactionHash", function(hash) {
        
    console.log(hash);
    loadLoader();
    
  })
  //get confirmation message on confirmation
  .on("confirmation", function(confirmationNr) {
      console.log(confirmationNr);
    

      

  })
  //get receipt when ransaction is first mined
  .on("receipt", function(receipt) {
      console.log(receipt);
      alert("Transaction successful");
      hideLoader();
      var popupMessage = document.getElementById("msg").innerHTML = "Transfer Request has successfully been canceled";

      displayAddOwnerPopup(popupMessage);
      
      

  }).on("error", function(error) {
      console.log("user denied transaction");
      
      hideLoader();
      
      
      // $(".loading").hide();
      
  }).then(function(result) {
      const balance = contractInstance.methods.getTransferRequests().call().then(function(result) {
      
      console.log(result);

    })
  })

}

var transfer = document.getElementById("transfer");
transfer.onclick = createTransferRequest;

var cancelTransfer = document.getElementById("cancel-transfer");
cancelTransfer.onclick = cancelTransferRequest;


var depositToWallet = document.getElementById("deposit");
depositToWallet.onclick = depositFunds;

var withdrawFromWallet = document.getElementById("withdraw");
withdrawFromWallet.onclick = withdrawFunds;

function updateWalletOwnersNameField(name) {
  walletOwners.push(name);
  return walletOwners;
}

function togglePopup(){
  document.getElementById("popup-1").classList.toggle("active");
  console.log("hello");
}

function loadLoader() {
    
  $(".loading").show();
}

function hideLoader() {
    
  $(".loading").fadeOut(1200);
}

function showDeletePopup() {
  console.log("deleting")
}

var row = document.getElementsByClassName("tablerow");
row.onclick = showDeletePopup()
 
  
  
console.log(walletOwners);


var form = document.querySelector("form");


function addUserToWallet(event) {
  event.preventDeafault();
}
  
  var addUserButton = document.getElementById("add-user-to-wallet");
  addUserButton.onclick = addUser;

  const addUserToTable1 = document.getElementById("owners-table")
  const addUserToTable = document.querySelector('tbody');
  console.log(addUserToTable)
   

  const t = document.querySelectorAll("table")[3];
  console.log("table isss " + t)


  function ondelete(e) {
    console.log("made it into f")
    
    const bt = e.target;
    const btn = e.target.id;

    console.log(btn);
    
    const cancelTransferRequest = contractInstance.methods.cancelTransfer(btn).send({from: acc}).on("transactionHash", function(hash) {
        
      console.log(hash);
      loadLoader();
      
    })
    //get confirmation message on confirmation
    .on("confirmation", function(confirmationNr) {
        console.log(confirmationNr);
      
  
        
  
    })
    //get receipt when ransaction is first mined
    .on("receipt", function(receipt) {
        console.log(receipt);
        alert("Transaction successful");
        hideLoader();
        var popupMessage = document.getElementById("msg").innerHTML = "Transfer Request has successfully been canceled";
  
        displayAddOwnerPopup(popupMessage);
        bt.closest("tr").remove();
        
        
  
    }).on("error", function(error) {
        console.log("user denied transaction");
        
        hideLoader();
        
        
      
    }).then(function(result) {
        const balance = contractInstance.methods.getTransferRequests().call().then(function(result) {
        
        console.log(result);
  
      })
    })
    
    
    
  }
  t.addEventListener("click", ondelete);

  function approveTransferRequest(transferId) {
    loadBlockchainData();

    var transferID = document.getElementById("approve-transfer-field");
    if(transferID.value =="") {
      document.getElementById("popup-1").classList.toggle("active");
      return;
    }

    const approveTransferRequest = contractInstance.methods.Transferapprove(transferID.value).send({from: acc}).on("transactionHash", function(hash) {  
      console.log(hash);
      loadLoader();

    }).on("confirmation", function(confirmationNr) {
        console.log(confirmationNr);

    }).on("receipt", function(receipt) {
        console.log(receipt);
        alert("Transaction successful");
        hideLoader();
        var popupMessage = document.getElementById("msg").innerHTML = "Transfer Request has successfully been approved";
        
    }).on("error", function(error) {
        console.log("user denied transaction");
        hideLoader();
    })
    

  }

  async function getTransferHistroy() {
    const web3 = window.web3
      
      var accounts = await web3.eth.getAccounts()
      
      a = 30;
      account = accounts[0].slice(0, 6);
      acc = accounts[0];
      // console.log(account);
      document.getElementById("display-address").innerHTML = "Account: " + acc.slice(0, 6) + "..";
      document.getElementById("display-balance").innerHTML = "balance: 20 ETH";
  
      
      const networkId = await web3.eth.net.getId()
      const networkData = data.networks[networkId]
      if(networkData) {
        contractInstance = new web3.eth.Contract(data.abi, networkData.address,  {from: acc})
      //   contractInstance = contractInstance1;
        
        
      } else {
        window.alert('IPFSViewer contract not deployed to detected network.')
      }
  
    var results = contractInstance.getPastEvents(
      "transferRequestApproved",
      {fromBlock: 0}
    ).then(function(result) {
      console.log(result)
      for (let i = 0; i < result.length; i++) {
        var returnedTransferHistroyAmount = result[i].returnValues.amount;
        returnedTransferHistroyAmount = returnedTransferHistroyAmount / 10 ** 18;
        var date = result[i].returnValues.timeOfTransfer;
        var date1 = new Date(date * 1000);
        // console.log(date1.toUTCString())
        addTranferToTable.innerHTML += `
        <tr onclick="console.log('hello')" id="tablerow">
              <td id="${result[i].id}">${result[i].returnValues.id}</td>
              <td id="${result[i].id}">${result[i].returnValues.receiver.slice(0, 20) + "..."}</td>
              <td id="${result[i].id}">${result[i].returnValues.sender.slice(0, 20) + "..."}</td>
              <td id="${result[i].id}">${result[i].returnValues.amount / 10**18 + " ETH"}</td>
              <td id="${result[i].id}">${date1.toUTCString()}</td>
          </tr>`
      }
    
    })

    var results = contractInstance.getPastEvents(
      "transferRequestCancelled",
      {fromBlock: 0}
    ).then(function(result) {
      console.log(result)
      for (let i = 0; i < result.length; i++) {
        var returnedCancelledTransferHistroyAmount = result[i].returnValues.amount;
        returnedCancelledTransferHistroyAmount = returnedCancelledTransferHistroyAmount / 10 ** 18;
        var date = result[i].returnValues.timeOfCancellation;
        var date1 = new Date(date * 1000);
        // console.log(date1.toUTCString())
        addCancelledTranferToTable.innerHTML += `
        <tr onclick="console.log('hello')" id="tablerow">
              <td id="${result[i].id}">${result[i].returnValues.id}</td>
              <td id="${result[i].id}">${result[i].returnValues.receiver.slice(0, 20) + "..."}</td>
              <td id="${result[i].id}">${result[i].returnValues.sender.slice(0, 20) + "..."}</td>
              <td id="${result[i].id}">${result[i].returnValues.amount / 10**18 + " ETH"}</td>
              <td id="${result[i].id}">${date1.toUTCString()}</td>
          </tr>`
      }
    
    })
    
  
    
  
  }
  
  const transferApproveButton = document.getElementById("approveTransfer");
  transferApproveButton.onclick = approveTransferRequest;
  const addDepositToTable = document.querySelectorAll("tbody")[1];
  const addWithdrawalToTable = document.querySelectorAll("tbody")[2];
  const addPendingTranferToTable = document.querySelectorAll("tbody")[3];
  const addTranferToTable = document.querySelectorAll("tbody")[4];
  const addCancelledTranferToTable = document.querySelectorAll("tbody")[5];
  var removeUserButton = document.getElementById("remove-user-from-wallet")
  removeUserButton.onclick = removeUser;
//   text.innerHTML("cool");
//   console.log(text);

var hideAddOwner = document.getElementById("close-btn")
hideAddOwner.onclick = hideAddOwnerPopup();

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

async function getDepositHistroy() {
  const web3 = window.web3
    
    var accounts = await web3.eth.getAccounts()
    
    a = 30;
    account = accounts[0].slice(0, 6);
    acc = accounts[0];
    // console.log(account);
    document.getElementById("display-address").innerHTML = "Account: " + acc.slice(0, 6) + "..";
    document.getElementById("display-balance").innerHTML = "balance: 20 ETH";

    
    const networkId = await web3.eth.net.getId()
    const networkData = data.networks[networkId]
    if(networkData) {
      contractInstance = new web3.eth.Contract(data.abi, networkData.address,  {from: acc})
    //   contractInstance = contractInstance1;
      
      
    } else {
      window.alert('IPFSViewer contract not deployed to detected network.')
    }

  var results = contractInstance.getPastEvents(
    "fundsDeposited",
    {fromBlock: 0}
  ).then(function(result) {
    console.log(result[0])
    for (let i = 0; i < result.length; i++) {
      var returnedDepositAmount = result[i].returnValues.amount;
      returnedDepositAmount = returnedDepositAmount / 10 ** 18;
      var date = result[i].returnValues.timeOfDeposit;
      var date1 = new Date(date * 1000);
      // console.log(date1.toUTCString())
      addDepositToTable.innerHTML += `
          <tr "class="tablerow">
              <td>${result[i].returnValues.id}</td>
              <td>${returnedDepositAmount + " ETH"}</td>
              <td>${date1.toUTCString()}</td>
          </tr>`
    }
  
  })
  

  var withdrawresults = contractInstance.getPastEvents(
    "fundsWithdrawed",
    {fromBlock: 0}
  ).then(function(result) {
    // console.log(result[0].returnValues.amount)
    console.log(result[0]);
    for (let i = 0; i < result.length; i++) {
      
      var returnedWithdrawedAmount = result[i].returnValues.amount;
      returnedWithdrawedAmount = returnedWithdrawedAmount / 10 ** 18;
      var withdrawDate = result[i].returnValues.timeOfWithdrawal;
      var withdrawDate1 = new Date(withdrawDate * 1000);
      // console.log(date1.toUTCString())
      addWithdrawalToTable.innerHTML += `
          <tr class="tablerow">
              <td>${result[i].returnValues.id}</td>
              <td>${returnedWithdrawedAmount + " ETH"}</td>
              <td>${withdrawDate1.toUTCString()}</td>
          </tr>`
    }
  
  })

}

async function pendingTransfers() {
  const web3 = window.web3
    
    var accounts = await web3.eth.getAccounts()
    
    a = 30;
    account = accounts[0].slice(0, 6);
    acc = accounts[0];
    

    
    const networkId = await web3.eth.net.getId()
    const networkData = data.networks[networkId]
    if(networkData) {
      contractInstance = new web3.eth.Contract(data.abi, networkData.address,  {from: acc})
    //   contractInstance = contractInstance1;
      
      
    } else {
      window.alert('IPFSViewer contract not deployed to detected network.')
    }

    const pending = contractInstance.methods.getTransferRequests().call().then(function(result) {
      console.log("here are the pending transfers")
      console.log(result.length);
      for (let i = 0; i < result.length; i++) {
        var transferDate = result[i].timeOfCreation;
        var transferDate1 = new Date(transferDate * 1000);
        addPendingTranferToTable.innerHTML += `
        <tr onclick="console.log('hello')" id="tablerow">
              <td id="${result[i].id}">${result[i].id}</td>
              <td id="${result[i].id}">${result[i].receiver.slice(0, 20) + "..."}</td>
              <td id="${result[i].id}">${result[i].sender.slice(0, 20) + "..."}</td>
              <td id="${result[i].id}">${result[i].amount / 10**18 + " ETH"}</td>
              <td id="${result[i].id}">${transferDate1.toUTCString()}</td>
              <td id="${result[i].id}">${result[i].approvals}</td>
              
             
              
              
              
            
          </tr>`
            
      }
    })

  

}


loadWeb3();
  
loadBlockchainData();
// getWalletOwners();
// getDepositHistroy();
pendingTransfers();
getTransferHistroy();
