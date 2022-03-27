const axios = require('axios');
const Web3 = require('web3');
const ethers = require('ethers');
const PROVIDER_URL = 'https://node.dexalot-dev.com/ext/bc/C/rpc';
const web3 = new Web3('https://node.dexalot-dev.com/ext/bc/C/rpc');
const erc20FileAbi = require('./erc20abi.json');

const MAIN_WALLET = '0x2E5183fAF2F7809b205019676d5019B617ef5B03';
const SECOND_ADDRESS = '0x853e33fCE5808c8c42647F6f07510c15a66f37e6';

const MAIN_PRIVATE_KEY =
    'a3ab64c5deeb8625f9a321e150056cbf49214dd4f38e5ea035eb372b5659d8da';
const SECOND_PRIVATE_KEY =
    '95eae46b371e9aa770a3537f652dae018aa09f8428f927e83e408a7a03722836';

const MAX_BATCH_SIZE = 20;

const TEAM4_ADDRESS = '0x1dc1bCFE5cF9d40Ab05a33901f164Ba651a823f1';

const API_BASE_URL = 'https://api.dexalot-dev.com/api';

const SPREAD = 2.5;

enum DeploymentType {
    EXCHANGE = 'Exchange',
    PORTFOLIO = 'Portfolio',
    TRADEPAIRS = 'TradePairs',
    ORDERBOOKS = 'OrderBooks',
}

enum SignalTypes {
    BUY = 0,
    SELL = 1,
}

var exchangeAbi,
    exchangeAddress,
    portfolioAbi,
    portfolioAddress,
    pairsAbi,
    pairsAddress,
    orderbookAbi,
    orderbookAddress,
    ourPair,
    addAfterFill = null;

var latestPrice;

async function getAbis() {
    let abis = [];
    abis.push(
        axios
            .get(
                `${API_BASE_URL}/trading/deploymentabi/${DeploymentType.EXCHANGE}`
            )
            .then((res) => {
                exchangeAbi = res.data.abi.abi;
                exchangeAddress = res.data.address;
            })
            .catch((err) => {
                console.log('Error excahnge abi: ', err.message);
            })
    );

    abis.push(
        axios
            .get(
                `${API_BASE_URL}/trading/deploymentabi/${DeploymentType.PORTFOLIO}`
            )
            .then((res) => {
                portfolioAbi = res.data.abi.abi;
                portfolioAddress = res.data.address;
            })
            .catch((err) => {
                console.log('Error portfolio abi: ', err.message);
            })
    );

    abis.push(
        axios
            .get(
                `${API_BASE_URL}/trading/deploymentabi/${DeploymentType.ORDERBOOKS}`
            )
            .then((res) => {
                orderbookAbi = res.data.abi.abi;
                orderbookAddress = res.data.address;
            })
            .catch((err) => {
                console.log('Error orderbooks abi: ', err.message);
            })
    );

    abis.push(
        axios

            .get(
                `${API_BASE_URL}/trading/deploymentabi/${DeploymentType.TRADEPAIRS}`
            )
            .then((res) => {
                pairsAbi = res.data.abi.abi;
                pairsAddress = res.data.address;
            })
            .catch((err) => {
                console.log('Error pairs abi: ', err.message);
            })
    );

    await Promise.all(abis);
}

async function cancelAll(tradePair, tradePairId, orders, wallet) {
    if (!orders.length) {
        return;
    }
    const batch = orders.splice(0, Math.min(MAX_BATCH_SIZE, orders.length));
    console.log('cancelling batch with', batch.length);
    const tx = await tradePair
        .connect(wallet)
        .cancelAllOrders(tradePairId, batch);
    await tx.wait();

    if (orders.length) {
        cancelAll(tradePair, tradePairId, orders, wallet);
    }
}

async function getOpenOrders(tradePairId, walletAddress) {
    let orders = [];
    await axios
        .get(`${API_BASE_URL}/trading/openorders/params`, {
            params: {
                traderaddress: walletAddress,
                pair: tradePairId,
            },
        })
        .then((res) => {
            orders = res.data.rows;
        })
        .catch((err) => {
            console.log('Error getting orders: ', err.message);
        });
    return orders;
}

async function getPairs() {
    let pairs = [];

    await axios
        .get(`${API_BASE_URL}/trading/pairs`)
        .then((res) => {
            pairs = res.data;
        })
        .catch((err) => {
            console.log('Error GETTING PAIRS: ', err.message);
        });

    return pairs;
}

async function getGasOfOrder() {}

function printOrders(orders, address) {
    console.log(
        'For this wallet ',
        address,
        ' you have ',
        orders.length,
        ' open orders'
    );
    if (orders.length) {
        console.log(orders);
    }
}

function calcSpreadPrices(midOrLastPrice) {
    return {
        lower: (midOrLastPrice * (100 - SPREAD)) / 100,
        higher: (midOrLastPrice * (100 + SPREAD)) / 100,
    };
}

async function depositToPortfolio(
    mainWallet,
    secondWallet,
    portfolio,
    baseToken,
    baseSymbol,
    decimals
) {
    await mainWallet.sendTransaction({
        from: mainWallet.address,
        to: portfolio.address,
        value: ethers.utils.parseEther('25'),
    });
    await secondWallet.sendTransaction({
        from: secondWallet.address,
        to: portfolio.address,
        value: ethers.utils.parseEther('25'),
    });
    await baseToken
        .connect(mainWallet)
        .approve(portfolio.address, ethers.utils.parseUnits('100', decimals));
    await baseToken
        .connect(secondWallet)
        .approve(portfolio.address, ethers.utils.parseUnits('100', decimals));
    await portfolio
        .connect(mainWallet)
        .depositToken(
            mainWallet.address,
            baseSymbol,
            ethers.utils.parseUnits('100', decimals)
        );
    await portfolio
        .connect(secondWallet)
        .depositToken(
            secondWallet.address,
            baseSymbol,
            ethers.utils.parseUnits('100', decimals)
        );
}

async function approveTokenUsage(
    mainWallet,
    secondWallet,
    portfolio,
    baseToken,
    decimals
) {
    await baseToken
        .connect(mainWallet)
        .approve(portfolio.address, ethers.utils.parseUnits('500', decimals));
    await baseToken
        .connect(secondWallet)
        .approve(portfolio.address, ethers.utils.parseUnits('500', decimals));
}

async function satisfyFirstBuy(
    tradePairs,
    tradePairId,
    secondWallet,
    orders,
    decimals
) {
    const firstBuy = orders.find((order) => order.side === SignalTypes.BUY);
    if (firstBuy && firstBuy.status < 3 ) {
        let price = typeof(firstBuy.price) !== 'string' ? firstBuy.price: ethers.utils.parseUnits(firstBuy.price, decimals);
        let quantity = typeof(firstBuy.quantity) !== 'string' ? firstBuy.quantity: ethers.utils.parseUnits(firstBuy.quantity, decimals);
        await addOrderAfterEstimation(tradePairs, tradePairId, secondWallet, price, quantity, SignalTypes.SELL);
    }
}

async function satisfyFirstSell(
    tradePairs,
    tradePairId,
    secondWallet,
    orders,
    decimals
) {
    const firstSell = orders.find((order) => order.side === SignalTypes.SELL);
    if (firstSell && firstSell.status < 3 ) {
        let price = typeof(firstSell.price) !== 'string' ? firstSell.price: ethers.utils.parseUnits(firstSell.price, decimals);
        let quantity = typeof(firstSell.quantity) !== 'string' ? firstSell.quantity: ethers.utils.parseUnits(firstSell.quantity, decimals);
        await addOrderAfterEstimation(tradePairs, tradePairId, secondWallet, price, quantity, SignalTypes.BUY);
    }
}

async function addOrderAfterEstimation(tradePairs, tradePairId, wallet, price, quantity, side) {
    
    let estimateGas = await tradePairs
        .connect(wallet).estimateGas
        .addOrder(
            tradePairId,
            price,
            quantity,
            side,
            1
        );
    console.log("Estimated Gas:", estimateGas.toString());
    let trx = await tradePairs
        .connect(wallet)
        .addOrder(
            tradePairId,
            price,
            quantity,
            side,
            1
        );
    await trx.wait();
}

async function main() {
    await getAbis();
    const pairs = await getPairs();
    let tradePair = `TEAM4/AVAX`;
    let tradePairId = ethers.utils.formatBytes32String(tradePair);
    ourPair = pairs.find((pair) => pair.pair === tradePair);

    if (
        !exchangeAbi ||
        !orderbookAbi ||
        !portfolioAbi ||
        !pairsAbi ||
        !ourPair
    ) {
        console.log('Failed to get contract addresses and ABIs.. exiting');
        return;
    }

    // print abi notifications
    console.log('Successfully retreived contract ABIs from API');

    let baseSymbol = ethers.utils.formatBytes32String('TEAM4');
    let decimals = 18;

    var customProvider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
    let mainWallet = new ethers.Wallet(MAIN_PRIVATE_KEY, customProvider);
    let secondWallet = new ethers.Wallet(SECOND_PRIVATE_KEY, customProvider);

    let mainOpenOrders = await getOpenOrders(tradePair, mainWallet.address);
    let secondOpenOrders = await getOpenOrders(
        tradePair,
        secondWallet.address
    );

    // print orders
    printOrders(mainOpenOrders, mainWallet.address);
    printOrders(secondOpenOrders, secondWallet.address);

    // print pairs
    // console.log(pairs);

    // print our pair info ( trade increments, min, max trade amount)
    console.log('=================================\n');
    console.log('Pair:', tradePair);
    console.log(ourPair);
    console.log('=================================\n');

    const portfolio = new ethers.Contract(
        portfolioAddress,
        portfolioAbi,
        mainWallet
    );
    const tradePairs = new ethers.Contract(pairsAddress, pairsAbi, mainWallet);
    const tradePairsContract = new web3.eth.Contract(pairsAbi, pairsAddress);
    const baseToken = new ethers.Contract(
        TEAM4_ADDRESS,
        erc20FileAbi,
        mainWallet
    );

    let pairPrice = 0;
    const latestBlock = await customProvider.getBlockNumber();

    // listen to events
    // tradePairs.on(
    //     'Executed',
    //     (
    //         pair,
    //         price,
    //         quantity,
    //         maker,
    //         taker,
    //         feeMaker,
    //         feeTaker,
    //         feeMakerBase,
    //         execId
    //     ) => {
    //         // console.log(
    //         //     pair,
    //         //     price,
    //         //     quantity,
    //         //     maker,
    //         //     taker,
    //         //     feeMaker,
    //         //     feeTaker,
    //         //     feeMakerBase,
    //         //     execId
    //         // );
    //     }
    // );

    tradePairs.on(
        'OrderStatusChanged',
        (
            traderaddress,
            pair,
            id,
            price,
            totalamount,
            quantity,
            side,
            type1,
            status,
            quantityfilled,
            totalfee
        ) => {
            if (pair != tradePairId) {
                return;
            }
            if (status >= 3 && status <= 6) {
                console.log(status === 3 ? 'OrderStatusChanged filled': 'OrderStatusChanged cancelled', id);
                if (status === 3) {
                    latestPrice = price;
                }
                let orderPrice = typeof(price) !== 'string' ? price: ethers.utils.parseUnits(price, decimals);
                let quant = ethers.utils.parseUnits('2', decimals);
                let signal = side ? SignalTypes.BUY : SignalTypes.SELL;
                if (traderaddress == mainWallet.address) {
                    mainOpenOrders = mainOpenOrders.filter((order) => order.id !== id);
                } else if (traderaddress == secondWallet.address){
                    secondOpenOrders = secondOpenOrders.filter((order) => order.id !== id);
                }
            } else if (status == 0){
                console.log('OrderStatusChanged added', id);
                if (traderaddress == mainWallet.address) {
                    mainOpenOrders.push({
                        id: id,
                        traderaddress: traderaddress,
                        pair: pair,
                        type: type1,
                        side: side,
                        price: price,
                        quantity: quantity,
                        totalamount: totalamount,
                        status: status,
                        quantityfilled: quantityfilled,
                        totalfee: totalfee,
                    })
                } else if (traderaddress == secondWallet.address){
                    secondOpenOrders.push({
                        id: id,
                        traderaddress: traderaddress,
                        pair: pair,
                        type: type1,
                        side: side,
                        price: price,
                        quantity: quantity,
                        totalamount: totalamount,
                        status: status,
                        quantityfilled: quantityfilled,
                        totalfee: totalfee,
                    })
                }
            } else if (status == 2){
                console.log('OrderStatusChanged partially filled', id);
                latestPrice = price;
                if (traderaddress == mainWallet.address) {
                    mainOpenOrders.forEach(element => {
                        if (element.id == id) {
                            element.price = price;
                            element.quantity= quantity;
                            element.totalamount= totalamount;
                            element.status= status;
                            element.quantityfilled= quantityfilled;
                            element.totalfee= totalfee;
                        }
                    })
                } else if (traderaddress == secondWallet.address){
                    mainOpenOrders.forEach(element => {
                        if (element.id == id) {
                            element.price = price;
                            element.quantity= quantity;
                            element.totalamount= totalamount;
                            element.status= status;
                            element.quantityfilled= quantityfilled;
                            element.totalfee= totalfee;
                        }
                    })
                }
            }
        }
    );

    const events = await tradePairsContract.getPastEvents('Executed', {
        fromBlock: latestBlock - 10000,
        toBlock: latestBlock,
    });
    if (events.length) {
        let lastEvent = events.find((event) => {
            let pairName = event.returnValues.pair
                .toLowerCase()
                .replace('0x', '');
            pairName = Buffer.from(pairName, 'hex')
                .toString()
                .replace(/\0/g, '');
            return pairName == tradePair;
        });
        pairPrice = lastEvent.returnValues.price / Math.pow(10, 18);
    }

    console.log('Cancelling All Open Orders if any...');
    let mainOrderIds = mainOpenOrders.map((order) => order.id);
    let secondOrderIds = secondOpenOrders.map((order) => order.id);
    await cancelAll(tradePairs, tradePairId, mainOrderIds, mainWallet);
    await cancelAll(tradePairs, tradePairId, secondOrderIds, secondWallet);

    // Deposit some avax and team4 for both wallets.
    console.log(
        'Depositing 25 AVAX and 100 TEAM4 per wallet into portfolio...'
    );
    await depositToPortfolio(mainWallet, secondWallet, portfolio, baseToken, baseSymbol, decimals);

    // approve token usage
    // await approveTokenUsage(mainWallet, secondWallet, portfolio, baseToken, decimals);
    
    // enter two orders with predefined spread, around mid or last.
    console.log("Waiting for 10 seconds ...");
    await new Promise(resolve => setTimeout(resolve, 10000));

    let spreadPrices = calcSpreadPrices(pairPrice);
    console.log(
        'Adding BUY and SELL orders @: ',
        spreadPrices.lower.toFixed(2),
        ' and ',
        spreadPrices.higher.toFixed(2),
        ' respectively...'
    );
    let lowerPrice = ethers.utils.parseUnits(spreadPrices.lower.toFixed(2), decimals);
    let higherPrice = ethers.utils.parseUnits(spreadPrices.higher.toFixed(2), decimals);

    await addOrderAfterEstimation(tradePairs, tradePairId, mainWallet, lowerPrice, ethers.utils.parseUnits('5', decimals), SignalTypes.BUY);
    await addOrderAfterEstimation(tradePairs, tradePairId, mainWallet, higherPrice, ethers.utils.parseUnits('5', decimals), SignalTypes.SELL);

    console.log("Waiting for 5 seconds ...");
    await new Promise(resolve => setTimeout(resolve, 5000));
    // satisfy first orders
    console.log("Counter orders to trigger executes")
    await satisfyFirstBuy(
        tradePairs,
        tradePairId,
        secondWallet,
        mainOpenOrders,
        decimals
    );
    await satisfyFirstSell(
        tradePairs,
        tradePairId,
        secondWallet,
        mainOpenOrders,
        decimals
    );

    console.log("Waiting for 10 seconds ...");
    await new Promise(resolve => setTimeout(resolve, 10000));
    // console.log(mainOpenOrders.length, secondOpenOrders.length)

    // enter more orders on changing price after 20 secs
    for (let index = 0; index < 6; index++) {
        spreadPrices = calcSpreadPrices(pairPrice);
        lowerPrice = ethers.utils.parseUnits((spreadPrices.lower-10).toFixed(2), decimals);
        higherPrice = ethers.utils.parseUnits((spreadPrices.higher+10).toFixed(2), decimals);

        if (index > 2) {
            let temp = lowerPrice;
            lowerPrice = higherPrice;
            higherPrice = temp;
        }
        let signal = Math.random() > 0.5 ? SignalTypes.BUY : SignalTypes.SELL;
        let signal2 = Math.random() > 0.5 ? SignalTypes.BUY : SignalTypes.SELL;
        await addOrderAfterEstimation(tradePairs, tradePairId, mainWallet, lowerPrice, ethers.utils.parseUnits('1', decimals), signal);
        await addOrderAfterEstimation(tradePairs, tradePairId, mainWallet, higherPrice, ethers.utils.parseUnits('1', decimals), signal2);

        let change = Math.random() > 0.5 ? 1 + Math.random() : 1 - Math.random();
        pairPrice += change;
    }
    // console.log(mainOpenOrders.length, secondOpenOrders.length)

    console.log('Cancelling All Open Orders in 15 Seconds....');
    await new Promise(resolve => setTimeout(resolve, 15000));
    mainOrderIds = mainOpenOrders.map((order) => order.id);
    secondOrderIds = secondOpenOrders.map((order) => order.id);
    await cancelAll(tradePairs, tradePairId, mainOrderIds, mainWallet);
    await cancelAll(tradePairs, tradePairId, secondOrderIds, secondWallet);

    addAfterFill = true;
    console.log("Staying Alive....")
    setInterval(() => {}, 1 << 30);
}

main();
