import { EARLY_PENSION_AGE, SAFE_WITHDRAWAL_RATE, STATE_PENSION_AGE } from "./constants";
import { QueryDetails } from "./interfaces";
import { PortfolioState } from "./SimulationRunner";

const safeWithdrawalAmount = (portfolioValue: number): number => {
    return portfolioValue * SAFE_WITHDRAWAL_RATE;
}

export const getRetirementStrategy = (query: QueryDetails): RetirementStrategy => {
    return new BasicRetirementStrategy(query);
}

export interface  RetirementStrategy {
    updateRetirementState: (state: PortfolioState) => PortfolioState;
}

class BasicRetirementStrategy implements RetirementStrategy {
    private readonly targetAge: number
    private readonly targetDrawdown: number
    private readonly deferInCrash: boolean
    private readonly deferUntilSwr: boolean

    constructor({ targetAge, targetDrawdown, deferInCrash, deferUntilSwr }: QueryDetails) {
        this.targetAge = targetAge;
        this.targetDrawdown = targetDrawdown;
        this.deferInCrash = deferInCrash;
        this.deferUntilSwr = deferUntilSwr;
    }

    updateRetirementState = (state: PortfolioState): PortfolioState => {
        if (state.retired) {
            return state;
        }
        if (state.age >= STATE_PENSION_AGE) {
            return { ...state, retired: true };
        }
        if (state.age >= this.targetAge) {
            //TODO: Decorator pattern to handle the different retirement strategies
            if (this.deferInCrash && state.deferredRetirementCounter < 3 && state.interest < 1) {
                return { ...state, deferredRetirementCounter: state.deferredRetirementCounter + 1 }
            }
            if (this.deferUntilSwr && safeWithdrawalAmount(state.isaValue + state.pensionValue) < this.targetDrawdown) {
                return state.deferredRetirementCounter < 3
                    ? { ...state, deferredRetirementCounter: state.deferredRetirementCounter + 1 }
                    : { ...state, retired: true, annualDrawdown: safeWithdrawalAmount(state.isaValue + state.pensionValue)}
            }
            if (state.isaValue >= ((EARLY_PENSION_AGE - state.age) * this.targetDrawdown)) {
                return { ...state, retired: true };
            }
        }

        return state;
    }
}