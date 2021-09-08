Moralis.initialize("GDTzbp8tldymuUuarksnrmguFjGjPtzIvTDHPMsq"); // Application id from moralis.io
Moralis.serverURL = "https://um3tbvvvky01.bigmoralis.com:2053/server"; //Server url from moralis.io

var owners = ["0x55DC41A449452d6e1A8fE915bBb607D97678263B", "0xF367CCe608Abe92370C5eA151ed9510438ebD61f", "0xBFb5a2d6353Eb76DF2A185d653332d2002521c52"]

$(window).on("load",function(){
    $(".loader-wrapper").fadeOut(1200);
    
});

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

    //do a remove from local storage instead
    if(owners.includes(accounts[0])) {
        // window.location.href = "/multisig.html"
    }
}
async function login(){
    console.log("login clicked");
    var user = await Moralis.Web3.authenticate();
    if(user){
        window.location.href = "/multisig.html"
        console.log(user);
        user.set("nickname","VITALIK");
        user.set("fav_color","blue");
        user.save();
    }
}

loadWeb3()
init()