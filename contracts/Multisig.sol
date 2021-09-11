//SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
pragma abicoder v2;

import "../node_modules/@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MultiSigWallet {

    address MultiSigInstance;
    address mainOwner;
    address[] owners;

    //conensus limit for approvals
    uint public limit;
    uint256 public depositId = 0;
    uint256 public withdrawalId = 0;
    uint256 public transferId = 0;

    constructor(address _owner) {
        mainOwner = _owner;
        owners.push(mainOwner);
        limit = owners.length - 1;
        tokenList.push("ETH");
    }
    
    //set up data structures. each trasnfer has diff properties
    //like amount, the reviever, how many approvals it has, the state of the
    //transfer etc
    struct Transfer{
        string ticker;
        uint amount;
        address sender;
        address payable receiver;
        uint approvals;
        bool hasBeenSent;
        uint id;
        uint timeOfCreation;
    }

    struct Token {
        string ticker;
        address tokenAddress;
    }
    
    
    //here we create instances of our structs so we can keep logs
    Transfer[] transferRequests;
    
    //double mpping which maps an address and the transaction id to an approval boolean
    //false if not approved true if so
    mapping(address => mapping(uint => bool)) public approvals;
    mapping(address => mapping(string => uint)) public balances;
    mapping(string => Token) public tokenMapping;
    
    //modifier which we can lace in function definitions to restrict access of that 
    //function to the wallet owners
    modifier onlyOwners(){
        bool owner = false;
        for(uint i=0; i<owners.length;i++){
            if(owners[i] == msg.sender){
                owner = true;
            }
        }
        require(owner == true);
        _;
    }

    modifier tokenExists(string memory ticker) {
        
        require(tokenMapping[ticker].tokenAddress != address(0), "Token does not exist");
         _;
    }
    
    //evets
    event fundsDeposited(string ticker, address from, uint256 id, uint amount, uint256 timeStamp);
    event fundsWithdrawed(string ticker, address from, uint256 id, uint amount, uint256 timeStamp);
    event TransferRequestCreated(string ticker, uint id, uint _amount, address _initiator, address _receiver);
    event ApprovalReceived(string ticker, uint id, uint _approvals, address _approver);
    event TransferApproved(string ticker, uint id);
    // event t(uint id, address sender, address receiver, uint amount, uint timeOfTransfer);
    event transferRequestApproved(string ticker, uint id, address sender, address receiver, uint amount, uint timeStamp);
    event transferRequestCancelled(string ticker, uint id, address sender, address receiver, uint amount, uint timeStamp);

   
    
    //we will begin with a double mapping that maps an address token ticker or symbol
    // which maps to the balance of that token. We can have balances of many types of
    //tokens /eth so we need a mapping to keep track of this
    mapping(address => mapping(string => uint256)) public ERC20Tokenbalances;
    string[] public tokenList;

    function setWalletAddress(address _address) private {
        MultiSigInstance = _address;
    }
    
    function callAddOwner(address owner, address wallet) private {
        MultiSigFactory factory = MultiSigFactory(MultiSigInstance);
        factory.addOwner(owner, wallet);
    }

    function callRemoveOwner(address owner, address wallet) private {
        MultiSigFactory factory = MultiSigFactory(MultiSigInstance);
        factory.removeOwner(owner, wallet);
    }
    
    function addToken(string memory ticker, address tokenAddress) external onlyOwners {

        //create new token
        tokenMapping[ticker] = Token(ticker, tokenAddress);
        //add the new token to the token list
        tokenList.push(ticker);
    }
    
    //add user function. require owner is not already in the wallet array
    function addUsers(address _owners, address _address, address walletAddress) public onlyOwners
    {
        for (uint user = 0; user < owners.length; user++)
        {
            require(owners[user] != _owners, "Already registered");
        }
        require(owners.length <= 5);
        owners.push(_owners);
        
        //from the current array calculate the value of minimum consensus
        limit = owners.length - 1;
        
        setWalletAddress(_address);
        callAddOwner(_owners, walletAddress );
    }
    
    //remove user require the address we pass in is the address were removing
    function removeUser(address _user, address _address, address walletAddress) public onlyOwners
    {
        uint user_index;
        for(uint user = 0; user < owners.length; user++)
        {
            if (owners[user] == _user)
            {   
                user_index = user;
                require(owners[user] == _user);
            }
        }
        
        owners[user_index] = owners[owners.length - 1];
        owners.pop();
        limit= owners.length - 1;
        
        setWalletAddress(_address);
        callRemoveOwner(_user, walletAddress );
    }
    
    
    //gets wallet users
    function getUsers() public view returns(address[] memory)
    {
        return owners;
    }
    
    function getApprovalLimit() public view returns (uint)
    {
        return (limit);
    }
    
    
    //deposit function. require deposit amount i sgreater than 0 and withdrawalRequests//the wallet oweners array is greater than 1
    function deposit() public onlyOwners payable {
        
        require(msg.value >= 0);
    
        balances[msg.sender]["ETH"] += msg.value;
        emit fundsDeposited("ETH", msg.sender, depositId, msg.value, block.timestamp);
        depositId++;
    }

    function depositERC20Token(uint amount, string memory ticker) external onlyOwners tokenExists(ticker) returns(bool _success){

        require(tokenMapping[ticker].tokenAddress != address(0));
    
        IERC20(tokenMapping[ticker].tokenAddress).transferFrom(msg.sender, address(this), amount);
        balances[msg.sender][ticker] += amount;  
        _success = true;
        //emit deposited(msg.sender, address(this), amount, ticker);
        emit fundsDeposited(ticker, msg.sender, depositId, amount, block.timestamp);
        depositId++;

        return _success;
    }

    //after transfer is called our balance i < transaction amount thus we cannot withfraw
    //update amount after transfer function.
    function withdraw(uint _amount) public onlyOwners returns (uint)
    {
        require(balances[msg.sender]["ETH"] >= _amount);
        
        payable(msg.sender).transfer(_amount);
        balances[msg.sender]["ETH"] -= _amount;

        emit fundsWithdrawed("ETH", msg.sender, withdrawalId, _amount, block.timestamp);
        withdrawalId++;
        
        return balances[msg.sender]["ETH"];
        
    }

    //withdrawal function
    function withdrawERC20Token(uint amount, string memory ticker) external tokenExists(ticker) onlyOwners {
        require(tokenMapping[ticker].tokenAddress != address(0));
        require(balances[msg.sender][ticker] >= amount);

        balances[msg.sender][ticker] += amount;
        IERC20(tokenMapping[ticker].tokenAddress).transfer(msg.sender, amount);
        emit fundsWithdrawed(ticker, msg.sender, withdrawalId, amount, block.timestamp);
        withdrawalId++;

    }

        
    //next we want to make a get balance function
    function getAccountBalance(string memory ticker) public view returns(uint)
    {
        return balances[msg.sender][ticker];
    }

    //get contratc balance
    function getContractBalance() public view returns(uint)
    {
        return address(this).balance;
    }
    
    
    //next we want to make q function to return the address of the wallet owner
    function getOwner() public view returns(address)
    {
        return msg.sender;
    }
    
    
    //Create an instance of the Transfer struct and add it to the transferRequests array
    function createTransfer(string memory _ticker, uint _amount, address payable _receiver) public onlyOwners {

        require(balances[msg.sender][_ticker] >= _amount, "insufficient balance to create a transfer reauest");
    
        for (uint i = 0; i < owners.length; i++) {
            require(owners[i] != _receiver, "only the wallet owners can make transfer reuqests");
        }
        
        balances[msg.sender][_ticker] -= _amount;
        transferRequests.push(Transfer(_ticker, _amount, msg.sender, _receiver, 0, false, transferId, block.timestamp));
        emit TransferRequestCreated(_ticker, transferId, _amount, msg.sender, _receiver);
        transferId++;
        
    }


    function cancelTransfer(string memory ticker, uint _id) public {
        require(owners.length >= 1, "need to have more than one signer");
        // require(transferRequests[_id].sender == msg.sender, "only the user who created the transfer can cancel");

        uint counter = 0;
        bool hasBeenFound = false;
        for(uint i = 0; i < transferRequests.length; i++) {
           if(transferRequests[i].id == _id) {
               hasBeenFound = true;
               break;
           }
           counter++;
        }
        if(hasBeenFound == false) revert("Trnasfer ID not found cancellation");


        balances[msg.sender][ticker] += transferRequests[counter].amount;
        emit transferRequestCancelled(ticker, transferRequests[counter].id, msg.sender, transferRequests[counter].receiver, transferRequests[counter].amount, block.timestamp);

        transferRequests[counter] = transferRequests[transferRequests.length - 1];
        transferRequests.pop();


    }
    
    
    
    
    function Transferapprove(string memory ticker, uint _id) public onlyOwners {

        uint counter = 0;
        bool hasBeenFound = false;
        for(uint i = 0; i < transferRequests.length; i++) {
           if(transferRequests[i].id == _id) {
               hasBeenFound = true;
               break;
           }
           counter++;
        }
        if(hasBeenFound == false) revert("Transfer ID not found for approval");

        require(msg.sender != transferRequests[counter].sender);
        require(approvals[msg.sender][_id] == false, "transaction alrady approved");
        require(transferRequests[counter].hasBeenSent == false);

        approvals[msg.sender][counter] = true;
        transferRequests[counter].approvals++;
        
        emit ApprovalReceived(ticker, counter, transferRequests[counter].approvals, msg.sender);

        if(transferRequests[counter].approvals == limit) {

            TransferFunds(ticker, counter);
        }

    }    

     //now we need to create a function to actually transfer the funds after the
    //transfer has been recieved
    function TransferFunds(string memory _ticker, uint _id) private {
        
        transferRequests[_id].hasBeenSent = true;
        balances[transferRequests[_id].receiver][_ticker] += transferRequests[_id].amount;
       
        emit transferRequestApproved(_ticker, transferRequests[_id].id, msg.sender, transferRequests[_id].receiver, transferRequests[_id].amount, block.timestamp);

        transferRequests[_id] = transferRequests[transferRequests.length - 1];
        transferRequests.pop();
        
    }
    
    
    function getApprovalState(uint _id) public view returns(uint)
    {
        return transferRequests[_id].approvals;
    }
    
    
    //Should return all transfer requests
    function getTransferRequests() public view returns (Transfer[] memory){
       
        return transferRequests;
    }
}






contract MultiSigFactory {
    
     struct UserWallets{

        address walletAddress;
        uint walletID;
    }

    uint id = 0;
    UserWallets[] public wallets;
    MultiSigWallet[] public multisigInstances;

    mapping(address => UserWallets[]) userWallet;
    event multisigInstanceCreated(uint date, address walletOwner, address multiSigAddress);
   
    function createMultiSig() public {

        MultiSigWallet newWalletInstance = new MultiSigWallet(msg.sender);
        multisigInstances.push(newWalletInstance);
        
        UserWallets[] storage newWallet = userWallet[msg.sender];
        newWallet.push(UserWallets(address(newWalletInstance), id));
        
        emit multisigInstanceCreated(block.timestamp, msg.sender, address(newWalletInstance));
        id++;
    }
    
    function getUserWallets() public view returns (UserWallets[] memory wals) {
        return userWallet[msg.sender];
    }
    
    function addOwner(address account, address walletAddres) public {
        
        UserWallets[] storage newWallet = userWallet[account];
        newWallet.push(UserWallets(walletAddres, id));
      
    }
    
    function getWalletID(address walletAddres) public view returns (uint) {
        
        uint walletId;
        UserWallets[] storage newWallet = userWallet[msg.sender];
        for (uint i = 0; i < newWallet.length; i ++) {
            if (newWallet[i].walletAddress == walletAddres){
                walletId = newWallet[i].walletID;
            }
        }
        
        
        return walletId;
    }

    function removeOwner(address account, address walletAddres) public {
        
        UserWallets[] storage newWallet = userWallet[account];
       
        uint walletIndex;
        bool hasBeenFound = false;
        for(uint i = 0; i < newWallet.length; i++)
        {
            if (newWallet[i].walletAddress == walletAddres)
            {   
                walletIndex = i;
                hasBeenFound = true;
            }
        }
        require(hasBeenFound);

        newWallet[walletIndex] = newWallet[newWallet.length - 1];
        newWallet.pop();
    }
     
}   