//SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

//we need this for the get transferRequests() function
//abicode allows us to print structs
pragma abicoder v2;


contract MultiSigWallet {

    //address array to store owners
    address mainOwner;
    address[] owners;
    //conensus limit for approvals
    uint public limit;
    uint256 public depositId = 0;
    uint256 public withdrawalId = 0;
    uint256 public transferId = 0;

    constructor() {
        mainOwner = msg.sender;
        owners.push(mainOwner);
    }
    
    //set up data structures. each trasnfer has diff properties
    //like amount, the reviever, how many approvals it has, the state of the
    //transfer etc
    struct Transfer{
        uint amount;
        address sender;
        address payable receiver;
        uint approvals;
        bool hasBeenSent;
        uint id;
        uint timeOfCreation;
    }
    
    
    
    //here we create instances of our structs so we can keep logs
    Transfer[] transferRequests;
    
    
    //double mpping which maps an address and the transaction id to an approval boolean
    //false if not approved true if so
    mapping(address => mapping(uint => bool)) public approvals;
    //balance mapping which maps user address ot their account balance
    mapping(address => uint) public balance;
    
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
    
    //evets
    event fundsDeposited(address to, uint256 id, uint amount, uint256 timeOfDeposit);
    event fundsWithdrawed(address to, uint256 id, uint amount, uint256 timeOfWithdrawal);
    event TransferRequestCreated(uint _id, uint _amount, address _initiator, address _receiver);
    event ApprovalReceived(uint _id, uint _approvals, address _approver);
    event TransferApproved(uint _id);
    // event t(uint id, address sender, address receiver, uint amount, uint timeOfTransfer);
    event transferRequestApproved(uint id, address sender, address receiver, uint amount, uint timeOfTransfer);
    
    
    //add user function. require owner is not already in the wallet array
    function addUsers(address _owners) public
    {
        for (uint user = 0; user < owners.length; user++)
        {
            require(owners[user] != _owners, "Already registered");
        }
        require(owners.length <= 4);
        owners.push(_owners);
        
        //from the current array calculate the value of minimum consensus
        limit = owners.length - 1;
    }
    
    //remove user require the address we pass in is the address were removing
    function removeUser(address _user) public
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
        //owners;
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
    function deposit() public payable
    {
        require(msg.value >= 0);
        // require(owners.length > 1, "need to have more than one signer");
    
        balance[msg.sender] += msg.value;
        emit fundsDeposited(msg.sender, depositId, msg.value, block.timestamp);
        depositId++;
    }
    
    
    //next we want to make a get balance function
    function getAccountBalance() public view returns(uint)
    {
        return balance[msg.sender];
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
    function createTransfer(uint _amount, address payable _receiver) public onlyOwners {
        require(owners.length >= 1, "need to have more than one signer");
        //require(msg.sender != _receiver);
        for (uint i = 0; i < owners.length; i++)
        {
            require(owners[i] != _receiver);
        //   if  (owners[i] == _receiver)
        //   {
        //       revert();
        //   }
        }
        emit TransferRequestCreated(transferId, _amount, msg.sender, _receiver);
        transferRequests.push(
            Transfer(_amount, msg.sender, _receiver, 0, false, transferId, block.timestamp)
        );
        transferId++;
        
    }


    function cancelTransfer(uint _id) public {
        require(owners.length >= 1, "need to have more than one signer");
        require(transferRequests[_id].sender == msg.sender, "only the user who created the transfer can cancel")

        uint counter = 0;
        bool hasBeenFound = false;
        for(uint i = 0; i < transferRequests.length; i++) {
           if(transferRequests[i].id == _id) {
               hasBeenFound = true;
               break;
           }
           counter++;
        }
        if(hasBeenFound == false) revert();

        transferRequests[counter] = transferRequests[transferRequests.length - 1];
        transferRequests.pop();


    }
    
    
    
    
    function Transferapprove(uint _id) public onlyOwners {
        require(owners.length >= 1, "need to have more than one signer");
        require(approvals[msg.sender][_id] == false, "transaction alrady approved");
        require(transferRequests[_id].hasBeenSent == false);
        
        // if ( transferRequests[_id].approvals => limit){
        //     approvals[msg.sender][_id] = true;
        // }
        approvals[msg.sender][_id] = true;
        transferRequests[_id].approvals++;
        
        emit ApprovalReceived(_id, transferRequests[_id].approvals, msg.sender);

        if(transferRequests[_id].approvals == limit) {

            // emit transferRequestApproved(_id, msg.sender, transferRequests[_id].receiver, transferRequests[_id].amount, block.timestamp);
            TransferFunds(_id);
        }

        
        
    }
    
    
    
    
     //now we need to create a function to actually transfer the funds after the
    //transfer has been recieved
    function TransferFunds(uint _id) private
    {
        // require(owners.length >= 1, "need to have more than one signer");
        // require(transferRequests[_id].approvals == limit);
        
       
        transferRequests[_id].hasBeenSent = true;
        balance[transferRequests[_id].sender] -= transferRequests[_id].amount;
        balance[transferRequests[_id].receiver] += transferRequests[_id].amount;
        
        emit transferRequestApproved(_id, msg.sender, transferRequests[_id].receiver, transferRequests[_id].amount, block.timestamp);

        transferRequests[_id] = transferRequests[transferRequests.length - 1];
        transferRequests.pop();
        
        // return balance[transferRequests[_id].sender];
    }
    
    //after transfer is called our balance i < transaction amount thus we cannot withfraw
    //update amount after transfer function.
    function withdraw(uint _amount) public onlyOwners returns (uint)
    {
       
        require(balance[msg.sender] >= _amount);
        
        payable(msg.sender).transfer(_amount);
        balance[msg.sender] -= _amount;

        emit fundsWithdrawed(msg.sender, withdrawalId, _amount, block.timestamp);
        withdrawalId++;
        
        return balance[msg.sender];
        
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