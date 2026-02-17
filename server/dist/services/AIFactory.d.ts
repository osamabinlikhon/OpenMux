import { AIService, AIProvider } from "./AIService";
export interface AIConfig {
    provider: AIProvider;
    apiKey: string;
    defaultModel?: string;
    baseUrl?: string;
}
export declare function getAIConfig(): AIConfig;
export declare function createAIFromEnv(): AIService | null;
export declare function isAIConfigured(): boolean;
export declare function getAvailableProviders(): AIProvider[];
export { AIService, AIProvider };
//# sourceMappingURL=AIFactory.d.ts.map