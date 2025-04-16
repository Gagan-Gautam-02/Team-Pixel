const API_KEY = "AIzaSyDSl8QeTEVp--0x93-veyEtDnBHHtPnV3k"; // Replace with your actual Gemini API key

// Chart Setup
const ctx1 = document.getElementById('myChart').getContext('2d');
const ctx2 = document.getElementById('myChart2').getContext('2d');

const ballsPlayed = [5, 6, 4, 7, 4, 6, 7, 6, 6, 7, 5, 5, 6, 4, 6, 6, 7, 5, 7, 4, 5, 6, 6, 4, 6, 6, 5, 5, 5, 7, 6, 6, 5, 6, 4, 7, 4, 5, 5, 4, 6, 4, 6, 6, 5, 6, 4, 5, 6, 5];
const runsScored = [9, 10, 7, 11, 6, 10, 11, 9, 9, 9, 8, 7, 7, 4, 7, 6, 7, 4, 6, 3, 5, 5, 4, 3, 4, 4, 3, 3, 3, 4, 3, 3, 2, 2, 2, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 1, 1, 1];
const labels = ballsPlayed.map((_, i) => `Over ${i + 1}`);

// Chart 1 - Balls vs Runs
new Chart(ctx1, {
  type: 'bar',
  data: {
    labels,
    datasets: [
      {
        label: 'Balls Played',
        data: ballsPlayed,
        type: 'line',
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255,99,132,0.2)',
        borderWidth: 2,
        yAxisID: 'y'
      },
      {
        label: 'Runs Scored',
        data: runsScored,
        backgroundColor: 'rgba(75,192,192,0.6)',
        borderColor: '#4bc0c0',
        borderWidth: 1,
        yAxisID: 'y'
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Balls Played vs Runs Scored per Over',
        color: '#fff',
        font: { size: 18 }
      },
      legend: {
        labels: { color: '#ccc' }
      }
    },
    interaction: { mode: 'index', intersect: false },
    stacked: false,
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Balls & Runs', color: '#aaa' },
        ticks: { color: '#aaa' },
        grid: { color: '#444' }
      },
      x: {
        ticks: { color: '#aaa' },
        grid: { color: '#444' }
      }
    }
  }
});

// Chart 2 - Runs Trend
new Chart(ctx2, {
  type: 'line',
  data: {
    labels,
    datasets: [{
      label: 'Runs Over Time',
      data: runsScored,
      fill: false,
      borderColor: '#03dac6',
      pointBackgroundColor: '#03dac6',
      tension: 0.3
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Runs Trend Over Overs',
        color: '#fff',
        font: { size: 18 }
      },
      legend: {
        labels: { color: '#ccc' }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: '#aaa' },
        title: { display: true, text: 'Runs', color: '#aaa' },
        grid: { color: '#444' }
      },
      x: {
        ticks: { color: '#aaa' },
        grid: { color: '#444' }
      }
    }
  }
});

async function askDefaultQuestion(question) {
  const fullPrompt = `
You are an expert cricket coach and fitness advisor. 
Based on the following data, answer the user's question in clear, structured **Markdown format**.

**Data:**
- Balls played per over: ${JSON.stringify(ballsPlayed)}
- Runs scored per over: ${JSON.stringify(runsScored)}

**Instructions:**
- Use bold for section headings (e.g. **Performance Summary**)
- Use bullet points or numbered lists where appropriate
- Keep formatting clean and scannable for athletes

Question: ${question}
`;
  await fetchAIResponse(fullPrompt);
}

async function askCustomQuestion() {
  const input = document.getElementById("customInput").value.trim();
  if (!input) return;

  const fullPrompt = `
You are an expert cricket coach and fitness advisor. 
Based on the following data, answer the user's question in clear, structured **Markdown format**.

**Data:**
- Balls played per over: ${JSON.stringify(ballsPlayed)}
- Runs scored per over: ${JSON.stringify(runsScored)}

instructions:
-if user asks for a fitness plan, provide a weekly cricket-specific fitness + diet plan.
- if user asks for injury prevention tips, provide injury prevention tips.
- if user asks for improvement tips, provide other improvement tips.
- if user asks for equipment needed, provide equipment needed for training and play.        
-if user asks for performance patterns, provide performance patterns & consistency.
- if user asks for batting improvements, provide batting improvements based on balls-to-runs ratio.
- if user just states a sentence, respond like a coach and not provide any analysis (example prompt: "thank you" or "that was helpful" or "how are you?").
**User's question:** ${input}
`;
  await fetchAIResponse(fullPrompt);
}

async function fetchAIResponse(prompt) {
  const aiResponse = document.getElementById("ai-response");
  aiResponse.innerHTML = "Thinking...";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
      }
    );

    if (!response.ok) throw new Error("API error");

    const result = await response.json();
    let aiText = result.candidates?.[0]?.content?.parts?.[0]?.text || "No meaningful response.";

    // Convert Markdown to HTML using marked.js
    const htmlContent = marked.parse(aiText);
    aiResponse.innerHTML = htmlContent;

  } catch (error) {
    console.error("AI error:", error);
    aiResponse.innerText = "Failed to load AI response.";
  }
}

// Gemini AI Analysis
async function analyzeGraphData(balls, runs) {
  const prompt = `
Analyze the following cricket practice overs for a 20-year-old male athlete weighing 50kg:
- Balls played per over: ${JSON.stringify(balls)}
- Runs scored per over: ${JSON.stringify(runs)}
- This is for one match.

**Instructions:**
Provide your response in **Markdown format** with structured analysis:
1. Performance patterns & consistency
2. Batting improvements based on balls-to-runs ratio
3. Weekly cricket-specific fitness + diet plan
4. Injury prevention tips
5. Other improvement tips
6. Equipment needed for training and play
`;
  await fetchAIResponse(prompt);
}

// Popup controls
function openPopup() {
  document.getElementById('aiPopup').classList.add('open');
}
function closePopup() {
  document.getElementById('aiPopup').classList.remove('open');
}
