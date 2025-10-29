document.addEventListener('DOMContentLoaded', async (event) => {
    const erc20Wrapper = document.getElementById('erc20Wrapper');
    const erc20WalletButton = document.getElementById('erc20WalletButton');

    const ERC20Address = "0xab98f7439a8e57cec30cb36e5152316ce7ba3372"; // Ваша адреса ERC20

    // Завантажуємо ABI з файлу JSON
    const response = await fetch('SERToken.json');
    const data = await response.json();
    const ERC20_ABI = data.abi;

    // Функція для отримання поточної адреси
    const getCurrentAddress = async () => {
        return window.ethData.userAddress;
    }

    // Функція для отримання поточного балансу
    const getCurrentBalance = async (contract) => {
        return await contract.balanceOf(getCurrentAddress());
    }

    // Функція для відправки валюти
    const sendCurrency = async (contract, to, amount) => {
        return await contract.transfer(to, amount);
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
    const toDecimals = (value, decimals) => {
        return ethers.utils.parseUnits(value, decimals);
    }

    const fromDecimals = (value, decimals) => {
        return ethers.utils.formatUnits(value, decimals);
    }

    // Функції для отримання та встановлення постачальника
    const getProvider = () => {
        return window.ethData.provider;
    }

    const setProvider = (provider) => {
        window.ethData.provider = provider;
    }

    const prepareERC20Wrapper = async () => {
        const ERC20Contract = new ethers.Contract(ERC20Address, ERC20_ABI, getProvider()); // Використання нової функції getProvider

        const balance = await getCurrentBalance(ERC20Contract); // Використання нової функції getCurrentBalance
        const tokenName = await ERC20Contract.name();
        const decimals = await ERC20Contract.decimals();

        const balanceForUI = fromDecimals(balance, decimals); // Використання нової функції fromDecimals
        const balanceElement = document.getElementById('erc20Balance');
        const accountElement = document.getElementById('erc20Account');
        const tokenNameElement = document.getElementById('erc20TokenName');

        balanceElement.textContent = Number(balanceForUI).toFixed(6);
        accountElement.textContent = await getCurrentAccount(); // Додано await перед getCurrentAccount
        tokenNameElement.textContent = tokenName;

        ethWrapper.style.display = 'none';
        erc20Wrapper.style.display = 'block';
        erc20WalletButton.classList.add('active');
    }


    const onSendERC20 = async () => {
        const sendToValue  = erc20SendTo.value;
        const ERC20Contract  = new ethers.Contract(ERC20Address, ERC20_ABI, window.ethData.signer);
        const decimals = await ERC20Contract.decimals();
        const sendAmountValue = toDecimals(erc20SendAmount.value, decimals); // Використання нової функції toDecimals

        try {
            validate(sendToValue, sendAmountValue); // Використання нової функції validate
            const tx = await sendCurrency(ERC20Contract, sendToValue, sendAmountValue); // Використання нової функції sendCurrency
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

    document.getElementById('erc20SendButton').addEventListener('click', onSendERC20);
    erc20WalletButton.addEventListener('click', prepareERC20Wrapper);
});
