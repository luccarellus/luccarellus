import { createApp } from './app.factory';

async function bootstrap() {
  const app = await createApp();
  const port = process.env.PORT || 3333;
  await app.listen(port);
  console.log(`Backend is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
