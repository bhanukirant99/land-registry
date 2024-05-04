pragma solidity ^0.5.0;

contract LandRegistry {

// Struct declaration for User
    struct User {
        string name;
        address payable account;
        uint256 age;
        string email;
        string aadharIpfsHash;
        string pan_num;
        string phone_num;
        bool verified;
    }

// Struct declaration for land
    struct Land {
        uint id;
        string survey;
        string pid;
        string doc_hash;
        address payable owner;
        string price;
        bool verified;
        bool forsale;
    }

// Struct declaration for Admin
    struct Admin {
        uint id;
        address account;
        string name;
        uint age;
        string phone_num;
    }

// Declare an admin object
    Admin admin;

// Constructor to initialize the account of admin to the address of person who deployed the contract
     constructor() public{
        admin.account = msg.sender ;
    }

// To access the address of the admin
    function getAdminAddress()public view returns (address){
        return admin.account;
    }


// Mappings
    mapping(address => User) public users;
    mapping(uint256 => Land) public lands;
    mapping(address => bool) public registrationMapping;


// Variables
    uint256 public landCount;
    uint256 public userCount;
    address[] public r_users;


// Events
    // event UserRegistered(address payable account, string name);
    // event LandAdded(uint256 id, string name, address payable owner);
    event LandBought(uint256 id, address payable buyer);
    event UserVerified(address userAddress, bool status);
    event LandVerified(uint id, bool status);
    event UserRegistered(string name,uint age,string email,string aadharIpfsHash,string pan_num, string phone_num);
    event LandAdded(uint id,address payable owner,string _doc_hash, string _survey,string _pid, string _price);
    event editSale(uint id, bool forsale);

//Int conversion
  function st2num(string memory numString) public pure returns(uint) {
        uint  val=0;
        bytes   memory stringBytes = bytes(numString);
        for (uint  i =  0; i<stringBytes.length; i++) {
            uint exp = stringBytes.length - i;
            bytes1 ival = stringBytes[i];
            uint8 uval = uint8(ival);
           uint jval = uval - uint(0x30);
   
           val +=  (uint(jval) * (10**(exp-1))); 
        }
      return val;
    }

//Edit Forsale
   function editForSale(uint _id) public{
    lands[_id].forsale = !lands[_id].forsale;

    emit editSale(_id, lands[_id].forsale);
   }

//Check whether user is registered to our network
    function isRegistered(address userAddress)public view returns (bool){
        if(registrationMapping[userAddress])
            return true;
    }

// Verify User by Admin
    function verifyUser(address userAddress,bool _status) public{
        require(msg.sender == address(admin.account));
        users[userAddress].verified=_status;

        emit UserVerified(userAddress, _status);
    }

// Verify Land by Admin
    function verifyLand(uint _id,bool _status) public{
        require(msg.sender == address(admin.account));
        lands[_id].verified=_status;

        emit LandVerified(_id,_status);
    }

// Get User verification status
    function getUserVerificationStatus(address _userAddress) public view returns (bool){
        return users[_userAddress].verified;
    }

// Get land verification status
    function getLandVerificationStatus(address _userAddress) public view returns (bool){
        return users[_userAddress].verified;
    }

// Get all the users
   function getUsers() public view returns( address [] memory ){
        return(r_users);
    }

// To get land count
    function getLandCount() public view returns (uint) {
        return landCount;
    }

// Get Land details
    function getLandDetails(uint _id) public view returns (string memory,string memory,string memory,string memory, address){
        Land memory l = lands[_id];
        return (l.doc_hash, l.pid, l.survey, l.price, l.owner);
    }

// To get land count
    function getUserCount() public view returns (uint) {
        return userCount;
    }

// Register User into the network
    function registerUser(string memory _name,uint256 _age,string memory _email,string memory _aadharIpfsHash,string memory _pan_num,string memory _phone_num) public {
        require(!registrationMapping[msg.sender]);
        User memory newUser = User({
            name: _name,
            account: msg.sender,
            age: _age,
            email: _email,
            aadharIpfsHash: _aadharIpfsHash,
            pan_num: _pan_num,
            phone_num: _phone_num,
            verified:false
        });

        registrationMapping[msg.sender]=true;
        users[msg.sender] = newUser;
        userCount++;
        r_users.push(msg.sender);

        emit UserRegistered(_name,_age,_email,_aadharIpfsHash,_pan_num,_phone_num);
    }

    // Get the user details
     function getUserDetails(address i) public view returns (string memory, uint, string memory, string memory, string memory, string memory,bool) {
        return (users[i].name,users[i].age,users[i].email,users[i].aadharIpfsHash,users[i].pan_num,users[i].phone_num,users[i].verified);
    }

    // Update User
    function updateUser(string memory _name,uint256 _age,string memory _email,string memory _aadharIpfsHash,string memory _pan_num,string memory _phone_num) public {
        //require that Seller is already registered
        require(registrationMapping[msg.sender] && (users[msg.sender].account == msg.sender));

        users[msg.sender].name = _name;
        users[msg.sender].age = _age;
        users[msg.sender].email = _email;
        users[msg.sender].pan_num = _pan_num;
        users[msg.sender].phone_num = _phone_num;
        users[msg.sender].aadharIpfsHash=_aadharIpfsHash;
    }

    // Add land 
    function addLand(string memory _doc_hash, string memory _survey, 
    string memory _pid, string memory _price) public {
        Land memory newLand = Land({
            id: landCount,
            owner: msg.sender,
            doc_hash: _doc_hash,
            survey: _survey,
            pid: _pid,
            verified: false,
            price : _price,
            forsale: false
        });
        lands[landCount] = newLand;
        landCount++;
        emit LandAdded(newLand.id, newLand.owner, _doc_hash, _survey, _pid, _price);
    }

    // Update land
    function updateLand(string memory _doc_hash, string memory _survey, string memory _pid, string memory _price,uint id) public {
        lands[id].pid=_pid;
        lands[id].doc_hash=_doc_hash;
        lands[id].survey=_survey;
        lands[id].price=_price;
    }

    // Buy Land
    function buyLand(uint _id) public payable {
        //Is user verified
        //require(registrationMapping[])
        uint _price = st2num(lands[_id].price);
         // Require that there is enough Ether in the transaction
        require(msg.value >= _price);
        // Require that the buyer is not the seller
        require(lands[_id].owner != msg.sender);
        // Pay the seller by sending them Ether
        lands[_id].owner.transfer(msg.value);
        // Trigger an event
        lands[_id].owner = msg.sender;
        // Update forsale
        lands[_id].forsale = false;

        emit LandBought(landCount, msg.sender);
    }

}