document.addEventListener('DOMContentLoaded', async (event) => {
    const connectButton = document.getElementById('connectButton');
    const walletSelector = document.querySelector('.wallet-selector');
    const ethWrapper = document.getElementById('ethWrapper');
    const ethWalletButton = document.getElementById('ethWalletButton');

    window.ethData = {
        provider: null,
        signer: null,
        userAddress: null,
        chainId: null
    }

    // Функція для отримання поточної адреси
    const getCurrentAddress = async () => {
        return window.ethData.userAddress;
    }

    // Функція для отримання поточного балансу
    const getCurrentBalance = async () => {
        return await window.ethData.provider.getBalance(getCurrentAddress());
    }

    // Функція для відправки валюти
    const sendCurrency = async (to, amount) => {
        return await window.ethData.signer.sendTransaction({
            to: to,
            value: amount
        });
    }

    // Функція для перевірки типів даних
    // Функція для перевірки типів даних
    const validate = (address, amount) => {
        if (!ethers.utils.isAddress(address)) {
            throw new Error('Invalid Ethereum address');
        }

        if (!ethers.BigNumber.isBigNumber(amount)) {
            throw new Error('Invalid amount');
        }
    }


    // Функція для отримання поточного облікового запису
    const getCurrentAccount = async () => {
        return window.ethData.userAddress;
    }

    // Функції для перетворення чисел з і на десяткові
    const toDecimals = (value) => {
        return ethers.utils.parseUnits(value, 18);
    }

    const fromDecimals = (value) => {
        return ethers.utils.formatEther(value);
    }

    // Функції для отримання та встановлення постачальника
    const getProvider = () => {
        return window.ethData.provider;
    }

    const setProvider = (provider) => {
        window.ethData.provider = provider;
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

        setProvider(provider); // Використання нової функції setProvider
        window.ethData.signer = signer;
        window.ethData.userAddress = await signer.getAddress();
        window.ethData.chainId = network.chainId;

        prepareEthWrapper();
        walletSelector.style.display = 'flex';
        connectButton.style.display = 'none';
        connectBTCButton.style.display = 'none';
    }

    const prepareEthWrapper = async () => {
        ethWrapper.style.display = 'block';
        erc20Wrapper.style.display = 'none'; // Цей рядок ховає гаманець ERC20
        ethWalletButton.classList.add('active');

        ethAccount.textContent = await getCurrentAccount(); // Використання нової функції getCurrentAccount
        const balance = await getCurrentBalance(); // Використання нової функції getCurrentBalance
        const balanceForUI = fromDecimals(balance); // Використання нової функції fromDecimals
        ethBalance.textContent = Number(balanceForUI).toFixed(6);
    }

    const onSendEth = async () => {
        const sendToValue = ethSendTo.value;
        const sendAmountValue = toDecimals(ethSendAmount.value); // Використання нової функції toDecimals

        try {
            validate(sendToValue, sendAmountValue); // Використання нової функції validate
            const tx = await sendCurrency(sendToValue, sendAmountValue); // Використання нової функції sendCurrency
            console.log("Hash:", tx.hash);
            const result = await tx.wait();
            console.log(`Sending ${ethSendAmount.value} ETH to ${sendToValue}`);
            alert(`Sending ${ethSendAmount.value} ETH to ${sendToValue}`);
            prepareEthWrapper();
        } catch (e) {
            console.error(e);
        }
    }

    document.getElementById('ethSendButton').addEventListener('click', onSendEth);
    connectButton.addEventListener('click', onConnect);
    ethWalletButton.addEventListener('click', prepareEthWrapper);
});
