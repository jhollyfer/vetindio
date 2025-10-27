import { Env } from '@start/env';
import { kernel } from '@start/kernel';

kernel.listen({ port: Env.PORT, host: '0.0.0.0' }).then(() => {
  console.info(`HTTP Server running on http://localhost:${Env.PORT}`);
});
