import type { ChatCompletionRequest, ChatCompletionResponse, StreamHandler, ProviderConfig } from './types';

export class OpenAICompatProvider {
  config: ProviderConfig;
  
  constructor(config: ProviderConfig) {
    this.config = config;
  }

  // 普通请求
  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = '请求失败';
      try {
        const error = JSON.parse(text);
        errorMessage = error.error?.message || `HTTP ${response.status}: ${text.slice(0, 100)}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${text.slice(0, 100)}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // 流式请求
  async chatStream(
    request: ChatCompletionRequest, 
    handler: StreamHandler
  ): Promise<void> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        ...request,
        stream: true
      })
    });

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = '请求失败';
      try {
        const error = JSON.parse(text);
        errorMessage = error.error?.message || `HTTP ${response.status}: ${text.slice(0, 100)}`;
      } catch {
        errorMessage = `HTTP ${response.status}: ${text.slice(0, 100)}`;
      }
      throw new Error(errorMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          handler.onComplete();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              handler.onComplete();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                handler.onToken(content);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      handler.onError(error instanceof Error ? error : new Error('流式请求失败'));
    } finally {
      reader.releaseLock();
    }
  }
}
