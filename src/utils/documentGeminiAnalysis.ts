import { GoogleGenerativeAI } from "@google/generative-ai";

export const processDocumentWithGemini = async (text: string) => {
  try {
    const apiKey = localStorage.getItem("geminiApiKey");
    if (!apiKey) {
      throw new Error("Gemini API key not found. Please configure your API key first.");
    }

    if (!apiKey.startsWith('AI')) {
      throw new Error("Invalid Gemini API key format. The key should start with 'AI'.");
    }

    console.log("Initializing Gemini with API key");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Analyze this document and:
    1. Identify all data input fields
    2. Standardize them with brackets (e.g., [nome_cliente], [cpf], [endereco])
    3. Replace the original text with these standardized fields
    4. Return both the list of fields and the standardized content
    
    Document text:
    ${text}
    
    Return the result as a JSON object with two properties:
    - fields: array of standardized field names
    - standardizedContent: the document text with standardized fields`;

    console.log("Sending request to Gemini API");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    console.log("Received response from Gemini:", analysisText);
    
    try {
      return JSON.parse(analysisText);
    } catch (e) {
      console.error("Failed to parse Gemini response:", e);
      return {
        fields: [],
        standardizedContent: text
      };
    }
  } catch (error) {
    console.error("Error in Gemini analysis:", error);
    throw error;
  }
};