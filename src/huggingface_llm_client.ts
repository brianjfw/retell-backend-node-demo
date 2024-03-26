import { WebSocket } from "ws";
import { RetellRequest, RetellResponse, Utterance } from "./types";
import fetch from "node-fetch"; // You may need to install node-fetch if not already available

const HUGGINGFACE_API_ENDPOINT = "https://api-inference.huggingface.co/models/YOUR_MODEL_NAME"; // Replace with your actual model name

export class HuggingFaceLlmClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // First sentence requested
  BeginMessage(ws: WebSocket) {
    const res: RetellResponse = {
      response_id: 0,
      content: "Hello, how can I assist you today?", // Customize your greeting message
      content_complete: true,
      end_call: false,
    };
    ws.send(JSON.stringify(res));
  }

  private async callHuggingFaceApi(prompt: string): Promise<string> {
    const response = await fetch(HUGGINGFACE_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: prompt }),
    });
    const data = await response.json();
    return data.generated_text; // Adjust based on the actual response format
  }

  async DraftResponse(request: RetellRequest, ws: WebSocket) {
    // Implement your logic to convert the RetellRequest into a prompt
    const prompt = "Your prompt based on the request"; // Replace with actual conversion logic

    try {
      const generatedText = await this.callHuggingFaceApi(prompt);
      const res: RetellResponse = {
        response_id: request.response_id,
        content: generatedText,
        content_complete: true, // Set to false if expecting more responses
        end_call: false, // Set to true if the conversation should end
      };
      ws.send(JSON.stringify(res));
    } catch (error) {
      console.error("Error calling HuggingFace API: ", error);
      // Handle error response
    }
  }
}