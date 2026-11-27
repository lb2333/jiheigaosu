import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import type { LanguageModel } from 'ai';

export interface ResolvedAiProvider {
  mode: 'openai-compatible' | 'gateway' | 'local-db-fallback';
  model?: LanguageModel | string;
  modelLabel: string;
}

export function resolveAiProvider(): ResolvedAiProvider {
  const compatBase = process.env.AI_OPENAI_COMPAT_BASE_URL?.trim();
  const compatKey = process.env.AI_OPENAI_COMPAT_API_KEY?.trim();
  const modelId = process.env.AI_MODEL_ID?.trim();

  if (compatBase && compatKey) {
    const provider = createOpenAICompatible({
      name: 'jihei-intranet-llm',
      baseURL: compatBase,
      apiKey: compatKey,
    });
    const targetModel = modelId || 'qwen2.5:14b';
    return {
      mode: 'openai-compatible',
      model: provider(targetModel),
      modelLabel: `内网模型 (${targetModel})`,
    };
  }

  if (process.env.AI_GATEWAY_API_KEY?.trim()) {
    const targetModel = modelId || 'openai/gpt-4.1-mini';
    return {
      mode: 'gateway',
      model: targetModel,
      modelLabel: `AI Gateway (${targetModel})`,
    };
  }

  return {
    mode: 'local-db-fallback',
    modelLabel: '本地 PostgreSQL 智能研判引擎（配置 .env.local 可切换实时大模型）',
  };
}
