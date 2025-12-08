import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // necessário para Better Auth
  });

  // 🔥 CORS FIX PARA LOGIN SOCIAL (Google/GitHub)
  // Corrige o problema do 'state_mismatch'
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    // Permite requisições SEM origin (ex: callback OAuth)
    if (!origin) {
      res.header('Access-Control-Allow-Origin', '*');
    } else {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );

    // Preflight rápido
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });

  // CORS oficial do Nest (para requisições normais)
  app.enableCors({
    origin: true, // permite qualquer origem válida
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
