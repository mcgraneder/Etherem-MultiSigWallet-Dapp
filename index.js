
import data from './build/contracts/MultiSigWallet.json' assert { type: "json" };


console.log(data);
var acc = "";
var account = "";
var contractInstance = "";
var walletOwners = [];

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

  // var results = contractInstance.getPastEvents(
  //   "fundsDeposited",
  //   {fromBlock: 0}
  // ).then(function(result) {
  //   // console.log(result[0].returnValues.amount)
  //   for (let i = 0; i < result.length; i++) {
  //     var returnedDepositAmount = result[i].returnValues.amount;
  //     returnedDepositAmount = returnedDepositAmount / 10 ** 18;
  //     var date = result[i].returnValues.timeOfDeposit;
  //     var date1 = new Date(date * 1000);
  //     // console.log(date1.toUTCString())
  //     addDepositToTable.innerHTML += `
  //         <tr class="tablerow">
  //             <td>${result[i].returnValues.to}</td>
  //             <td>${returnedDepositAmount + " ETH"}</td>
  //             <td>${date1.toUTCString()}</td>
  //         </tr>`
  //   }
  
  // })
  

  


  }

function addUser(){

    loadBlockchainData();
    
    var addUserNullAddressField = document.getElementById("add-user-address-field");
    var addUserNullNameField = document.getElementById("add-user-name-field");

    
    if (addUserNullAddressField.value == "" || addUserNullNameField == "") {
      document.getElementById("popup-1").classList.toggle("active");
      return;
    }

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
              <td><span>Remove</span></td>
              
              
              
            
          </tr>`
  

      }).on("error", function(error) {
          console.log("user denied transaction");
          hideLoader();
       
          // $(".loading").hide();
          
      })
}

function removeUser(){
  
  loadBlockchainData();
  
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
      addUserToTable.innerHTML += `
          <tr class="tablerow">
              <td>${result[i]}</td>
              <td>${"Evan McGrane"}</td>
              <td><span>Remove</span></td>
          </tr>`
    }
  })
}

function depositFunds() {
  loadBlockchainData();

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
  loadBlockchainData();

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
}


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
    
  $(".loading").hide();
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

  const addUserToTable = document.querySelector('tbody');
  console.log(addUserToTable)
   
  const addDepositToTable = document.querySelectorAll("tbody")[1];
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
    // console.log(result[0].returnValues.amount)
    for (let i = 0; i < result.length; i++) {
      var returnedDepositAmount = result[i].returnValues.amount;
      returnedDepositAmount = returnedDepositAmount / 10 ** 18;
      var date = result[i].returnValues.timeOfDeposit;
      var date1 = new Date(date * 1000);
      // console.log(date1.toUTCString())
      addDepositToTable.innerHTML += `
          <tr class="tablerow">
              <td>${result[i].returnValues.id}</td>
              <td>${returnedDepositAmount + " ETH"}</td>
              <td>${date1.toUTCString()}</td>
          </tr>`
    }
  
  })
}

loadWeb3();
  
loadBlockchainData();
getWalletOwners();
getDepositHistroy();