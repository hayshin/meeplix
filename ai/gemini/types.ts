import { Schema, Type } from "@google/genai";

export const DixitPromptSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    prompt: {
      type: Type.STRING,
    },
  },
  required: ["prompt"],
};

export const DixitPromptsSchema: Schema = {
  type: Type.ARRAY,
  items: DixitPromptSchema,
  description: "Response containing exactly 84 creative Dixit prompts",
};

export interface DixitPrompt {
  id: number;
  prompt: string;
}
