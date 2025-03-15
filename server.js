const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// 🚀 提供前端靜態文件
app.use(express.static(path.join(__dirname, "public")));

// OpenAI API 金鑰
const OPENAI_API_KEY = "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";

// 生成作文 API
app.post("/generate", async (req, res) => {
    try {
        const { title, minWords, maxWords, paragraphs } = req.body;

        let prompt = `請以 "${title}" 為題，寫一篇 ${minWords} 字以上，${maxWords} 字以下的作文。文分 ${paragraphs.length} 段。`;

        paragraphs.forEach((p, index) => {
            prompt += `第 ${index + 1} 段請寫出 "${p}"。`;
        });

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({ essay: response.data.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "作文生成失敗" });
    }
});

// 🚀 精簡作文 API
app.post("/shorten", async (req, res) => {
    try {
        const { text } = req.body;

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o",
                messages: [{ role: "user", content: `請稍微精簡這篇文章：${text}` }],
                temperature: 0.7
            },
            {
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({ shortened: response.data.choices[0].message.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "精簡失敗" });
    }
});

// 🚀 提供 `index.html` 當作首頁
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`✅ 伺服器運行中：http://localhost:${PORT}`);
});
