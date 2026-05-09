import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { CommunitiesController } from './presentation/controllers/communities.controller';
import { ResolveUserIdHelper } from './application/helpers/resolve-user-id.helper';
import { GetMyCommunitiesUseCase } from './application/use-cases/get-my-communities.use-case';
import { GetCommunityDetailUseCase } from './application/use-cases/get-community-detail.use-case';
import { GetPostsUseCase } from './application/use-cases/get-posts.use-case';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post.use-case';
import { GetCommentsUseCase } from './application/use-cases/get-comments.use-case';
import { CreateCommentUseCase } from './application/use-cases/create-comment.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { ReactToPostUseCase } from './application/use-cases/react-to-post.use-case';
import { ModGetMembersUseCase } from './application/use-cases/moderator/get-members.use-case';
import { ModChangeAccessUseCase } from './application/use-cases/moderator/change-access.use-case';
import { ModSuspendMemberUseCase } from './application/use-cases/moderator/suspend-member.use-case';
import { ModRequestBanUseCase } from './application/use-cases/moderator/request-ban.use-case';
import { ModRemoveMemberUseCase } from './application/use-cases/moderator/remove-member.use-case';
import { ModAddMemberUseCase } from './application/use-cases/moderator/add-member.use-case';
import { GetDailyForumUseCase } from './application/use-cases/get-daily-forum.use-case';
import { GetDailyForumDetailUseCase } from './application/use-cases/get-daily-forum-detail.use-case';
import { ReplyDailyForumUseCase } from './application/use-cases/reply-daily-forum.use-case';
import { LikeForumReplyUseCase } from './application/use-cases/like-forum-reply.use-case';
import { CommentForumReplyUseCase } from './application/use-cases/comment-forum-reply.use-case';
import { GetAllForumsUseCase } from './application/use-cases/get-all-forums.use-case';
import { LikeCommentUseCase } from './application/use-cases/like-comment.use-case';
import { ReplyToCommentUseCase } from './application/use-cases/reply-to-comment.use-case';
import { LikeCommentReplyUseCase } from './application/use-cases/like-comment-reply.use-case';
import { DeleteReplyUseCase } from './application/use-cases/delete-reply.use-case';

@Module({
  imports: [AuthModule, DatabaseModule],
  controllers: [CommunitiesController],
  providers: [
    ResolveUserIdHelper,
    GetMyCommunitiesUseCase,
    GetCommunityDetailUseCase,
    GetPostsUseCase,
    CreatePostUseCase,
    DeletePostUseCase,
    GetCommentsUseCase,
    CreateCommentUseCase,
    DeleteCommentUseCase,
    ReactToPostUseCase,
    ModGetMembersUseCase,
    ModChangeAccessUseCase,
    ModSuspendMemberUseCase,
    ModRequestBanUseCase,
    ModRemoveMemberUseCase,
    ModAddMemberUseCase,
    GetDailyForumUseCase,
    GetDailyForumDetailUseCase,
    ReplyDailyForumUseCase,
    LikeForumReplyUseCase,
    CommentForumReplyUseCase,
    GetAllForumsUseCase,
    LikeCommentUseCase,
    ReplyToCommentUseCase,
    LikeCommentReplyUseCase,
    DeleteReplyUseCase,
  ],
  exports: [ResolveUserIdHelper]
})
export class CommunitiesModule { }