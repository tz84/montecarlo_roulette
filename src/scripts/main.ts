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
    // edit current and intial bets
    currentBet: number = 0;
    initialBet: number = 0;

    abstract calculateNextBet(outcome: boolean): number;

    placeBet(game: RouletteGame) {
        if (this.currentBet > game.bankroll) {
            //make sure that bet does not exceed bankroll
            this.currentBet = game.bankroll;
        }

        if (this.currentBet > 0) {
            // place the calculated bet 
            game.bankroll += this.currentBet * (game.outcome ? 1 : -1); // win adds and loss subtracts
        }
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

class DalembertStrategy extends BettingStrategy {
    calculateNextBet(outcome: boolean): number {
        if (outcome === false) {
            this.currentBet = this.currentBet + this.initialBet/4;
        // change this to account for case when it is the first round of a simulation
        } else {
            this.currentBet = this.currentBet - this.initialBet/4;
        }
        return this.currentBet;
    }
}

class FibonacciSystemStrategy extends BettingStrategy {
    private fibonacciSequence: number[] = [10, 10];
    private currentIndex: number = 0;

    calculateNextBet(outcome: boolean): number {
        if (outcome === false) {
            this.currentBet = this.getNextFibonacciNumber();

        // change this to account for case when it is the first round of a simulation
        } else {
            this.currentIndex = Math.max(this.currentIndex - 2, 0);
            this.currentBet = this.fibonacciSequence[this.currentIndex];
        }
        return this.currentBet;
    }

    private getNextFibonacciNumber(): number {
        const nextFibonacciNumber = this.fibonacciSequence[this.currentIndex] + this.fibonacciSequence[this.currentIndex + 1];
        this.fibonacciSequence.push(nextFibonacciNumber);
        this.currentIndex++;
        return nextFibonacciNumber;
    }
}

class ParoliSystemStrategy extends BettingStrategy {
    calculateNextBet(outcome: boolean): number {
        // add logic to where if user wins 4 or 5 wins in a row bet automaticlally resets to simulate real player 
        if (outcome === false) {
            this.currentBet = this.initialBet;
        // change this to account for case when it is the first round of a simulation
        } else {
            this.currentBet = this.currentBet * 2;
        }
        return this.currentBet;
    }
}

class OscardsGrindStrategy extends BettingStrategy {

    private oscarunit: number = this.initialBet/10

    calculateNextBet(outcome: boolean): number {
        if (outcome === false) {
            this.currentBet = this.currentBet;
        // change this to account for case when it is the first round of a simulation
        } else {
            this.currentBet = this.currentBet + this.oscarunit;
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
                strategy.initialBet = 0.02 * game.bankroll; // 2% of bankroll
                strategy.currentBet = strategy.initialBet;

                game.playRound();
                strategy.calculateNextBet(game.outcome);
                strategy.placeBet(game);  // Place the bet in the game
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

    searchResults(criteria: (result: number) => boolean): number[] {
        return Object.values(this.simulationResults).filter(criteria);
    }
}

// Instantiate classes and run the program
const game = new RouletteGame();
const simulator = new MonteCarloSimulator();
let selectedStrategy: BettingStrategy;

// Reference to UI elements
const startButton = document.getElementById('start-simulation') as HTMLButtonElement;
const strategySelect = document.getElementById('select-strategy') as HTMLSelectElement;

// Function to instantiate strategy based on selection
function instantiateStrategy(strategyName: string): BettingStrategy {
    switch(strategyName) {
        case 'MartingaleStrategy': return new MartingaleStrategy();
        case 'DalembertStrategy': return new DalembertStrategy();
        case 'FibonacciSystemStrategy': return new FibonacciSystemStrategy();
        case 'ParoliSystemStrategy': return new ParoliSystemStrategy();
        case 'OscardsGrindStrategy': return new OscardsGrindStrategy();
        default: throw new Error('Invalid strategy selected');
    }
}

// Event listeners
startButton.addEventListener('click', () => {
    selectedStrategy = instantiateStrategy(strategySelect.value);
    simulator.runSimulations(selectedStrategy, game);
    const results = simulator.getSimulationResults();
    simulator.calculateAndDisplayStatistics(results);
});

strategySelect.addEventListener('change', () => {
    selectedStrategy = instantiateStrategy(strategySelect.value);
});
