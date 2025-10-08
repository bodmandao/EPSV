pragma solidity ^0.8.19;

/// @title OGVaultPay - simple deposit/withdraw hub for native & ERC20 payments
/// @notice Accepts native or ERC20 deposits on behalf of recipients, tracks balances, emits events.
/// @dev Uses OpenZeppelin patterns (SafeERC20 semantics implemented inline to avoid imports requirement).
interface IERC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address) external view returns (uint256);
    function transfer(address to, uint256 value) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

abstract contract ReentrancyGuard {
    uint256 private _status;
    constructor() { _status = 1; }
    modifier nonReentrant() {
        require(_status == 1, "Reentrant");
        _status = 2;
        _;
        _status = 1;
    }
}

contract OGVaultPay is ReentrancyGuard {
    address public owner;

    // token == address(0) denotes native token (OG)
    // balances[token][recipient] => amount
    mapping(address => mapping(address => uint256)) public balances;

    event Deposit(address indexed token, address indexed from, address indexed recipient, uint256 amount);
    event Withdraw(address indexed token, address indexed recipient, address indexed to, uint256 amount);
    event Rescue(address indexed token, address indexed to, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "OGVaultPay: caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), owner);
    }

    /// @notice Deposit funds for a recipient. If token == address(0) send native with msg.value.
    /// @param token address(0) for native, otherwise ERC20 token address
    /// @param recipient the address credited in internal ledger
    /// @param amount amount to deposit (in wei or token decimals)
    function deposit(address token, address recipient, uint256 amount) external payable nonReentrant {
        require(recipient != address(0), "OGVaultPay: recipient zero");
        if (token == address(0)) {
            // native deposit
            require(msg.value == amount, "OGVaultPay: msg.value mismatch");
            balances[address(0)][recipient] += amount;
        } else {
            // ERC20 deposit - caller must have approved contract
            require(msg.value == 0, "OGVaultPay: do not send native when depositing ERC20");
            // transferFrom sender -> this
            bool ok = IERC20(token).transferFrom(msg.sender, address(this), amount);
            require(ok, "OGVaultPay: ERC20 transferFrom failed");
            balances[token][recipient] += amount;
        }

        emit Deposit(token, msg.sender, recipient, amount);
    }

    /// @notice Withdraw balance for msg.sender (recipient). Withdraws native or ERC20 to `to`.
    /// @param token address(0) for native, otherwise ERC20 token address
    /// @param to recipient external address where funds will be sent
    /// @param amount amount to withdraw
    function withdraw(address token, address to, uint256 amount) external nonReentrant {
        require(to != address(0), "OGVaultPay: to zero");
        uint256 bal = balances[token][msg.sender];
        require(bal >= amount, "OGVaultPay: insufficient balance");
        balances[token][msg.sender] = bal - amount;

        if (token == address(0)) {
            // native transfer
            (bool sent, ) = to.call{value: amount}("");
            require(sent, "OGVaultPay: native send failed");
        } else {
            bool ok = IERC20(token).transfer(to, amount);
            require(ok, "OGVaultPay: ERC20 transfer failed");
        }

        emit Withdraw(token, msg.sender, to, amount);
    }

    /// @notice Owner rescue function - withdraw accidental tokens/native to `to`.
    /// @param token token address to rescue (address(0) for native)
    /// @param to destination
    /// @param amount amount to rescue
    function rescue(address token, address to, uint256 amount) external onlyOwner nonReentrant {
        require(to != address(0), "OGVaultPay: to zero");

        if (token == address(0)) {
            uint256 nativeBal = address(this).balance;
            require(nativeBal >= amount, "OGVaultPay: insufficient native");
            (bool sent, ) = to.call{value: amount}("");
            require(sent, "OGVaultPay: native rescue failed");
        } else {
            uint256 tokenBal = IERC20(token).balanceOf(address(this));
            require(tokenBal >= amount, "OGVaultPay: insufficient token");
            bool ok = IERC20(token).transfer(to, amount);
            require(ok, "OGVaultPay: token rescue failed");
        }

        emit Rescue(token, to, amount);
    }

    /// @notice Update owner
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "OGVaultPay: newOwner zero");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // Allow the contract to receive native
    receive() external payable {
        // If someone sends native without calling deposit, credit their own ledger
        balances[address(0)][msg.sender] += msg.value;
        emit Deposit(address(0), msg.sender, msg.sender, msg.value);
    }
}
