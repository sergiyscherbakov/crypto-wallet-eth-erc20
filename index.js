document.addEventListener('DOMContentLoaded', async (event) => {
    const connectButton = document.getElementById('connectButton');
    const connectBTCButton = document.getElementById('connectBTCButton');
    const walletSelector = document.querySelector('.wallet-selector');
    const ethWrapper = document.getElementById('ethWrapper');
    const erc20Wrapper = document.getElementById('erc20Wrapper');
    const ethWalletButton = document.getElementById('ethWalletButton');
    const erc20WalletButton = document.getElementById('erc20WalletButton');

    const ERC20Address = "0xab98f7439a8e57cec30cb36e5152316ce7ba3372"; // Ваша адреса ERC20

    // Завантажуємо ABI з файлу JSON
    const response = await fetch('SERToken.json');
    const ERC20_ABI = await response.json();

    const ethData = {
        provider: null,
        signer: null,
        userAddress: null,
        chainId: null
    }

    const onConnect = async () => {
        if (!window.ethereum) {
            alert('Please install MetaMask');
            return;
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);

        const signer = provider.getSigner();
        const network = await provider.getNetwork();

        ethData.provider = provider;
        ethData.signer = signer;
        ethData.userAddress = await signer.getAddress();
        ethData.chainId = network.chainId;

        prepareEthWrapper();
        walletSelector.style.display = 'flex';
        connectButton.style.display = 'none';
        connectBTCButton.style.display = 'none';
    }

    const prepareEthWrapper = async () => {
        ethWrapper.style.display = 'block';
        erc20Wrapper.style.display = 'none';
        ethWalletButton.classList.add('active');
        erc20WalletButton.classList.remove('active');

        ethAccount.textContent = ethData.userAddress;
        const balance = await ethData.provider.getBalance(ethData.userAddress);
        const balanceForUI = ethers.utils.formatEther(balance);
        ethBalance.textContent = Number(balanceForUI).toFixed(6);

        // ethSendButton.addEventListener('click', onSendEth); // Видалено цей рядок
    }

    const onSendEth = async () => {
        const sendToValue = ethSendTo.value;
        const sendAmountValue = ethers.utils.parseUnits(ethSendAmount.value, 18);
        const tx = await ethData.signer.sendTransaction({
            to: sendToValue,
            value: sendAmountValue
        });
        console.log("Hash:", tx.hash);
        const result = await tx.wait();
        console.log(`Sending ${ethSendAmount.value} ETH to ${sendToValue}`);
        alert(`Sending ${ethSendAmount.value} ETH to ${sendToValue}`);
        prepareEthWrapper();
    }
// Додано цей рядок
    document.getElementById('ethSendButton').addEventListener('click', onSendEth);

    const onSendERC20 = async () => {
        const response = await fetch('SERToken.json');
        const data = await response.json();
        const ERC20_ABI = data.abi; // Змінено з data на data.abi

        const sendToValue  = erc20SendTo.value;
        const ERC20Contract  = new ethers.Contract(ERC20Address, ERC20_ABI, ethData.signer);
        const decimals = await ERC20Contract.decimals();
        const sendAmountValue = ethers.utils.parseUnits(erc20SendAmount.value, decimals);

        try {
            const tx = await ERC20Contract.transfer(sendToValue, sendAmountValue);
            console.log("Transaction Hash:", tx.hash);
            const result = await tx.wait();
            console.log("Transaction Receipt:", result);
            await prepareERC20Wrapper();
            erc20SendTo.value = '';
            erc20SendAmount.value = '';
        } catch (e) {
            console.error(e);
        }
    }

// Додано цей рядок
    document.getElementById('erc20SendButton').addEventListener('click', onSendERC20);

    const prepareERC20Wrapper = async () => {
        const response = await fetch('SERToken.json');
        const data = await response.json();
        const ERC20_ABI = data.abi;

        const ERC20Contract = new ethers.Contract(ERC20Address, ERC20_ABI, ethData.provider);

        const balance = await ERC20Contract.balanceOf(ethData.userAddress);
        const tokenName = await ERC20Contract.name();
        const decimals = await ERC20Contract.decimals();

        const balanceForUI = ethers.utils.formatUnits(balance, decimals);
        const balanceElement = document.getElementById('erc20Balance');
        const accountElement = document.getElementById('erc20Account');
        const tokenNameElement = document.getElementById('erc20TokenName');

        balanceElement.textContent = Number(balanceForUI).toFixed(6);
        accountElement.textContent = ethData.userAddress;
        tokenNameElement.textContent = tokenName;

        ethWrapper.style.display = 'none';
        erc20Wrapper.style.display = 'block';
        ethWalletButton.classList.remove('active');
        erc20WalletButton.classList.add('active');
    }

    connectButton.addEventListener('click', onConnect);
    ethWalletButton.addEventListener('click', prepareEthWrapper);
    erc20WalletButton.addEventListener('click', prepareERC20Wrapper);
});
