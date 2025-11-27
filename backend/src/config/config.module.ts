import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true, // Torna as variáveis de ambiente disponíveis globalmente
      envFilePath: '.env', // Aponta para o arquivo .env na raiz do projeto
    }),
  ],
})
export class ConfigModule {}
