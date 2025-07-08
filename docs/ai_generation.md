# AI Image Generation workflow
Firstly, let's think about costs and optimization.
In order to generate the cards, we need to consider the following factors:
1. The number of cards to be generated
2. The size of the cards
3. The quality of the cards

## 1. The number of cards to be generated
How much cards should have 1 player? I think we can stick with default 6 cards.
Okay, but in total, we can have up to how many players? If we stick with 8 players, it will be 48 when started, but each round will cost 8 cards. Let's say that maximum players is 6. 6 * 6 = 36 cards. Each round costs 6 cards. Then, I should generate 36 cards before start.
How many rounds can play users? If we do 8 rounds, we need generate 8 * 6 = 48 cards additional. 36 + 48 = 84 cards. It's how much we have in original dixit. Let's stick with this number.

But we need only 36 cards in basic, and we should do so room should wait as little as possible.
For this, then player creates room with predefined topic and theme, we starting generate cards.
We can make start button for case when room is ready, and no players will be joined.
We generate N players * 6 cards, and sending request for client that room is ready to start.
After start, when room will be playing, we are generating cards in background for next rounds. But room that is playing in prioritet compared to new created ones, because they should not experience delays when playing.

## 2. The size of the cards
We need to consider the size of the cards.
Dimension of cards should be as similar as possible to the original dixit cards. It's 3x4 (80 mm x 120mm).
OpenAI DALL-E 3 generates 4x7, 1024x1792. Stability API can generate almost any sizes, i think?

## 3. The quality of the cards
To MVP, we can use just Stability Diffusion XL. It's cheap (on Runware 500 images per 1$), and maybe fast? We should check how fast is generation, but for first time, we will use it.
So, quality in runware for 3x4 is 896x1152. We will stick with FLUX Schnell, it's good enough, cheap, and generate image in 4 steps (vs SD XL 30 steps), so it very fast.

## How to store this shit
Let's use Microsoft Azure, it's S3 compatible storage service. We will use Blob Storage for storing images.

## How to generate prompts
Model RPM Input Output Token limit
Gemini 2.5 Flash Lite	4,000 0.10 0.40 64k
Gemini 2.5 Flash 	1,000 0.30 2.50 65k
Gemini 2.0 Flash 	2,000 0.10 0.40 8k
