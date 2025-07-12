import { IOutputFormat, IOutputType } from "@runware/sdk-js";
export interface IModel {
  name: string;
  options: {
    model: string;
    CFGScale: number;
    steps: number;
    scheduler: string;
  };
}

// const model = "runware:97@3";
const goodSlowModel: IModel = {
  name: "SDXL",
  options: {
    model: "civitai:101055@128078",
    CFGScale: 7.5,
    steps: 20,
    scheduler: "EulerDiscreteScheduler",
  },
};

const badFastModel: IModel = {
  name: "Flux1.D",
  options: {
    model: "runware:100@1",
    CFGScale: 1,
    steps: 4,
    scheduler: "FlowMatchEulerDiscreteScheduler",
  },
};

export type ModelType = "badFastModel" | "goodSlowModel";
export const models: Record<ModelType, IModel> = {
  badFastModel,
  goodSlowModel,
};

export const defaultOptions = {
  width: 896,
  height: 1152,
  seed:1,
  outputFormat: "WEBP" as IOutputFormat,
  outputQuality: 85,
  includeCost: true,
  outputType: "URL" as IOutputType,
};
