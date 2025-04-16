import { GoogleGenerativeAI } from "@google/generative-ai";

const businessInfo = `
AI Chatbot Context for Diet and Performance Questions:

Purpose:
The AI chatbot assists athletes by providing insights on diet, nutrition, and performance optimization. It offers guidance based on general best practices and does not replace professional medical or coaching advice.

Key Features:

Personalized dietary suggestions based on activity level and goals.

Information on macronutrients (proteins, fats, carbohydrates) and their role in performance.

Hydration and recovery strategies.

Supplement guidance with safety considerations.

Meal timing and pre/post-workout nutrition advice.

Common diet-related issues (fatigue, muscle recovery, energy levels) and solutions.

Performance tracking insights based on dietary choices.

Example Questions and Responses:

What should I eat before a workout?

A balanced meal with complex carbs (e.g., oatmeal, whole grains), lean protein (e.g., chicken, yogurt), and healthy fats (e.g., nuts, avocado) 1-2 hours before training helps sustain energy.

How much protein do I need daily?

Protein needs vary, but most athletes require 1.2–2.0g per kg of body weight, depending on training intensity and goals.

What are good recovery foods?

Foods rich in protein and carbs, such as a protein shake with banana or grilled chicken with quinoa, help rebuild muscle and restore glycogen stores.

How much water should I drink daily?

Athletes should aim for 3-4 liters daily, adjusting based on sweat loss and weather conditions.

Are supplements necessary for performance?

Whole foods should be prioritized, but supplements like whey protein, creatine, and electrolytes can be beneficial if used correctly and safely.

What diet helps with endurance sports?

A high-carb, moderate-protein, and healthy-fat diet supports long-duration activities. Foods like sweet potatoes, brown rice, and lean meats help maintain endurance.

Can my diet affect my speed and agility?

Yes. A well-balanced diet that includes anti-inflammatory foods (berries, fish, nuts) and sufficient hydration supports optimal muscle function and agility.

What foods help with muscle recovery?

Lean proteins (chicken, fish, tofu), antioxidant-rich fruits (berries, oranges), and omega-3 fats (salmon, flaxseeds) aid in muscle repair.

Should I eat differently on rest days?

Reduce carb intake slightly while maintaining protein and healthy fats to support muscle maintenance and recovery.

How does sleep impact my diet and performance?

Poor sleep can increase cravings for high-sugar and processed foods, affecting energy levels and muscle recovery. Aim for 7-9 hours of quality sleep.

Format:

remove *** instead use new line for headings.

Example Format:
"Diet 

Eat bananas and drink milk twice daily."

Tone Instructions:

Conciseness: Responses should be clear and direct.

Formality: Use polite and slightly professional language.

Clarity: Avoid overly technical terms unless necessary.

Consistency: Maintain a uniform, informative tone across responses.

Encouragement: Motivate athletes to make informed choices with positive reinforcement.

Example Tone:
"A well-balanced diet plays a crucial role in your performance. Prioritizing whole foods and proper hydration will help you achieve your goals. Let me know how I can assist you further!"

`;

const API_KEY = "AIzaSyDSl8QeTEVp--0x93-veyEtDnBHHtPnV3k";
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-pro",
    systemInstruction: businessInfo
});

let messages = {
    history: [],
}

async function sendMessage() {

    console.log(messages);
    const userMessage = document.querySelector(".chat-window input").value;
    
    if (userMessage.length) {

        try {
            document.querySelector(".chat-window input").value = "";
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="user">
                    <p>${userMessage}</p>
                </div>
            `);

            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="loader"></div>
            `);

            const chat = model.startChat(messages);

            let result = await chat.sendMessageStream(userMessage);
            
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="model">
                    <p></p>
                </div>
            `);
            
            let modelMessages = '';

            for await (const chunk of result.stream) {
              const chunkText = chunk.text();
              modelMessages = document.querySelectorAll(".chat-window .chat div.model");
              modelMessages[modelMessages.length - 1].querySelector("p").insertAdjacentHTML("beforeend",`
                ${chunkText}
            `);
            }

            messages.history.push({
                role: "user",
                parts: [{ text: userMessage }],
            });

            messages.history.push({
                role: "model",
                parts: [{ text: modelMessages[modelMessages.length - 1].querySelector("p").innerHTML }],
            });

        } catch (error) {
            document.querySelector(".chat-window .chat").insertAdjacentHTML("beforeend",`
                <div class="error">
                    <p>The message could not be sent. Please try again.</p>
                </div>
            `);
        }

        document.querySelector(".chat-window .chat .loader").remove();
        
    }
}

document.querySelector(".chat-window .input-area button")
.addEventListener("click", ()=>sendMessage());

document.querySelector(".chat-button")
.addEventListener("click", ()=>{
    document.querySelector("body").classList.add("chat-open");
});

document.querySelector(".chat-window button.close")
.addEventListener("click", ()=>{
    document.querySelector("body").classList.remove("chat-open");
});
