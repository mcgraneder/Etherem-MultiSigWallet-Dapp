Moralis.initialize("GDTzbp8tldymuUuarksnrmguFjGjPtzIvTDHPMsq"); // Application id from moralis.io
Moralis.serverURL = "https://um3tbvvvky01.bigmoralis.com:2053/server"; //Server url from moralis.io



$(window).on("load",function(){
    $(".loader-wrapper").fadeOut(1200);
    
});

var account = ""

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

async function init() {
    const web3 = window.web3

  //gets all user accounts and displays the current user on the UI (navbar)
    var accounts = await web3.eth.getAccounts()
    account = accounts[0]
}

async function login(){
    console.log("login clicked");
    var user = await Moralis.Web3.authenticate();
    if(user){
        setCurrentUser()
        window.location.href = "walletInterface.html"
        console.log(user);
        user.set("nickname","VITALIK");
        user.set("fav_color","blue");
        user.save();
    }
}

function setCurrentUser() {
    
    currentLoggedInUserObject = { 'user': account.toString()};
    localStorage.setItem('currentLoggedInUserObject', JSON.stringify(currentLoggedInUserObject));
    retrieveCurrentLoggedInUser = localStorage.getItem('currentLoggedInUserObject');
    currentSelectedWallet = JSON.parse(retrieveCurrentLoggedInUser).user

    setTimeout(function(){
        window.location.href = "/walletInterface.html"
   }, 2000);//wait 2 seconds
}
var currentLoggedInUserObject 
// Retrieve the object from storage
currentLoggedInUserObject = { 'user': account.toString()};
localStorage.setItem('currentLoggedInUserObject', JSON.stringify(currentLoggedInUserObject));
var retrieveCurrentLoggedInUser = localStorage.getItem('currentLoggedInUserObject');
var currentLoggedInUser = JSON.parse(retrieveCurrentLoggedInUser).user
console.log('retrieveCurrentLoggedInUser: ', JSON.parse(retrieveCurrentLoggedInUser).user);
console.log(currentLoggedInUser)

var pageLoadObject = { 'section': "transfer-section"};
localStorage.setItem('pageLoadObject', JSON.stringify(pageLoadObject));

var testObject = { 'token': "ETH"};
localStorage.setItem('testObject', JSON.stringify(testObject));

loadWeb3()
init()