import { IOutputFormat, IOutputType } from "@runware/sdk-js";
export interface IModel {
  name: string;
  options: {
    model: string;
    CFGScale: number;
    steps: number;
  };
}

// const model = "runware:97@3";
const goodSlowModel: IModel = {
  name: "SDXL",
  options: {
    // model: "civitai:101055@128078", // SD XL 1.0
    model: "civitai:125907@686204", // RealCartoon XL V7
    CFGScale: 7.5,
    steps: 20,
  },
};

const badFastModel: IModel = {
  name: "Flux1.S",
  options: {
    model: "runware:100@1", // Flux1.S
    CFGScale: 1,
    steps: 4,
  },
};

export type ModelType = "badFastModel" | "goodSlowModel";
export const models: Record<ModelType, IModel> = {
  badFastModel,
  goodSlowModel,
};

const negativePrompt = "photo, photorealistic, 3D, CGI, sharp edges, text, watermark, signature, blurry, low detail"
export const defaultOptions = {
  width: 896,
  height: 1152,
  seed:1,
  negativePrompt,
  outputFormat: "WEBP" as IOutputFormat,
  outputQuality: 90,
  scheduler: "Default",
  includeCost: true,
  outputType: "URL" as IOutputType,
};
