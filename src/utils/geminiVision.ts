import { GoogleGenerativeAI } from "@google/generative-ai";

export const processImageWithGemini = async (imageFile: File) => {
  try {
    console.log("Starting Gemini image processing");
    
    const apiKey = localStorage.getItem("geminiApiKey");
    if (!apiKey || apiKey.trim() === '') {
      throw new Error("Configure sua chave API do Gemini nas configurações primeiro.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Convert File to base64
    const base64Image = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(imageFile);
    });

    const base64Data = base64Image.split(',')[1];

    // Using the new gemini-1.5-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Extraia as seguintes informações deste documento, se presentes:
    - Nome Completo
    - CPF
    - RG
    - Órgão Expedidor
    - Data de Emissão
    - Filiação
    - Endereço
    - Estado Civil
    - Nacionalidade
    - Profissão
    
    Retorne apenas os dados encontrados em formato JSON com estes campos.`;

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