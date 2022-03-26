var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var axios = require('axios');
var Web3 = require('web3');
var ethers = require('ethers');
var PROVIDER_URL = 'https://node.dexalot-dev.com/ext/bc/C/rpc';
var web3 = new Web3('https://node.dexalot-dev.com/ext/bc/C/rpc');
var erc20FileAbi = require('./erc20abi.json');
var MAIN_WALLET = '0x2E5183fAF2F7809b205019676d5019B617ef5B03';
var SECOND_ADDRESS = '0x853e33fCE5808c8c42647F6f07510c15a66f37e6';
var MAIN_PRIVATE_KEY = 'a3ab64c5deeb8625f9a321e150056cbf49214dd4f38e5ea035eb372b5659d8da';
var SECOND_PRIVATE_KEY = '95eae46b371e9aa770a3537f652dae018aa09f8428f927e83e408a7a03722836';
var MAX_BATCH_SIZE = 20;
var TEAM4_ADDRESS = '0x1dc1bCFE5cF9d40Ab05a33901f164Ba651a823f1';
var API_BASE_URL = 'https://api.dexalot-dev.com/api';
var SPREAD = 2.5;
var DeploymentType;
(function (DeploymentType) {
    DeploymentType["EXCHANGE"] = "Exchange";
    DeploymentType["PORTFOLIO"] = "Portfolio";
    DeploymentType["TRADEPAIRS"] = "TradePairs";
    DeploymentType["ORDERBOOKS"] = "OrderBooks";
})(DeploymentType || (DeploymentType = {}));
var SignalTypes;
(function (SignalTypes) {
    SignalTypes[SignalTypes["BUY"] = 0] = "BUY";
    SignalTypes[SignalTypes["SELL"] = 1] = "SELL";
})(SignalTypes || (SignalTypes = {}));
var exchangeAbi, exchangeAddress, portfolioAbi, portfolioAddress, pairsAbi, pairsAddress, orderbookAbi, orderbookAddress, ourPair, addAfterFill = null;
var latestPrice;
function getAbis() {
    return __awaiter(this, void 0, void 0, function () {
        var abis;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    abis = [];
                    abis.push(axios
                        .get("".concat(API_BASE_URL, "/trading/deploymentabi/").concat(DeploymentType.EXCHANGE))
                        .then(function (res) {
                        exchangeAbi = res.data.abi.abi;
                        exchangeAddress = res.data.address;
                    })["catch"](function (err) {
                        console.log('Error excahnge abi: ', err.message);
                    }));
                    abis.push(axios
                        .get("".concat(API_BASE_URL, "/trading/deploymentabi/").concat(DeploymentType.PORTFOLIO))
                        .then(function (res) {
                        portfolioAbi = res.data.abi.abi;
                        portfolioAddress = res.data.address;
                    })["catch"](function (err) {
                        console.log('Error portfolio abi: ', err.message);
                    }));
                    abis.push(axios
                        .get("".concat(API_BASE_URL, "/trading/deploymentabi/").concat(DeploymentType.ORDERBOOKS))
                        .then(function (res) {
                        orderbookAbi = res.data.abi.abi;
                        orderbookAddress = res.data.address;
                    })["catch"](function (err) {
                        console.log('Error orderbooks abi: ', err.message);
                    }));
                    abis.push(axios
                        .get("".concat(API_BASE_URL, "/trading/deploymentabi/").concat(DeploymentType.TRADEPAIRS))
                        .then(function (res) {
                        pairsAbi = res.data.abi.abi;
                        pairsAddress = res.data.address;
                    })["catch"](function (err) {
                        console.log('Error pairs abi: ', err.message);
                    }));
                    return [4 /*yield*/, Promise.all(abis)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function cancelAll(tradePair, tradePairId, orders, wallet) {
    return __awaiter(this, void 0, void 0, function () {
        var batch, tx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!orders.length) {
                        return [2 /*return*/];
                    }
                    batch = orders.splice(0, Math.min(MAX_BATCH_SIZE, orders.length));
                    console.log('cancelling batch with', batch.length);
                    return [4 /*yield*/, tradePair
                            .connect(wallet)
                            .cancelAllOrders(tradePairId, batch)];
                case 1:
                    tx = _a.sent();
                    return [4 /*yield*/, tx.wait()];
                case 2:
                    _a.sent();
                    if (orders.length) {
                        cancelAll(tradePair, tradePairId, orders, wallet);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function getOpenOrders(tradePairId, walletAddress) {
    return __awaiter(this, void 0, void 0, function () {
        var orders;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    orders = [];
                    return [4 /*yield*/, axios
                            .get("".concat(API_BASE_URL, "/trading/openorders/params"), {
                            params: {
                                traderaddress: walletAddress,
                                pair: tradePairId
                            }
                        })
                            .then(function (res) {
                            orders = res.data.rows;
                        })["catch"](function (err) {
                            console.log('Error getting orders: ', err.message);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, orders];
            }
        });
    });
}
function getPairs() {
    return __awaiter(this, void 0, void 0, function () {
        var pairs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pairs = [];
                    return [4 /*yield*/, axios
                            .get("".concat(API_BASE_URL, "/trading/pairs"))
                            .then(function (res) {
                            pairs = res.data;
                        })["catch"](function (err) {
                            console.log('Error GETTING PAIRS: ', err.message);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, pairs];
            }
        });
    });
}
function getGasOfOrder() {
    return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/];
    }); });
}
function printOrders(orders, address) {
    console.log('For this wallet ', address, ' you have ', orders.length, ' open orders');
    if (orders.length) {
        console.log(orders);
    }
}
function calcSpreadPrices(midOrLastPrice) {
    return {
        lower: (midOrLastPrice * (100 - SPREAD)) / 100,
        higher: (midOrLastPrice * (100 + SPREAD)) / 100
    };
}
function depositToPortfolio(mainWallet, secondWallet, portfolio, baseToken, baseSymbol, decimals) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, mainWallet.sendTransaction({
                        from: mainWallet.address,
                        to: portfolio.address,
                        value: ethers.utils.parseEther('25')
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, secondWallet.sendTransaction({
                            from: secondWallet.address,
                            to: portfolio.address,
                            value: ethers.utils.parseEther('25')
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, baseToken
                            .connect(mainWallet)
                            .approve(portfolio.address, ethers.utils.parseUnits('100', decimals))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, baseToken
                            .connect(secondWallet)
                            .approve(portfolio.address, ethers.utils.parseUnits('100', decimals))];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, portfolio
                            .connect(mainWallet)
                            .depositToken(mainWallet.address, baseSymbol, ethers.utils.parseUnits('100', decimals))];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, portfolio
                            .connect(secondWallet)
                            .depositToken(secondWallet.address, baseSymbol, ethers.utils.parseUnits('100', decimals))];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function approveTokenUsage(mainWallet, secondWallet, portfolio, baseToken, decimals) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, baseToken
                        .connect(mainWallet)
                        .approve(portfolio.address, ethers.utils.parseUnits('500', decimals))];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, baseToken
                            .connect(secondWallet)
                            .approve(portfolio.address, ethers.utils.parseUnits('500', decimals))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function satisfyFirstBuy(tradePairs, tradePairId, secondWallet, orders, decimals) {
    return __awaiter(this, void 0, void 0, function () {
        var firstBuy, price, quantity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    firstBuy = orders.find(function (order) { return order.side === SignalTypes.BUY; });
                    if (!(firstBuy && firstBuy.status < 3)) return [3 /*break*/, 2];
                    price = typeof (firstBuy.price) !== 'string' ? firstBuy.price : ethers.utils.parseUnits(firstBuy.price, decimals);
                    quantity = typeof (firstBuy.quantity) !== 'string' ? firstBuy.quantity : ethers.utils.parseUnits(firstBuy.quantity, decimals);
                    return [4 /*yield*/, addOrderAfterEstimation(tradePairs, tradePairId, secondWallet, price, quantity, SignalTypes.SELL)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function satisfyFirstSell(tradePairs, tradePairId, secondWallet, orders, decimals) {
    return __awaiter(this, void 0, void 0, function () {
        var firstSell, price, quantity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    firstSell = orders.find(function (order) { return order.side === SignalTypes.SELL; });
                    if (!(firstSell && firstSell.status < 3)) return [3 /*break*/, 2];
                    price = typeof (firstSell.price) !== 'string' ? firstSell.price : ethers.utils.parseUnits(firstSell.price, decimals);
                    quantity = typeof (firstSell.quantity) !== 'string' ? firstSell.quantity : ethers.utils.parseUnits(firstSell.quantity, decimals);
                    return [4 /*yield*/, addOrderAfterEstimation(tradePairs, tradePairId, secondWallet, price, quantity, SignalTypes.BUY)];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function addOrderAfterEstimation(tradePairs, tradePairId, wallet, price, quantity, side) {
    return __awaiter(this, void 0, void 0, function () {
        var estimateGas, trx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, tradePairs
                        .connect(wallet).estimateGas
                        .addOrder(tradePairId, price, quantity, side, 1)];
                case 1:
                    estimateGas = _a.sent();
                    console.log("Estimated Gas:", estimateGas.toString());
                    return [4 /*yield*/, tradePairs
                            .connect(wallet)
                            .addOrder(tradePairId, price, quantity, side, 1)];
                case 2:
                    trx = _a.sent();
                    return [4 /*yield*/, trx.wait()];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var pairs, tradePair, tradePairId, baseSymbol, decimals, customProvider, mainWallet, secondWallet, mainOpenOrders, secondOpenOrders, portfolio, tradePairs, tradePairsContract, baseToken, pairPrice, latestBlock, events, lastEvent, mainOrderIds, secondOrderIds, spreadPrices, lowerPrice, higherPrice, index, temp, signal, signal2, change;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, getAbis()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, getPairs()];
                case 2:
                    pairs = _a.sent();
                    tradePair = "TEAM4/AVAX";
                    tradePairId = ethers.utils.formatBytes32String(tradePair);
                    ourPair = pairs.find(function (pair) { return pair.pair === tradePair; });
                    if (!exchangeAbi ||
                        !orderbookAbi ||
                        !portfolioAbi ||
                        !pairsAbi ||
                        !ourPair) {
                        console.log('Failed to get contract addresses and ABIs.. exiting');
                        return [2 /*return*/];
                    }
                    // print abi notifications
                    console.log('Successfully retreived contract ABIs from API');
                    baseSymbol = ethers.utils.formatBytes32String('TEAM4');
                    decimals = 18;
                    customProvider = new ethers.providers.JsonRpcProvider(PROVIDER_URL);
                    mainWallet = new ethers.Wallet(MAIN_PRIVATE_KEY, customProvider);
                    secondWallet = new ethers.Wallet(SECOND_PRIVATE_KEY, customProvider);
                    return [4 /*yield*/, getOpenOrders(tradePair, mainWallet.address)];
                case 3:
                    mainOpenOrders = _a.sent();
                    return [4 /*yield*/, getOpenOrders(tradePair, secondWallet.address)];
                case 4:
                    secondOpenOrders = _a.sent();
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
                    portfolio = new ethers.Contract(portfolioAddress, portfolioAbi, mainWallet);
                    tradePairs = new ethers.Contract(pairsAddress, pairsAbi, mainWallet);
                    tradePairsContract = new web3.eth.Contract(pairsAbi, pairsAddress);
                    baseToken = new ethers.Contract(TEAM4_ADDRESS, erc20FileAbi, mainWallet);
                    pairPrice = 0;
                    return [4 /*yield*/, customProvider.getBlockNumber()];
                case 5:
                    latestBlock = _a.sent();
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
                    tradePairs.on('OrderStatusChanged', function (traderaddress, pair, id, price, totalamount, quantity, side, type1, status, quantityfilled, totalfee) {
                        if (pair != tradePairId) {
                            return;
                        }
                        if (status >= 3 && status <= 6) {
                            console.log(status === 3 ? 'OrderStatusChanged filled' : 'OrderStatusChanged cancelled', id);
                            if (status === 3) {
                                console.log(traderaddress, id, price, totalamount, quantity, quantityfilled, totalfee);
                                latestPrice = price;
                            }
                            var orderPrice_1 = typeof (price) !== 'string' ? price : ethers.utils.parseUnits(price, decimals);
                            var quant_1 = ethers.utils.parseUnits('2', decimals);
                            var signal_1 = side ? SignalTypes.BUY : SignalTypes.SELL;
                            if (traderaddress == mainWallet.address) {
                                mainOpenOrders = mainOpenOrders.filter(function (order) { return order.id !== id; });
                                setTimeout(function () {
                                    status === 3 && addAfterFill ? addOrderAfterEstimation(tradePairs, tradePairId, mainWallet, orderPrice_1, quant_1, signal_1) : false;
                                }, 5000);
                            }
                            else if (traderaddress == secondWallet.address) {
                                secondOpenOrders = secondOpenOrders.filter(function (order) { return order.id !== id; });
                                setTimeout(function () {
                                    status === 3 && addAfterFill ? addOrderAfterEstimation(tradePairs, tradePairId, secondWallet, orderPrice_1, quant_1, signal_1) : false;
                                }, 5000);
                            }
                        }
                        else if (status == 0) {
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
                                    totalfee: totalfee
                                });
                            }
                            else if (traderaddress == secondWallet.address) {
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
                                    totalfee: totalfee
                                });
                            }
                        }
                        else if (status == 2) {
                            console.log('OrderStatusChanged partially filled', id);
                            latestPrice = price;
                            if (traderaddress == mainWallet.address) {
                                mainOpenOrders.forEach(function (element) {
                                    if (element.id == id) {
                                        element.price = price;
                                        element.quantity = quantity;
                                        element.totalamount = totalamount;
                                        element.status = status;
                                        element.quantityfilled = quantityfilled;
                                        element.totalfee = totalfee;
                                    }
                                });
                            }
                            else if (traderaddress == secondWallet.address) {
                                mainOpenOrders.forEach(function (element) {
                                    if (element.id == id) {
                                        element.price = price;
                                        element.quantity = quantity;
                                        element.totalamount = totalamount;
                                        element.status = status;
                                        element.quantityfilled = quantityfilled;
                                        element.totalfee = totalfee;
                                    }
                                });
                            }
                        }
                    });
                    return [4 /*yield*/, tradePairsContract.getPastEvents('Executed', {
                            fromBlock: latestBlock - 1000,
                            toBlock: latestBlock
                        })];
                case 6:
                    events = _a.sent();
                    if (events.length) {
                        lastEvent = events.find(function (event) {
                            var pairName = event.returnValues.pair
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
                    mainOrderIds = mainOpenOrders.map(function (order) { return order.id; });
                    secondOrderIds = secondOpenOrders.map(function (order) { return order.id; });
                    return [4 /*yield*/, cancelAll(tradePairs, tradePairId, mainOrderIds, mainWallet)];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, cancelAll(tradePairs, tradePairId, secondOrderIds, secondWallet)];
                case 8:
                    _a.sent();
                    // // Deposit some avax and team4 for both wallets.
                    // console.log(
                    //     'Depositing 25 AVAX and 100 TEAM4 per wallet into portfolio...'
                    // );
                    // await depositToPortfolio(mainWallet, secondWallet, portfolio, baseToken, baseSymbol, decimals);
                    // approve token usage
                    // await approveTokenUsage(mainWallet, secondWallet, portfolio, baseToken, decimals);
                    // enter two orders with predefined spread, around mid or last.
                    // console.log(pairPrice);
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                case 9:
                    // // Deposit some avax and team4 for both wallets.
                    // console.log(
                    //     'Depositing 25 AVAX and 100 TEAM4 per wallet into portfolio...'
                    // );
                    // await depositToPortfolio(mainWallet, secondWallet, portfolio, baseToken, baseSymbol, decimals);
                    // approve token usage
                    // await approveTokenUsage(mainWallet, secondWallet, portfolio, baseToken, decimals);
                    // enter two orders with predefined spread, around mid or last.
                    // console.log(pairPrice);
                    _a.sent();
                    spreadPrices = calcSpreadPrices(pairPrice);
                    console.log('Adding BUY and SELL orders @: ', spreadPrices.lower.toFixed(2), ' and ', spreadPrices.higher.toFixed(2), ' respectively...');
                    lowerPrice = ethers.utils.parseUnits(spreadPrices.lower.toFixed(2), decimals);
                    higherPrice = ethers.utils.parseUnits(spreadPrices.higher.toFixed(2), decimals);
                    return [4 /*yield*/, addOrderAfterEstimation(tradePairs, tradePairId, mainWallet, lowerPrice, ethers.utils.parseUnits('5', decimals), SignalTypes.BUY)];
                case 10:
                    _a.sent();
                    return [4 /*yield*/, addOrderAfterEstimation(tradePairs, tradePairId, mainWallet, higherPrice, ethers.utils.parseUnits('5', decimals), SignalTypes.SELL)];
                case 11:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                case 12:
                    _a.sent();
                    // satisfy first orders
                    console.log("Counter orders to trigger executes");
                    return [4 /*yield*/, satisfyFirstBuy(tradePairs, tradePairId, secondWallet, mainOpenOrders, decimals)];
                case 13:
                    _a.sent();
                    return [4 /*yield*/, satisfyFirstSell(tradePairs, tradePairId, secondWallet, mainOpenOrders, decimals)];
                case 14:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                case 15:
                    _a.sent();
                    console.log(mainOpenOrders.length, secondOpenOrders.length);
                    index = 0;
                    _a.label = 16;
                case 16:
                    if (!(index < 6)) return [3 /*break*/, 20];
                    spreadPrices = calcSpreadPrices(pairPrice);
                    lowerPrice = ethers.utils.parseUnits((spreadPrices.lower - 10).toFixed(2), decimals);
                    higherPrice = ethers.utils.parseUnits((spreadPrices.higher + 10).toFixed(2), decimals);
                    if (index > 2) {
                        temp = lowerPrice;
                        lowerPrice = higherPrice;
                        higherPrice = temp;
                    }
                    signal = Math.random() > 0.5 ? SignalTypes.BUY : SignalTypes.SELL;
                    signal2 = Math.random() > 0.5 ? SignalTypes.BUY : SignalTypes.SELL;
                    return [4 /*yield*/, addOrderAfterEstimation(tradePairs, tradePairId, mainWallet, lowerPrice, ethers.utils.parseUnits('1', decimals), signal)];
                case 17:
                    _a.sent();
                    return [4 /*yield*/, addOrderAfterEstimation(tradePairs, tradePairId, mainWallet, higherPrice, ethers.utils.parseUnits('1', decimals), signal2)];
                case 18:
                    _a.sent();
                    change = Math.random() > 0.5 ? 1 + Math.random() : 1 - Math.random();
                    pairPrice += change;
                    _a.label = 19;
                case 19:
                    index++;
                    return [3 /*break*/, 16];
                case 20: return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                case 21:
                    _a.sent();
                    console.log(mainOpenOrders.length, secondOpenOrders.length);
                    console.log('Cancelling All Open Orders in 15 Seconds....');
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 15000); })];
                case 22:
                    _a.sent();
                    mainOrderIds = mainOpenOrders.map(function (order) { return order.id; });
                    secondOrderIds = secondOpenOrders.map(function (order) { return order.id; });
                    return [4 /*yield*/, cancelAll(tradePairs, tradePairId, mainOrderIds, mainWallet)];
                case 23:
                    _a.sent();
                    return [4 /*yield*/, cancelAll(tradePairs, tradePairId, secondOrderIds, secondWallet)];
                case 24:
                    _a.sent();
                    addAfterFill = true;
                    setInterval(function () { }, 1 << 30);
                    return [2 /*return*/];
            }
        });
    });
}
main();
