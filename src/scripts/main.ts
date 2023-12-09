class RouletteGame {
    bankroll: number = 1000;
    outcome: boolean = false;
    gameResult: number = 0;

    playRound(min: number = 1, max: number = 1) {
        this.gameResult = Math.floor(Math.random() * (max - min)) + min;

        if (this.gameResult > 18) {
            this.outcome = false;
        } else if (this.gameResult < 19) {
            this.outcome = true;
        }
    }
}

abstract class BettingStrategy {
    currentBet: number = 0;
    initialBet: number = 0;

    abstract calculateNextBet(outcome: boolean): number;

    placeBet() {
        // Your betting logic goes here if needed
    }
}

class MartingaleStrategy extends BettingStrategy {
    calculateNextBet(outcome: boolean): number {
        if (outcome === false) {
            this.currentBet = this.currentBet * 2;
        } else {
            this.currentBet = this.initialBet;
        }
        return this.currentBet;
    }
}

class MonteCarloSimulator {
    maxRounds: number = 100;
    numSimulations: number = 1000;
    simulationResults: { [key: number]: number } = {};
    statistics: { [key: string]: number } = {};

    runSimulations(strategy: BettingStrategy, game: RouletteGame) {
        for (let i = 0; i < this.numSimulations; i++) {
            while (game.bankroll > 0 && game.bankroll < 2000) {
                // Assuming Martingale strategy for simplicity
                strategy.initialBet = 0.02 * game.bankroll; // 2% of bankroll
                strategy.currentBet = strategy.initialBet;

                game.playRound();
                strategy.calculateNextBet(game.outcome);
                game.bankroll += game.outcome ? strategy.currentBet : -strategy.currentBet;
            }
            this.simulationResults[i] = game.bankroll;
            game.bankroll = 1000; // Reset bankroll for the next simulation
        }
    }

    getSimulationResults() {
        if (Object.values(this.simulationResults).length === 0) {
            throw new Error("Simulation results not available");
        }
        return Object.values(this.simulationResults);
    }

    calculateAndDisplayStatistics(simulationResults: number[]) {
        const finalBalances = simulationResults;

        if (finalBalances.length == 0) {
            throw new Error("Simulation results not available");
        }

        const sum = finalBalances.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
        const mean = sum / finalBalances.length;

        const squaredDifferences = finalBalances.map((balance) => Math.pow(balance - mean, 2));
        const variance = squaredDifferences.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / finalBalances.length;
        const standardDeviation = Math.sqrt(variance);

        console.log("Mean:", mean);
        console.log("Standard Deviation:", standardDeviation);
    }
}

// Instantiate classes and run the program
const game = new RouletteGame();
const martingaleStrategy = new MartingaleStrategy();
const simulator = new MonteCarloSimulator();

simulator.runSimulations(martingaleStrategy, game);
const simulationResults = simulator.getSimulationResults();
simulator.calculateAndDisplayStatistics(simulationResults);