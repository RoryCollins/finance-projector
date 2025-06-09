import {RetirementStrategy} from "./RetirementStrategy";
import {EARLY_PENSION_AGE} from "./constants";

interface PortfolioStateG {
    age: number,
    isaValue: number,
    pensionValue: number,
    deferredRetirementCounter: number,
    annualDrawdown: number,
    retired: boolean, //TODO: should this be removed?
    targetAge: number, // TODO: should this be removed?
    summary?: Summary,
}

interface Summary {
    retirementAge: number;
    isaAtRetirement: number;
    pensionAtRetirement: number;
    success: boolean;
}

export function getInitialSimulationState(retirementStrategy: RetirementStrategy,
                                          annualIsaContribution: number,
                                          annualPensionContribution: number,
                                          portfolioState: PortfolioStateG): SimulationState {
    return new NonRetiredSimulationState(
        retirementStrategy,
        annualIsaContribution,
        annualPensionContribution,
        portfolioState
    )

}

export abstract class SimulationState {
    constructor(
        protected retirementStrategy: RetirementStrategy,
        protected annualIsaContribution: number,
        protected annualPensionContribution: number,
        public portfolioState: PortfolioStateG) {
    }

    abstract progressYear(interest: number): SimulationState;
}

class FailedSimulationState extends SimulationState {
    // 5. Failed, no progression.
    progressYear(interest: number): SimulationState {
        return this;
    }
}

class NonRetiredSimulationState extends SimulationState {
    // 1. Not retired, check retirementStrategy and continue contributing
    progressYear(interest: number): SimulationState {
        let {retired, deferredRetirementCounter} = this.retirementStrategy.updateRetirementState({...this.portfolioState, interest });

        if (retired) {
            var newlyRetiredState = new RetiredSimulationState(
                this.retirementStrategy,
                this.annualIsaContribution,
                this.annualPensionContribution,
                {
                    ...this.portfolioState,
                    summary: {
                        retirementAge: this.portfolioState.age,
                        isaAtRetirement: this.portfolioState.isaValue,
                        pensionAtRetirement: this.portfolioState.pensionValue,
                        success: true,
                    }
                });
            return newlyRetiredState.progressYear(interest);
        }

        let nextIsaValue = (this.portfolioState.isaValue + this.annualIsaContribution) * interest;
        let nextPensionValue = (this.portfolioState.pensionValue + this.annualPensionContribution) * interest;

        return new NonRetiredSimulationState(
            this.retirementStrategy,
            this.annualIsaContribution,
            this.annualPensionContribution,
            {
                ...this.portfolioState,
                age: this.portfolioState.age + 1,
                isaValue: nextIsaValue,
                pensionValue: nextPensionValue,
                deferredRetirementCounter
            });
    }
}

class RetiredSimulationState extends SimulationState {

    progressYear(interest: number): SimulationState {
        // 2. Retired, but not old enough for pension, drawdown from ISA
        let {isaValue, pensionValue, annualDrawdown} = this.portfolioState;
        let nextIsaValue, nextPensionValue;

        if (this.portfolioState.age < EARLY_PENSION_AGE) {
            if (isaValue < annualDrawdown) {
                return new FailedSimulationState(
                    this.retirementStrategy,
                    this.annualIsaContribution,
                    this.annualPensionContribution,
                    this.portfolioState);
            }

            nextIsaValue = (isaValue - annualDrawdown) * interest;
            nextPensionValue = pensionValue * interest;

            return new RetiredSimulationState(
                this.retirementStrategy,
                this.annualIsaContribution,
                this.annualPensionContribution,
                {...this.portfolioState,
                    age: this.portfolioState.age + 1,
                    isaValue: nextIsaValue,
                    pensionValue: nextPensionValue,
                });
        }

        // 4. Retired, but not enough in ISA or pension to cover drawdown, fail
        if ((isaValue + pensionValue) < annualDrawdown){
            return new FailedSimulationState(
                this.retirementStrategy,
                this.annualIsaContribution,
                this.annualPensionContribution,
                this.portfolioState);
        }

        // 3. Retired, old enough for pension, drawdown from both ISA and pension
        if (pensionValue < annualDrawdown) {
            let remainder = annualDrawdown - pensionValue;
            nextPensionValue = 0;
            nextIsaValue = (isaValue - remainder) * interest;
        } else {
            nextPensionValue = (pensionValue - annualDrawdown) * interest;
            nextIsaValue = isaValue * interest;
        }
        return new RetiredSimulationState(
            this.retirementStrategy,
            this.annualIsaContribution,
            this.annualPensionContribution,
            {...this.portfolioState,
                age: this.portfolioState.age + 1,
                isaValue: nextIsaValue,
                pensionValue: nextPensionValue,
            });
    }
}