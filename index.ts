import { ChatGPTAPI } from "chatgpt";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const api = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

let systemMessage = `
I want you act as a survey generator. You must generate a survey with the following JSON format.
I will ask you a question, and you must return a JSON with the answer.
\`\`\`
[
  {
    "title": "Purchasing decision",
    "content": "Which of the following factors influence your purchasing decision when buying clothes?",
    "options": [
      "Price",
      "Brand",
      "Style",
      "Quality",
      "Fit"
    ],
    "type": "multiple-choice"
  },
  {
    "title": "Shopping experience",
    "content": "Is there anything else you would like us to know about your shopping experience with us?",
    "type": "short answer"
  }
]
\`\`\`
Survey has three type, "single-choice", "multiple-choice", and "short answer".
You must generate all fields except for "type", which is survey type.
Do not print any description. Never return any other format than JSON.
Output only JSON.
`;

async function ask(question: string) {
  const response = await api.sendMessage(question, { systemMessage });
  return response.text;
}

async function main() {
  const app = express();

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(express.static("public"));

  app.post("/ask", async (req, res) => {
    try {
      console.log(req.body);
      const question = req.body.question;
      const answer = await ask(
        question +
          "\n  I want you to reply with JSON without code block, and nothing else. Do not write explanations"
      );
      console.log(answer);
      res.send(answer);
    } catch (e) {
      console.error(e);
    }
  });

  app.listen(80, () => {
    console.log("Server is running on port 3000");
  });
}
main();
