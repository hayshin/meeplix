# Dixit Prompt Generator

This workflow uses Gemini AI to generate creative prompts for Dixit boardgame image generation with **guaranteed structured output** using `responseSchema`.

## Setup

1. **Set up Gemini API Key**: Make sure you have `GEMINI_API_KEY` environment variable set with your Google AI API key.

```bash
export GEMINI_API_KEY="your-api-key-here"
```

2. **Install dependencies**: The required dependencies should already be installed in the root package.json.

## Usage

### Option 1: Interactive Version

Use the interactive version that prompts you for input:

```bash
bun run ai/dixit-prompt-generator.ts
```

This will:
1. Ask you to enter a topic
2. Generate 84 Dixit prompts based on that topic
3. Display all prompts in the console with descriptions

### Option 2: Command Line Argument Version

Use the simple version with command line arguments:

```bash
bun run ai/dixit-prompt-generator-simple.ts "nature"
```

Replace "nature" with your desired topic.

### Option 3: Using NPM Script

You can also use the npm script (modify package.json as needed):

```bash
npm run dixit-prompts
```

## Key Features

- ✅ **Structured Response Schema**: Uses Gemini's `responseSchema` to guarantee JSON format
- ✅ **Type Safety**: Fully typed with TypeScript interfaces
- ✅ **Guaranteed Format**: No more parsing errors or malformed responses
- ✅ **Interactive Console Input**: Get topic from user input
- ✅ **Command Line Support**: Simple usage with arguments
- ✅ **84 Unique Prompts**: Generates exactly 84 prompts as requested
- ✅ **Dixit-Style Creativity**: Prompts are surreal, dreamlike, and evocative
- ✅ **Error Handling**: Proper error handling and validation
- ✅ **Response Validation**: Ensures exactly 84 prompts are generated

## responseSchema Benefits

This implementation uses Gemini's `responseSchema` feature which provides:

1. **Guaranteed Structure**: The AI response will always match the defined schema
2. **No Parsing Errors**: Eliminates JSON parsing failures and malformed responses
3. **Type Safety**: Ensures the response contains exactly what we expect
4. **Validation**: Built-in validation for required fields and array lengths
5. **Consistency**: Every response follows the same exact format

### Schema Definition

```typescript
const DixitPromptsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    prompts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: {
            type: Type.NUMBER,
            description: "Sequential ID number from 1 to 84",
          },
          prompt: {
            type: Type.STRING,
            description: "The creative Dixit prompt for image generation",
          },
          description: {
            type: Type.STRING,
            description: "Optional description of the prompt's artistic intent",
          },
        },
        required: ["id", "prompt"],
      },
      minItems: 84,
      maxItems: 84,
      description: "Array of exactly 84 Dixit prompts",
    },
  },
  required: ["prompts"],
  description: "Response containing exactly 84 creative Dixit prompts",
};
```

## Example Output

```
🎨 Generated Dixit Prompts:
============================================================

1. A lighthouse made of crystallized dreams guiding lost souls through a purple mist
   💭 Surreal architecture with dream-like elements

2. Tiny dancers performing ballet on floating rose petals in a starlit void
   💭 Whimsical scene combining nature and performance

3. A clockwork butterfly with wings made of autumn leaves and brass gears
   💭 Steampunk meets nature in fantastical form

...

============================================================
✨ Total prompts generated: 84
📋 Topic: "nature"
```

## Workflow Steps

1. **Get Topic**: Retrieves topic from console input or command line
2. **Generate Prompts**: Sends structured prompt to Gemini AI with `responseSchema`
3. **Guaranteed Structure**: AI returns JSON that matches our exact schema
4. **Parse Response**: Safely extracts prompts from validated JSON response
5. **Display Results**: Prints all prompts to console in formatted way

## Technical Implementation

- **Google GenAI SDK**: Uses the official `@google/genai` package
- **Response Schema**: Enforces structured output with `responseSchema`
- **MIME Type**: Sets `responseMimeType: "application/json"` for JSON responses
- **Validation**: Schema includes `minItems: 84, maxItems: 84` for exact count
- **Error Handling**: Comprehensive error handling for API and parsing failures

## Comparison: Before vs After

### Before (Manual JSON Parsing)
```typescript
// ❌ Prone to parsing errors and malformed responses
const response = await ai.models.generateContent({
  model: models.gemini_flash_lite,
  contents: prompt,
});
const parsed = JSON.parse(response.text); // Can fail!
```

### After (Structured Response Schema)
```typescript
// ✅ Guaranteed structure and format
const response = await ai.models.generateContent({
  model: models.gemini_flash_lite,
  contents: prompt,
  config: {
    responseSchema: DixitPromptsSchema,
    responseMimeType: "application/json",
  },
});
const parsed = JSON.parse(response.text); // Always works!
```

## API Requirements

- **Gemini API Key**: Required environment variable
- **Model**: Uses `gemini-2.5-flash-lite-preview-06-17`
- **Response Schema**: Requires compatible Gemini model that supports structured output
- **MIME Type**: Must set `application/json` when using `responseSchema`

## Troubleshooting

1. **Empty Response**: Check your API key and model availability
2. **Wrong Count**: Schema enforces 84 prompts, but warns if count differs
3. **API Errors**: Ensure your Gemini API key has proper permissions
4. **Model Compatibility**: Some older models may not support `responseSchema`

This implementation provides a robust, type-safe way to generate exactly 84 creative Dixit prompts with guaranteed structure and format!