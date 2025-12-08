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
    
    const allowedOrigins = [
      'https://forum-tech.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
    ];

    // Permite requisições SEM origin (ex: callback OAuth)
    if (!origin) {
      res.header('Access-Control-Allow-Origin', '*');
    } else if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
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
      'Content-Type, Authorization, Accept',
    );

    // Preflight rápido
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });

  // CORS oficial do Nest (para requisições normais)
  app.enableCors({
    origin: [
      'https://forum-tech.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();
