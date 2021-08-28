// // function that lets the main wallet owner (contract deployer) add a new wallet signatory
// var account = ""
// var contractInstance =""
// async function init() {
//     const web3 = window.web3

//   //gets all user accounts and displays the current user on the UI (navbar)
//   var accounts = await web3.eth.getAccounts()
//   account = accounts[0].slice(0, 6);
//   acc = accounts[0];    
//   document.getElementById("display-address").innerHTML = "Account: " + acc.slice(0, 6) + "..";
//   document.getElementById("display-balance").innerHTML = "balance: 20 ETH";

//   //gets the current network ID (e.g ropsten, kovan, mainnet) and uses the contract abi imported at the
//   //top of this file to make a new contract instamce using web3.js new contract function. 
//   const networkId = await web3.eth.net.getId()
//   const networkData = data.networks[networkId]
//   if(networkData) {
//     contractInstance = new web3.eth.Contract(data.abi, networkData.address, {from: acc})
//     console.log("the smart contract is " + networkData.address);
//     console.log(contractInstance)
      
//   } else {
//     window.alert('contract not deployed to detected network.')
//   }

// }

// function addUser(){
//     console.log(currentSelectedToken)
//     var addUserNullAddressField = document.getElementById("add-user-address-field");
//     var addUserNullNameField = document.getElementById("add-user-name-field");

//     if (addUserNullAddressField.value == "" || addUserNullNameField == "") {
//       document.getElementById("popup-1").classList.toggle("active");
//       return;
//     }

//     contractInstance.methods.addUsers(addUserNullAddressField.value).send({from: acc}).on("transactionHash", function(hash) {
//           loadLoader();  
//     })
//       //get receipt when ransaction is first mined
//       .on("receipt", function(receipt) {
          
//           hideLoader();
//           var popupMessage = document.getElementById("msg").innerHTML = "Wallet owner has been added";
//           displayAddOwnerPopup(popupMessage);
//           addUserToTable1.innerHTML += `
//           <tr class="tablerow">
//               <td>${addUserNullAddressField.value}</td>
//               <td>${"Evan McGrane"}</td>
//               <td><span class="testb">Remove</span></td>
//           </tr>`

//       }).on("error", function(error) {
//           console.log("user denied transaction");
//           hideLoader();
//       })
// }

// //function that lets the main wallet owner (contract deployer) remove a new wallet signatory
// async function removeUser(){
  
//   var nullAddressField = document.getElementById("remove-user-address-field");
//   var nullNameField = document.getElementById("remove-user-name-field");

//   if (nullAddressField.value == "" || nullNameField == "") {
//     document.getElementById("popup-1").classList.toggle("active");
//     return;
//   }

//   var counter = 1;
//   await contractInstance.methods.getUsers().call().then(function(transferss) {

//     for (let i = 0; i < transferss.length; i++) {
//       if (transferss[i] == nullAddressField.value) {
//          break;
//       }
//       counter++;
//     }
//   })
  
//   const removeUser = contractInstance.methods.removeUser(nullAddressField.value).send({from: acc}).on("transactionHash", function(hash) {
//         loadLoader();  
//     })
//     //get receipt when ransaction is first mined
//     .on("receipt", function(receipt) {
       
//         hideLoader();
//         var popupMessage = document.getElementById("msg").innerHTML = "Wallet owner has been removed";
//         displayAddOwnerPopup(popupMessage);
//         addUserToTable1.deleteRow(counter); 
//     }).on("error", function(error) {
//         hideLoader();
//     })
// }

// async function removeWallletOwner(e) {
  
//     const bt = e.target;
//     const btn = e.target.id;
//     var counter = 1;
//     await contractInstance.methods.getUsers().call().then(function(transferss) {
//       for (let i = 0; i < transferss.length; i++) {
//         if (transferss[i] == btn) {
//            break;
//         }
//         counter++;
//       }
//     })
  
//     const removeUser = contractInstance.methods.removeUser(btn).send({from: acc}).on("transactionHash", function(hash) {
//           loadLoader();  
//       })
//       //get receipt when ransaction is first mined
//       .on("receipt", function(receipt) {
         
//           hideLoader();
//           var popupMessage = document.getElementById("msg").innerHTML = "Wallet owner has been removed";
//           displayAddOwnerPopup(popupMessage);
//           addUserToTable1.deleteRow(counter);
  
//       }).on("error", function(error) {
//           hideLoader();
//       })
//     }


//     const t1 = document.querySelectorAll("table")[0];
//     t1.addEventListener("click", removeWallletOwner);

// var removeUserButton = document.getElementById("remove-user-from-wallet")
// removeUserButton.onclick = removeUser;

// var addUserButton = document.getElementById("add-user-to-wallet");
// addUserButton.onclick = addUser;

// init()