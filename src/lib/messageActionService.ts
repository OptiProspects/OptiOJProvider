import apiClient from '@/config/apiConfig';

// 标记消息为已读
export const markMessageAsRead = async (messageId: number) => {
  try {
    const response = await apiClient.put(`/messages/${messageId}/readMessage`);
    return response.data;
  } catch (error) {
    console.error('标记消息已读失败:', error);
    throw error;
  }
};

// 标记所有消息为已读
export const markAllMessagesAsRead = async () => {
  try {
    const response = await apiClient.put('/messages/readAll');
    return response.data;
  } catch (error) {
    console.error('标记所有消息已读失败:', error);
    throw error;
  }
};

// 批量标记消息为已读
export const batchMarkMessagesAsRead = async (messageIds: number[]) => {
  try {
    const response = await apiClient.post('/messages/batchRead', {
      message_ids: messageIds
    });
    return response.data;
  } catch (error) {
    console.error('批量标记消息已读失败:', error);
    throw error;
  }
};

// 删除消息
export const deleteMessage = async (messageId: number) => {
  try {
    const response = await apiClient.delete(`/messages/${messageId}/deleteMessage`);
    return response.data;
  } catch (error) {
    console.error('删除消息失败:', error);
    throw error;
  }
}; 