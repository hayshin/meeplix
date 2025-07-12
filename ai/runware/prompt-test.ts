import { createImage } from "./index";
import { ModelType } from "./models";

// const prompt =
//   "A solitary wooden swing set hangs suspended in the middle of a vast, tranquil ocean, the chains disappearing into the deep, dark water below. A single, luminescent jellyfish floats gracefully around one of the swing seats, casting a soft, blue glow. The sky above is a swirl of pastel pinks, purples, and faint greens, with distant, glittering stars just beginning to emerge. The overall mood is one of profound peace and boundless mystery. Dreamlike surrealist painting, with soft, blended brushstrokes and an ethereal quality. Dixit Card Style";

// console.log(image);
const prompt = "A Dixit-style card showing Daenerys Targaryen with her dragons, rendered in a painterly, almost mythical style, with swirling clouds and golden light."

const image = await createImage(prompt, "goodSlowModel");
