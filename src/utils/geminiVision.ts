import { GoogleGenerativeAI } from "@google/generative-ai";

export const processImageWithGemini = async (imageFile: File) => {
  try {
    console.log("Starting Gemini image processing");
    
    const apiKey = localStorage.getItem("geminiApiKey");
    if (!apiKey || apiKey.trim() === '') {
      throw new Error("Please configure your Gemini API key in the settings first.");
    }

    // Validate API key format (basic check)
    if (!apiKey.startsWith('AI') || apiKey.length < 10) {
      throw new Error("The provided API key appears to be invalid. Please check your Gemini API key format.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Convert File to base64
    const base64Image = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(imageFile);
    });

    // Remove data URL prefix
    const base64Data = base64Image.split(',')[1];

    // Initialize Gemini Pro Vision model
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    const prompt = `Extract the following information from this document image if present:
    - Full Name
    - CPF number
    - RG number
    - Address
    - Phone numbers
    - Professional information
    - Bank details
    Format the response as a JSON object with these fields.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Data
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini extraction result:", text);

    // Try to parse the response as JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", e);
      return {
        rawText: text
      };
    }
  } catch (error) {
    console.error("Error processing image with Gemini:", error);
    throw error;
  }
};