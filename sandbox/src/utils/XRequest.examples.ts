/**
 * Enhanced XRequest Usage Examples
 * ================================
 * 
 * This file demonstrates all the advanced features of the XRequest utility,
 * including callbacks, streaming, manual control, middlewares, and more.
 */

import { XRequestFunction, setXRequestGlobalOptions, ChatMessage } from './XRequest';

/**
 * EXAMPLE 1: Basic Usage with Callbacks
 * ======================================
 */
async function basicUsageWithCallbacks() {
  const request = XRequestFunction(
    'https://opencode.ai/zen/v1',
    {
      method: 'POST',
      headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
      timeout: 30000,
      retries: 3,
      callbacks: {
        onSuccess: (chunks, headers) => {
          console.log('Request succeeded with chunks:', chunks);
        },
        onError: (error, errorInfo) => {
          console.error('Request failed:', error.message);
          // Return a custom retry interval (in milliseconds)
          return 2000; // Retry after 2 seconds
        },
        onUpdate: (chunk, headers) => {
          console.log('Received chunk:', chunk);
        },
      },
    }
  );

  try {
    const result = await request.post('/chat/completions', {
      model: 'minimax-m2.5-free',
      messages: [{ role: 'user', content: 'Hello' }],
    });
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * EXAMPLE 2: Manual Request Control
 * ==================================
 */
async function manualRequestControl() {
  const request = XRequestFunction(
    'https://api.example.com/v1',
    {
      manual: true, // Enable manual mode
      callbacks: {
        onSuccess: (chunks) => console.log('Success!', chunks),
      },
    }
  );

  // Check if currently requesting
  console.log('Is requesting:', request.getIsRequesting());

  // Manually execute the request
  try {
    const result = await request.run({
      query: 'example',
    });
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }

  // Abort the request if needed
  request.abort();
}

/**
 * EXAMPLE 3: Request Retry with Custom Retry Interval
 * ====================================================
 */
async function retryWithCustomInterval() {
  const request = XRequestFunction(
    'https://unstable-api.example.com/v1',
    {
      method: 'POST',
      retryTimes: 5, // Max 5 retry attempts
      retryInterval: 3000, // Base retry interval of 3 seconds
      callbacks: {
        onError: (error, errorInfo, headers) => {
          console.warn('Request failed, retrying...', error.message);
          // Return custom interval based on error
          if (error.message.includes('rate-limit')) {
            return 10000; // Wait 10 seconds for rate limit errors
          }
          return undefined; // Use default retryInterval
        },
      },
    }
  );

  try {
    const result = await request.post('/data', { id: 123 });
    console.log('Result:', result);
  } catch (error) {
    console.error('Final error after retries:', error);
  }
}

/**
 * EXAMPLE 4: Custom Fetch Implementation
 * =======================================
 */
async function customFetchImplementation() {
  // Create a custom fetch wrapper
  const customFetch = async (url: string | URL | Request, init?: RequestInit): Promise<Response> => {
    console.log('Custom fetch called for:', url);
    // Add custom logic here (logging, authentication, etc.)
    return fetch(url, init);
  };

  const request = XRequestFunction(
    'https://api.example.com/v1',
    {
      fetch: customFetch as any,
      headers: { 'X-Custom-Header': 'value' },
    }
  );

  try {
    const result = await request.post('/endpoint', { data: 'test' });
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * EXAMPLE 5: Middleware Processing
 * =================================
 */
async function middlewareProcessing() {
  const request = XRequestFunction(
    'https://api.example.com/v1',
    {
      method: 'POST',
      middlewares: {
        onRequest: async (url, init) => {
          console.log('Before request:', url);
          // Add timestamps, modify headers, etc.
          const updatedInit = {
            ...init,
            headers: {
              ...init?.headers,
              'X-Request-Time': new Date().toISOString(),
            },
          };
          return [url, updatedInit];
        },
        onResponse: async (response) => {
          console.log('After response, status:', response.status);
          // Process response (logging, validation, etc.)
          return response;
        },
      },
    }
  );

  try {
    const result = await request.post('/data', { message: 'hello' });
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * EXAMPLE 6: Stream Processing with Custom Separators
 * ====================================================
 */
async function streamProcessing() {
  const request = XRequestFunction(
    'https://api.example.com/v1',
    {
      streamTimeout: 120000, // 2 minutes for streaming
      streamSeparator: '\n\n', // Separate data chunks by double newline
      partSeparator: '\n', // Separate parts within a chunk by newline
      kvSeparator: ':', // Separate keys and values by colon
      callbacks: {
        onUpdate: (chunk, headers) => {
          console.log('Stream chunk received:', chunk);
          // Process each chunk as it arrives
        },
        onSuccess: (allChunks, headers) => {
          console.log('Stream completed, total chunks:', allChunks.length);
        },
      },
    }
  );

  try {
    const result = await request.post('/stream', { query: 'data' });
    console.log('Final result:', result);
  } catch (error) {
    console.error('Stream error:', error);
  }
}

/**
 * EXAMPLE 7: Global Options Configuration
 * ========================================
 */
function setGlobalConfiguration() {
  // Set global defaults for all XRequest instances
  setXRequestGlobalOptions({
    headers: {
      'Authorization': 'Bearer GLOBAL_API_KEY',
      'X-App-Version': '1.0.0',
    },
    timeout: 60000,
    manual: false,
  });

  // Now all new XRequest instances will use these defaults
  const request1 = XRequestFunction('https://api1.example.com/v1', {});
  const request2 = XRequestFunction('https://api2.example.com/v1', {
    // Can override specific settings
    timeout: 30000,
  });
}

/**
 * EXAMPLE 8: Request Abort and Event Listeners
 * ============================================
 */
async function requestAbortAndEvents() {
  const request = XRequestFunction(
    'https://slow-api.example.com/v1',
    {
      timeout: 120000,
    }
  );

  // Listen to events
  request.on('success', (data) => {
    console.log('Success event:', data);
  });

  request.on('error', (error) => {
    console.error('Error event:', error);
  });

  request.on('abort', () => {
    console.log('Request was aborted');
  });

  // Start request
  const promise = request.post('/long-running', { process: 'data' });

  // Abort after 5 seconds
  setTimeout(() => {
    request.abort();
  }, 5000);

  try {
    const result = await promise;
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * EXAMPLE 9: Transform Request and Response
 * ==========================================
 */
async function transformRequestResponse() {
  const request = XRequestFunction(
    'https://api.example.com/v1',
    {
      transformRequest: (data) => {
        // Modify request before sending
        console.log('Transforming request:', data);
        return {
          ...data,
          timestamp: new Date().toISOString(),
        };
      },
      transformResponse: (data) => {
        // Modify response after receiving
        console.log('Transforming response:', data);
        return {
          success: true,
          data: data,
        };
      },
    }
  );

  try {
    const result = await request.post('/data', { name: 'John' });
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * EXAMPLE 10: Chat Stream with Callbacks
 * =======================================
 */
async function chatStreamExample() {
  const request = XRequestFunction(
    'https://opencode.ai/zen/v1',
    {
      method: 'POST',
      headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
      streamTimeout: 120000,
      callbacks: {
        onSuccess: (chunks) => {
          console.log('Chat completed with', chunks.length, 'chunks');
        },
        onError: (error) => {
          console.error('Chat error:', error.message);
          return 5000; // Retry after 5 seconds
        },
        onUpdate: (chunk) => {
          console.log('Chat chunk:', chunk);
        },
      },
    }
  );

  try {
    const response = await request.post('/chat/completions', {
      model: 'minimax-m2.5-free',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        {
          role: 'user',
          content: 'What is the weather like?',
        },
      ],
      stream: true,
      max_tokens: 256,
    });

    console.log('Chat response:', response);
  } catch (error) {
    console.error('Chat request failed:', error);
  }
}

/**
 * EXAMPLE 11: Combining Multiple Advanced Features
 * ================================================
 */
async function advancedCombination() {
  // Global configuration
  setXRequestGlobalOptions({
    headers: {
      'Authorization': 'Bearer API_KEY',
    },
    timeout: 60000,
  });

  // Create advanced request
  const request = XRequestFunction(
    'https://api.example.com/v1',
    {
      method: 'POST',
      retryTimes: 3,
      retryInterval: 2000,
      streamTimeout: 90000,
      middlewares: {
        onRequest: async (url, init) => {
          // Log request details
          console.log(`Request to: ${url}`);
          return [url, { ...init, headers: { ...init?.headers } }];
        },
      },
      transformRequest: (data) => ({
        ...data,
        requestId: Math.random().toString(36),
      }),
      transformResponse: (data) => ({
        success: data.code === 0,
        result: data.data,
      }),
      callbacks: {
        onSuccess: (chunks, headers) => {
          console.log('Request succeeded');
        },
        onError: (error, info, headers) => {
          console.warn('Request failed:', error.message);
          // Return custom retry interval
          return 3000;
        },
        onUpdate: (chunk) => {
          console.log('Update received:', chunk);
        },
      },
    }
  );

  try {
    const result = await request.post('/complex-endpoint', {
      action: 'process',
      data: [1, 2, 3],
    });

    console.log('Final result:', result);
  } catch (error) {
    console.error('Request failed after all retries:', error);
  }
}

export {};
