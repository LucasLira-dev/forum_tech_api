import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // necessário para Better Auth funcionar
  });

  // Lista de origens permitidas
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://forum-tech.vercel.app',
    process.env.FRONTEND_URL, // opcional
  ].filter(Boolean);

  // 🔥 Middleware manual para CORRIGIR o preflight OPTIONS (necessário no Koyeb)
  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }

    res.header('Access-Control-Allow-Credentials', 'true');
    res.header(
      'Access-Control-Allow-Methods',
      'GET, PUT, POST, PATCH, DELETE, OPTIONS',
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );

    // Se for preflight OPTIONS → responde imediatamente
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });

  // CORS normal do Nest (para as requisições reais)
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Pipes globais
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();