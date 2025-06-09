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
    netWorthHistory: number[],
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
    constructor(protected retirementStrategy: RetirementStrategy,
                protected annualIsaContribution: number,
                protected annualPensionContribution: number,
                public portfolioState: PortfolioStateG) {
        super(retirementStrategy, annualIsaContribution, annualPensionContribution, portfolioState);
        this.portfolioState.summary!.success = false;
    }

    progressYear(interest: number): SimulationState {
        return this;
    }
}

class NonRetiredSimulationState extends SimulationState {
    progressYear(interest: number): SimulationState {
        const {
            retired,
            deferredRetirementCounter
        } = this.retirementStrategy.updateRetirementState({...this.portfolioState, interest});

        if (retired) {
            const newlyRetiredState = new RetiredSimulationState(
                this.retirementStrategy,
                this.annualIsaContribution,
                this.annualPensionContribution,
                this.portfolioState);

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
                netWorthHistory: [...this.portfolioState.netWorthHistory, this.portfolioState.isaValue + this.portfolioState.pensionValue],
                isaValue: nextIsaValue,
                pensionValue: nextPensionValue,
                deferredRetirementCounter
            });
    }
}

class RetiredSimulationState extends SimulationState {

    constructor(protected retirementStrategy: RetirementStrategy,
                protected annualIsaContribution: number,
                protected annualPensionContribution: number,
                public portfolioState: PortfolioStateG) {
        super(retirementStrategy, annualIsaContribution, annualPensionContribution, portfolioState);

        this.portfolioState.summary = this.portfolioState.summary ?? {
            retirementAge: this.portfolioState.age,
            isaAtRetirement: this.portfolioState.isaValue,
            pensionAtRetirement: this.portfolioState.pensionValue,
            success: true
        };
    }

    progressYear(interest: number): SimulationState {
        // 2. Retired, but pension is inaccessible, drawdown from ISA
        let {isaValue, pensionValue, annualDrawdown} = this.portfolioState;
        let nextIsaValue, nextPensionValue;

        if (this.portfolioState.age < EARLY_PENSION_AGE) {
            if (isaValue < annualDrawdown) {
                return new FailedSimulationState(
                    this.retirementStrategy,
                    this.annualIsaContribution,
                    this.annualPensionContribution,
                    {
                        ...this.portfolioState,
                        age: this.portfolioState.age + 1,
                        netWorthHistory: [...this.portfolioState.netWorthHistory, 0],
                        summary: {...this.portfolioState.summary!, success: false}
                    });
            }

            nextIsaValue = (isaValue - annualDrawdown) * interest;
            nextPensionValue = pensionValue * interest;

            return new RetiredSimulationState(
                this.retirementStrategy,
                this.annualIsaContribution,
                this.annualPensionContribution,
                {
                    ...this.portfolioState,
                    age: this.portfolioState.age + 1,
                    netWorthHistory: [...this.portfolioState.netWorthHistory, nextIsaValue + nextPensionValue],
                    isaValue: nextIsaValue,
                    pensionValue: nextPensionValue,
                });
        }

        // 4. Retired, but not enough in ISA or pension to cover drawdown, fail
        if ((isaValue + pensionValue) < annualDrawdown) {
            return new FailedSimulationState(
                this.retirementStrategy,
                this.annualIsaContribution,
                this.annualPensionContribution,
                {
                    ...this.portfolioState,
                    age: this.portfolioState.age + 1,
                    netWorthHistory: [...this.portfolioState.netWorthHistory, 0],
                    summary: {...this.portfolioState.summary!, success: false}
                });
        }

        // 3. Retired, pension is accessible, drawdown from both ISA and pension
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
            {
                ...this.portfolioState,
                age: this.portfolioState.age + 1,
                netWorthHistory: [...this.portfolioState.netWorthHistory, nextIsaValue + nextPensionValue],
                isaValue: nextIsaValue,
                pensionValue: nextPensionValue,
            });
    }
}