// File: api/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DrizzleModule } from './db/drizzle.module'; // <-- Import DrizzleModule
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';


@Module({
  imports: [
    DrizzleModule, // <-- เพิ่ม DrizzleModule ที่นี่
    UsersModule,
    AuthModule,
    PostsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  // ไม่ต้องมี DrizzleProvider และ exports ที่นี่แล้ว
})
export class AppModule {}