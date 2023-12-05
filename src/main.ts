class RouletteGame {

    bankroll: number = 1000;
    // round outcome where true = win and false = lose 
    outcome: boolean = false;
    gameResult: number = 0;

    // min = 1 and max = 38 (chance of winning on color = 18/38)
    playRound(min: number = 1, max: number = 1) {
        
        this.gameResult = Math.floor(Math.random() * (max - min)) + min;

        if (this.gameResult > 18) {
            this.outcome = false 
        }
        else if(this.gameResult < 19) {
            this.outcome = true 
        }

    }
}

abstract class BettingStrategy {

        // make initial bet a percentage of the bankroll (2-3%)
        currentBet: number  
        initialBet: number 

        abstract calculateNextBet(outcome: boolean): number 

        placeBet() {

        }
}

class MartingaleStrategy extends BettingStrategy {

  calculateNextBet(outcome:boolean):number {
    if (outcome === false) {
      this.currentBet = this.currentBet * 2;
  } else {
      this.currentBet = this.initialBet;
  }
  return this.currentBet;
  }
}

class MonteCarloSimulator {

    bankRoll: number = 10000
    maxRounds: number = 100 
    numSimulations: number = 1000

    simulationResults: {[key: number]: number} = {}

    // stores final mean an avergae dsitributoin values 
    statistics: {[key: string]: number} = {}

    runSimulations(strategy: BettingStrategy, game: RouletteGame) {
    // must store final balances and update simulation results 
    }

    getSimulationResults() {
        // returns array of final balances 
    }

    calculateAndDisplayStatistics() {
        //needs values of all final balances in the parameters 

        const finalBalances = Object.values(this.simulationResults)

        if (finalBalances.length == 0) {
            throw new Error("Simulation results not availbe ")
        }
        
        // calculate the mean 
        const sum = finalBalances.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
        const mean = sum / finalBalances.length

        //calculate the standard deviation 
        const squaredDifferences = finalBalances.map((balance) => Math.pow(balance - mean, 2));
        const variance = squaredDifferences.reduce((accumulator, currentValue) => accumulator + currentValue, 0) / finalBalances.length;
        const standardDeviation = Math.sqrt(variance);

        //display (later replace with frontend dislay )
        console.log("Mean:", mean);
        console.log("Standard Deviation:", standardDeviation);
    }
}

// class instantiations 
// program run 