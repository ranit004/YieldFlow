import { z } from 'zod';
import { insertStrategySchema, insertDepositSchema, strategies, deposits, rebalanceEvents } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  strategies: {
    list: {
      method: 'GET' as const,
      path: '/api/strategies',
      responses: {
        200: z.array(z.custom<typeof strategies.$inferSelect>()),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/strategies/:id',
      input: insertStrategySchema.partial(),
      responses: {
        200: z.custom<typeof strategies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  deposits: {
    list: {
      method: 'GET' as const,
      path: '/api/deposits/:walletAddress',
      responses: {
        200: z.array(z.custom<typeof deposits.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/deposits',
      input: insertDepositSchema,
      responses: {
        201: z.custom<typeof deposits.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  rebalance: {
    execute: {
      method: 'POST' as const,
      path: '/api/rebalance',
      input: z.object({
        walletAddress: z.string(),
      }),
      responses: {
        200: z.object({
          message: z.string(),
          events: z.array(z.custom<typeof rebalanceEvents.$inferSelect>()),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type StrategyResponse = z.infer<typeof api.strategies.list.responses[200]>[0];
export type DepositResponse = z.infer<typeof api.deposits.create.responses[201]>;
