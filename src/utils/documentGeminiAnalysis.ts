import { GoogleGenerativeAI } from "@google/generative-ai";

export const processDocumentWithGemini = async (text: string) => {
  try {
    const apiKey = localStorage.getItem("geminiApiKey");
    if (!apiKey) {
      throw new Error("API key not found");
    }

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    console.log("Gemini analysis result:", analysisText);
    
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