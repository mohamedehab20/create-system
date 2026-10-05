export type AssistantRequest = {
  companyId: string;
  userId: string;
  intent: string;
};

export type AssistantPort = {
  suggest(input: AssistantRequest): Promise<{ text: string } | null>;
};

export const assistant: AssistantPort = {
  async suggest() {
    return null;
  },
};
