const { ChatGroq } = require('@langchain/groq');
const { SystemMessage, HumanMessage } = require('@langchain/core/messages');

const SYSTEM_PROMPT = `You are a smart business assistant for Indian freelancers and agencies. 
You understand GST, UPI, Indian business culture, and communication styles.
Always respond in professional yet friendly Indian English.
Format currency as ₹ (INR). Use Indian number formatting (lakhs, crores).`;

const getModel = (modelName = 'llama-3.3-70b-versatile') => {
  return new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: modelName,
    modelName: modelName,
  });
};

const generatePaymentReminder = async (invoice, client, tone) => {
  const model = getModel('llama-3.1-8b-instant'); // fast

  const prompt = `Generate a payment reminder for the following invoice:
  Invoice Number: ${invoice.invoiceNumber}
  Amount Due: ₹${invoice.balanceDue}
  Due Date: ${invoice.dueDate}
  Client Name: ${client.name}
  
  The tone should be: ${tone}.
  Provide a subject line for email and a message body suitable for both Email and WhatsApp.`;

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(prompt),
  ]);

  // Simple parsing of response to extract subject and message
  const text = response.content;
  
  // Try to extract Subject
  const subjectMatch = text.match(/Subject:\s*(.*)/i);
  const subject = subjectMatch ? subjectMatch[1] : `Payment Reminder: ${invoice.invoiceNumber}`;
  
  // Message is the rest
  const message = text.replace(/Subject:\s*(.*)/i, '').trim();

  return { subject, message };
};

const generateProposal = async (details) => {
  const model = getModel('llama-3.3-70b-versatile'); // quality

  const prompt = `Write a comprehensive freelance project proposal in Markdown format based on the following details:
  Project Type: ${details.projectType}
  Description: ${details.projectDescription}
  Client Name: ${details.clientName}
  Budget: ${details.budget}
  Timeline: ${details.timeline}
  
  Include sections for: Introduction, Scope of Work, Deliverables, Timeline, Pricing, and Why Choose Us.`;

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(prompt),
  ]);

  return {
    title: `${details.projectType} Proposal for ${details.clientName}`,
    content: response.content,
  };
};

const generateTaxTips = async (incomeData) => {
  const model = getModel('llama-3.1-8b-instant');

  const prompt = `Based on the following financial data for the current quarter:
  Total Income: ₹${incomeData.quarterlyIncome}
  Total Expenses: ₹${incomeData.expenses}
  
  Provide 3-5 tax saving tips relevant for Indian freelancers under the New/Old Tax Regime.`;

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(prompt),
  ]);

  return response.content;
};

const generateBusinessInsights = async (data) => {
  const model = getModel('llama-3.3-70b-versatile');

  const prompt = `Analyze the following business metrics for the last 3 months and provide 3-5 actionable insights:
  Total Revenue: ₹${data.revenue}
  Top Clients: ${JSON.stringify(data.topClients)}
  Expense Breakdown: ${JSON.stringify(data.expenses)}
  Pending Payments: ₹${data.pending}
  
  Return the response as a JSON array of objects, where each object has "title", "description", and "action". 
  Ensure it is valid JSON only.`;

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(prompt),
  ]);

  try {
    // Attempt to extract JSON if the model wrapped it in markdown code blocks
    let text = response.content;
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    return JSON.parse(text);
  } catch (e) {
    // Fallback if JSON parsing fails
    return [
      {
        title: 'Review Pending Payments',
        description: 'You have a significant amount of pending payments.',
        action: 'Send reminders to clients.',
      },
    ];
  }
};

const generateInvoiceItems = async (description) => {
  const model = getModel('llama-3.1-8b-instant');

  const prompt = `Based on this project description: "${description}", auto-generate a list of invoice line items.
  For each item, provide: Description, Quantity, Rate (in INR), and a standard Indian GST HSN/SAC code.
  Return the response as a JSON array of objects: [{"description": "...", "quantity": 1, "rate": 5000, "hsnCode": "9983"}].
  Ensure it is valid JSON only.`;

  const response = await model.invoke([
    new SystemMessage(SYSTEM_PROMPT),
    new HumanMessage(prompt),
  ]);

  try {
    let text = response.content;
    const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    return JSON.parse(text);
  } catch (e) {
    return [
      {
        description: description,
        quantity: 1,
        rate: 10000,
        hsnCode: '9983',
      },
    ];
  }
};

module.exports = {
  generatePaymentReminder,
  generateProposal,
  generateTaxTips,
  generateBusinessInsights,
  generateInvoiceItems,
};
