// 测试机器人响应功能
// 这个脚本用于测试组会话中机器人是否正确响应

const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// 测试用户凭证
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'Test123@'
};

async function testBotResponses() {
  try {
    console.log('1. 注册测试用户...');
    const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
    const token = registerResponse.data.token;
    console.log('✓ 用户注册成功');

    console.log('\n2. 创建组会话...');
    const conversationResponse = await axios.post(
      `${API_BASE}/conversations`,
      { title: '测试组会话', isGroup: true },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const conversationId = conversationResponse.data.id;
    console.log(`✓ 组会话创建成功 (ID: ${conversationId})`);

    console.log('\n3. 添加机器人到组会话...');
    const botResponse = await axios.post(
      `${API_BASE}/conversations/${conversationId}/bots`,
      { botType: 'customer_service' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✓ 机器人添加成功 (类型: ${botResponse.data.botType})`);

    console.log('\n4. 发送测试消息...');
    const messageResponse = await axios.post(
      `${API_BASE}/messages`,
      { content: '你好，我需要帮助', conversationId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log(`✓ 消息发送成功`);
    console.log(`  AI 处理状态: ${messageResponse.data.aiProcessingStatus}`);

    console.log('\n5. 等待机器人响应...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n6. 获取消息列表...');
    const messagesResponse = await axios.get(
      `${API_BASE}/messages/${conversationId}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const messages = messagesResponse.data;

    console.log(`\n消息总数: ${messages.length}`);
    console.log('\n消息列表:');
    messages.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.senderType}] ${msg.content}`);
    });

    const botMessages = messages.filter(msg => msg.senderType === 'bot');
    console.log(`\n机器人消息数: ${botMessages.length}`);

    if (botMessages.length > 0) {
      console.log('\n❌ 机器人没有响应！');
      console.log('可能的原因：');
      console.log('1. 机器人成员没有被正确添加到组会话');
      console.log('2. 机器人响应逻辑有问题');
      console.log('3. AI 服务生成响应失败');
    } else {
      console.log('\n✓ 机器人成功响应！');
    }

  } catch (error) {
    console.error('\n❌ 测试失败:', error.response?.data || error.message);
    if (error.response) {
      console.error('状态码:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  }
}

testBotResponses();
