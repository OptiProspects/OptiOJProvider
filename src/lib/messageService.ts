import apiClient from '@/config/apiConfig';

export interface MessageType {
  system: {
    count: number;
    description: string;
  };
  team_application: {
    count: number;
    description: string;
  };
  team_invitation: {
    count: number;
    description: string;
  };
  team_notice: {
    count: number;
    description: string;
  };
}

export interface UnreadCountResponse {
  total: number;
  by_types: MessageType;
}

export interface MessageAction {
  action: string;
  name: string;
  type: 'default' | 'primary' | 'danger';
  need_reason: boolean;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  type: keyof MessageType;
  title: string;
  content: string;
  is_read: boolean;
  is_processed: boolean;
  application_id?: number;
  created_at: string;
  read_at?: string;
  actions?: MessageAction[];
}

export interface MessageListResponse {
  messages: Message[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
}

export const getUnreadCount = async () => {
  try {
    const response = await apiClient.get<{
      code: number;
      data: UnreadCountResponse;
    }>('/messages/getUnreadCount');
    return response.data.data;
  } catch (error) {
    console.error('获取未读消息数量失败:', error);
    throw error;
  }
};

export const getMessageList = async (params: {
  page: number;
  page_size: number;
  type?: keyof MessageType;
  is_read?: boolean;
}) => {
  try {
    const response = await apiClient.get<{
      code: number;
      data: MessageListResponse;
    }>('/messages/getMessageList', { params });
    return response.data.data;
  } catch (error) {
    console.error('获取消息列表失败:', error);
    throw error;
  }
};

export const markAllMessagesAsRead = async (type?: keyof MessageType) => {
  try {
    const response = await apiClient.put('/messages/readAll', { type });
    return response.data;
  } catch (error) {
    console.error('标记所有消息已读失败:', error);
    throw error;
  }
};
