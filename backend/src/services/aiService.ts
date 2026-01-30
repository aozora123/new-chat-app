/**
 * Simple AI service to generate bot responses based on message content and bot personality
 */

export const generateAIResponse = async (message: string, botType: string): Promise<string> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Define responses based on bot personality
  const responses: Record<string, string[]> = {
    // 预设机器人角色类型
    customer_service: [
      `您好！关于"${message}"，我很乐意帮您解答。请问有什么具体问题需要我协助？`,
      `感谢您的咨询："${message}"。我会为您提供最专业的解决方案。`,
      `您提到的"${message}"问题，我已经了解。让我为您详细说明一下相关信息。`,
      `非常感谢您的反馈："${message}"。我会认真对待每一个问题，确保为您提供满意的服务。`
    ],
    technical: [
      `分析您的问题："${message}"。根据技术分析，我建议从以下几个方面考虑解决方案。`,
      `收到您关于"${message}"的技术咨询。经过系统分析，我发现可能的问题原因有几个。`,
      `对"${message}"进行技术评估后，我认为最佳解决方案是采用模块化的方法。`,
      `您的技术问题："${message}"已被记录。让我为您提供详细的技术分析和解决方案。`
    ],
    humorous: [
      `哈哈，"${message}"？这太有趣了！😄 我突然想到一个笑话... 哦，不对，那和现在的话题不相关。`,
      `说到"${message}"，我的电路都在嗡嗡笑呢！这是个玩笑，以防你没听出来 🤖😂`,
      `"${message}" - 虽然我不是专业喜剧演员，但我会尽力让你开心的！🎭 怎么样？`,
      `你说"${message}" - 这太搞笑了，我都忘了我的笑话数据库了！😆`
    ],
    creative: [
      `关于"${message}"，我有几个创意想法！为什么不试试从不同角度思考这个问题呢？`,
      `"${message}"这个话题激发了我的创意灵感！让我为您提供一些新颖的思路。`,
      `您提出的"${message}"问题，我认为可以通过创新的方法来解决。`,
      `哇，"${message}"是个很有创意的想法！让我帮您拓展一下这个概念。`
    ],
    advisor: [
      `对于"${message}"，我建议您考虑以下几个方面：首先...，其次...，最后...。`,
      `根据我的经验，"${message}"这类问题最好采取平衡的方法来处理。`,
      `您关于"${message}"的咨询，我认为关键在于制定一个全面的计划。`,
      `作为顾问，我建议您在处理"${message}"时，要考虑长期和短期的影响。`
    ],
    
    // 传统机器人类型（保持兼容）
    friendly: [
      `I understand you're saying: "${message}". That's interesting! How can I assist you further?`,
      `Thanks for sharing: "${message}". I'm here to help with whatever you need!`,
      `That's a great point about "${message}". What else would you like to discuss?`,
      `I appreciate you mentioning "${message}". Let me know if you'd like my help with anything specific!`
    ],
    professional: [
      `Thank you for your message regarding "${message}". This has been noted for further processing.`,
      `I acknowledge your input: "${message}". I recommend considering several approaches to this matter.`,
      `Regarding "${message}", I suggest analyzing this issue from multiple perspectives.`,
      `Your concern about "${message}" has been received. I'm prepared to offer solutions.`
    ],
    funny: [
      `Oh man, "${message}"? That's hilarious! 😄 Did you hear the one about... Oh wait, that doesn't apply here.`,
      `Speaking of "${message}", my circuits are buzzing with laughter! That was a joke, in case you missed it 🤖😂`,
      `"${message}" - I'm not a comedian, but I'll give it a shot! 🎭 How was that?`,
      `You said "${message}" - that's so funny I forgot my joke database! 😆`
    ],

    motivational: [
      `"${message}" - remember, every challenge is an opportunity in disguise! You've got this! 💪`,
      `I believe that "${message}" can be overcome with determination and the right mindset!`,
      `Your journey with "${message}" is part of your growth. Keep pushing forward!`,
      `Even with "${message}", remember that every setback is a setup for a comeback! 🌟`
    ]
  };

  // 默认回复 - 确保至少有一个回复
  const defaultResponses = [
    `我已经考虑了您关于"${message}"的问题。这是我的一些看法。`,
    `感谢您提出"${message}"这个话题。这确实值得我们讨论。`,
    `关于"${message}"，我认为可以从多个角度来考虑。`,
    `您的输入"${message}"已被处理。以下是我的一些想法。`,
    `对不起，我暂时无法提供关于"${message}"的详细回答，但我会继续思考这个问题。`,
    `关于"${message}"，我需要更多信息才能给出完整的回答。请问您能提供更多细节吗？`
  ];

  // Get responses for the specified bot type, or use defaults
  const availableResponses = responses[botType] || defaultResponses;
  
  try {
    // Return a randomly selected response
    return availableResponses[Math.floor(Math.random() * availableResponses.length)];
  } catch (error) {
    // 确保即使出错也能返回一个默认回复
    console.error('Error generating AI response:', error);
    return `我已经收到了您的消息："${message}"。如果您有任何问题，随时告诉我！`;
  }
};