import { Strategy } from "./types";
import { PIPOStrategy } from "./strategies/pipo";

// Central registry of all available strategies
const STRATEGY_REGISTRY: Record<string, Strategy> = {};

export function registerStrategy(strategy: Strategy): void {
    STRATEGY_REGISTRY[strategy.id] = strategy;
}

export function getStrategy(id: string): Strategy | null {
    return STRATEGY_REGISTRY[id] || null;
}

export function getAllStrategies(): Strategy[] {
    return Object.values(STRATEGY_REGISTRY);
}

// Register strategies on app initialization
registerStrategy(PIPOStrategy);
