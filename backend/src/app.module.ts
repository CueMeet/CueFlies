import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import * as depthLimit from 'graphql-depth-limit';
import Modules from './modules';
import { IS_PRODUCTION, REDIS_HOST, REDIS_PORT } from './constants/config';
import {
  CustomContext,
  operationLoggingPlugin,
} from './utils/helpers/operation-logging.plugin';
import { formatGraphQLError } from './utils/helpers/graphql-error.formatter';
import { PostgresDatabaseModule } from './database/postgres/database.module';
import { join } from 'path';
import { CalendarModule } from './modules/calendar/calendar.module';
import { JwtAuthModule } from './providers/jwt/jwt.module';
import { BullModule } from '@nestjs/bull';
import { ScheduleModule } from '@nestjs/schedule';
import IORedis from 'ioredis';

const connection = new IORedis({
  host: REDIS_HOST,
  port: REDIS_PORT,
});

console.log(connection.status);

@Module({
  imports: [
    ScheduleModule.forRoot(),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      include: Modules,
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      path: '/graphql',
      formatError: formatGraphQLError,
      playground: !IS_PRODUCTION,
      validationRules: [depthLimit(5)],
      context: ({ req, res }): CustomContext => {
        req.requestStartTime = Date.now();
        return { req, res };
      },
      plugins: !IS_PRODUCTION ? [operationLoggingPlugin] : [],
    }),
    BullModule.forRoot({
      redis: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
    }),
    PostgresDatabaseModule,
    CalendarModule,
    JwtAuthModule,
    ...Modules,
  ],
})
export class AppModule {}
