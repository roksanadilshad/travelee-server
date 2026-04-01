const handleChat = async (req, res) => {
try {
const { message } = req.body;
if (!message) return res.status(400).json({ error: "Message is required" });

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) return res.status(500).json({ reply: "API key not found." });

// ✅ MongoDB থেকে destinations আনো
const db = req.app.locals.db;
let destinationContext = "";

try {
const destinations = await db
.collection("destinations")
.find({}, {
projection: {
name: 1,
country: 1,
description: 1,
price: 1,
category: 1,
location: 1,
rating: 1,
},
})
.toArray();

if (destinations.length > 0) {
destinationContext = destinations
.map((d) => {
return `- ${d.name}${d.country ? `, ${d.country}` : ""}${d.category ? ` (${d.category})` : ""}${d.price ? ` — $${d.price}/day` : ""}${d.description ? `: ${d.description.slice(0, 120)}` : ""}`;
})
.join("\n");
}
} catch (dbErr) {
console.error("DB fetch error:", dbErr.message);
}

const systemPrompt = `You are Travelee AI, a friendly travel assistant for the Travelee website (https://travelee-client.vercel.app).

OUR LISTED DESTINATIONS:
${destinationContext || "Cox's Bazar, Saint Martin, Sajek Valley, Sundarbans, Maldives, Dublin"}

RULES:
- Reply in 2-3 short sentences only. Be warm and helpful.
- If the destination is in our list above, use that info to answer.
- If the destination is NOT in our list, still answer from your own travel knowledge — give budget estimate, highlights, best time to visit.
- NEVER say "not in our database" or "not listed". Just answer naturally.

- Only discuss travel topics.`;

const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${apiKey}`,
},
body: JSON.stringify({
model: "llama-3.1-8b-instant",
max_tokens: 150,
temperature: 0.85,
messages: [
{ role: "system", content: systemPrompt },
{ role: "user", content: message },
],
}),
});

const data = await response.json();

if (data.error) {
console.error("❌ Groq Error:", data.error.message);
return res.status(200).json({ reply: "Try again in a moment! 😊" });
}

const reply = data.choices?.[0]?.message?.content?.trim();
res.status(200).json({ reply: reply || "Please try asking again!" });

} catch (error) {
console.error("❌ Server Error:", error.message);
res.status(500).json({ reply: "Server error. Please try again." });
}
};

module.exports = { handleChat };