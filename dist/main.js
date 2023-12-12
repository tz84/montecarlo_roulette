"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var _a = require('electron'), app = _a.app, BrowserWindow = _a.BrowserWindow;
//electron js window and startup logic 
var createWindow = function () {
    var win = new BrowserWindow({
        width: 800,
        height: 800
    });
    win.loadFile('index.html');
};
app.whenReady().then(function () {
    createWindow();
});
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin')
        app.quit();
});
app.whenReady().then(function () {
    createWindow();
    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
var RouletteGame = /** @class */ (function () {
    function RouletteGame() {
        this.bankroll = 1000;
        this.outcome = false;
        this.gameResult = 0;
    }
    RouletteGame.prototype.playRound = function (min, max) {
        if (min === void 0) { min = 1; }
        if (max === void 0) { max = 1; }
        this.gameResult = Math.floor(Math.random() * (max - min)) + min;
        if (this.gameResult > 18) {
            this.outcome = false;
        }
        else if (this.gameResult < 19) {
            this.outcome = true;
        }
    };
    return RouletteGame;
}());
var BettingStrategy = /** @class */ (function () {
    function BettingStrategy() {
        // edit current and intial bets
        this.currentBet = 0;
        this.initialBet = 0;
    }
    BettingStrategy.prototype.placeBet = function (game) {
        if (this.currentBet > game.bankroll) {
            //make sure that bet does not exceed bankroll
            this.currentBet = game.bankroll;
        }
        if (this.currentBet > 0) {
            // place the calculated bet 
            game.bankroll += this.currentBet * (game.outcome ? 1 : -1); // win adds and loss subtracts
        }
    };
    return BettingStrategy;
}());
var MartingaleStrategy = /** @class */ (function (_super) {
    __extends(MartingaleStrategy, _super);
    function MartingaleStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MartingaleStrategy.prototype.calculateNextBet = function (outcome) {
        if (outcome === false) {
            this.currentBet = this.currentBet * 2;
        }
        else {
            this.currentBet = this.initialBet;
        }
        return this.currentBet;
    };
    return MartingaleStrategy;
}(BettingStrategy));
var DalembertStrategy = /** @class */ (function (_super) {
    __extends(DalembertStrategy, _super);
    function DalembertStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DalembertStrategy.prototype.calculateNextBet = function (outcome) {
        if (outcome === false) {
            this.currentBet = this.currentBet + this.initialBet / 4;
            // change this to account for case when it is the first round of a simulation
        }
        else {
            this.currentBet = this.currentBet - this.initialBet / 4;
        }
        return this.currentBet;
    };
    return DalembertStrategy;
}(BettingStrategy));
var FibonacciSystemStrategy = /** @class */ (function (_super) {
    __extends(FibonacciSystemStrategy, _super);
    function FibonacciSystemStrategy() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.fibonacciSequence = [10, 10];
        _this.currentIndex = 0;
        return _this;
    }
    FibonacciSystemStrategy.prototype.calculateNextBet = function (outcome) {
        if (outcome === false) {
            this.currentBet = this.getNextFibonacciNumber();
            // change this to account for case when it is the first round of a simulation
        }
        else {
            this.currentIndex = Math.max(this.currentIndex - 2, 0);
            this.currentBet = this.fibonacciSequence[this.currentIndex];
        }
        return this.currentBet;
    };
    FibonacciSystemStrategy.prototype.getNextFibonacciNumber = function () {
        var nextFibonacciNumber = this.fibonacciSequence[this.currentIndex] + this.fibonacciSequence[this.currentIndex + 1];
        this.fibonacciSequence.push(nextFibonacciNumber);
        this.currentIndex++;
        return nextFibonacciNumber;
    };
    return FibonacciSystemStrategy;
}(BettingStrategy));
var ParoliSystemStrategy = /** @class */ (function (_super) {
    __extends(ParoliSystemStrategy, _super);
    function ParoliSystemStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ParoliSystemStrategy.prototype.calculateNextBet = function (outcome) {
        // add logic to where if user wins 4 or 5 wins in a row bet automaticlally resets to simulate real player 
        if (outcome === false) {
            this.currentBet = this.initialBet;
            // change this to account for case when it is the first round of a simulation
        }
        else {
            this.currentBet = this.currentBet * 2;
        }
        return this.currentBet;
    };
    return ParoliSystemStrategy;
}(BettingStrategy));
var OscardsGrindStrategy = /** @class */ (function (_super) {
    __extends(OscardsGrindStrategy, _super);
    function OscardsGrindStrategy() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.oscarunit = _this.initialBet / 10;
        return _this;
    }
    OscardsGrindStrategy.prototype.calculateNextBet = function (outcome) {
        if (outcome === false) {
            this.currentBet = this.currentBet;
            // change this to account for case when it is the first round of a simulation
        }
        else {
            this.currentBet = this.currentBet + this.oscarunit;
        }
        return this.currentBet;
    };
    return OscardsGrindStrategy;
}(BettingStrategy));
var MonteCarloSimulator = /** @class */ (function () {
    function MonteCarloSimulator() {
        this.maxRounds = 100;
        this.numSimulations = 1000;
        this.simulationResults = {};
        this.statistics = {};
    }
    MonteCarloSimulator.prototype.runSimulations = function (strategy, game) {
        for (var i = 0; i < this.numSimulations; i++) {
            while (game.bankroll > 0 && game.bankroll < 2000) {
                strategy.initialBet = 0.02 * game.bankroll; // 2% of bankroll
                strategy.currentBet = strategy.initialBet;
                game.playRound();
                strategy.calculateNextBet(game.outcome);
                strategy.placeBet(game); // Place the bet in the game
            }
            this.simulationResults[i] = game.bankroll;
            game.bankroll = 1000; // Reset bankroll for the next simulation
        }
    };
    MonteCarloSimulator.prototype.getSimulationResults = function () {
        if (Object.values(this.simulationResults).length === 0) {
            throw new Error("Simulation results not available");
        }
        return Object.values(this.simulationResults);
    };
    MonteCarloSimulator.prototype.calculateAndDisplayStatistics = function (simulationResults) {
        var finalBalances = simulationResults;
        if (finalBalances.length == 0) {
            throw new Error("Simulation results not available");
        }
        var sum = finalBalances.reduce(function (accumulator, currentValue) { return accumulator + currentValue; }, 0);
        var mean = sum / finalBalances.length;
        var squaredDifferences = finalBalances.map(function (balance) { return Math.pow(balance - mean, 2); });
        var variance = squaredDifferences.reduce(function (accumulator, currentValue) { return accumulator + currentValue; }, 0) / finalBalances.length;
        var standardDeviation = Math.sqrt(variance);
        console.log("Mean:", mean);
        console.log("Standard Deviation:", standardDeviation);
    };
    MonteCarloSimulator.prototype.searchResults = function (criteria) {
        return Object.values(this.simulationResults).filter(criteria);
    };
    return MonteCarloSimulator;
}());
// Instantiate classes and run the program
var game = new RouletteGame();
var simulator = new MonteCarloSimulator();
var selectedStrategy;
// Reference to UI elements
var startButton = document.getElementById('start-simulation');
var strategySelect = document.getElementById('select-strategy');
// Function to instantiate strategy based on selection
function instantiateStrategy(strategyName) {
    switch (strategyName) {
        case 'MartingaleStrategy': return new MartingaleStrategy();
        case 'DalembertStrategy': return new DalembertStrategy();
        case 'FibonacciSystemStrategy': return new FibonacciSystemStrategy();
        case 'ParoliSystemStrategy': return new ParoliSystemStrategy();
        case 'OscardsGrindStrategy': return new OscardsGrindStrategy();
        default: throw new Error('Invalid strategy selected');
    }
}
// Event listeners
startButton.addEventListener('click', function () {
    selectedStrategy = instantiateStrategy(strategySelect.value);
    simulator.runSimulations(selectedStrategy, game);
    var results = simulator.getSimulationResults();
    simulator.calculateAndDisplayStatistics(results);
});
strategySelect.addEventListener('change', function () {
    selectedStrategy = instantiateStrategy(strategySelect.value);
});
// Function to show  loading screen
function showLoadingScreen() {
    var loadingScreen = document.getElementById('loading-screen');
    var loadingBar = document.getElementById('loading-bar');
    loadingScreen.classList.remove('hidden');
    loadingBar.classList.add('animated');
}
// Function to hide loading screen
function hideLoadingScreen() {
    var loadingScreen = document.getElementById('loading-screen');
    var loadingBar = document.getElementById('loading-bar');
    loadingScreen.classList.add('hidden');
    loadingBar.classList.remove('animated');
}
startButton.addEventListener('click', function () {
    selectedStrategy = instantiateStrategy(strategySelect.value);
    showLoadingScreen();
    setTimeout(function () {
        simulator.runSimulations(selectedStrategy, game);
        var results = simulator.getSimulationResults();
        simulator.calculateAndDisplayStatistics(results);
        hideLoadingScreen();
    }, 0);
});
