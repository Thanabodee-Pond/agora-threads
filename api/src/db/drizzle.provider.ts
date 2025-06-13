import { Provider } from '@nestjs/common';
import { db } from './index';

export const DRIZZLE_ORM_TOKEN = 'DRIZZLE_ORM';

export const DrizzleProvider: Provider = {
  provide: DRIZZLE_ORM_TOKEN,
  useValue: db,
};