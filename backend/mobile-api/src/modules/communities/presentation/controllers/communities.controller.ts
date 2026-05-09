import {
  Controller, Get, Post, Delete, Patch,
  Param, Body, Request, UseGuards,
  HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/presentation/guards/jwt-auth.guard';
import { GetMyCommunitiesUseCase } from '../../application/use-cases/get-my-communities.use-case';
import { GetCommunityDetailUseCase } from '../../application/use-cases/get-community-detail.use-case';
import { GetPostsUseCase } from '../../application/use-cases/get-posts.use-case';
import { CreatePostUseCase } from '../../application/use-cases/create-post.use-case';
import { DeletePostUseCase } from '../../application/use-cases/delete-post.use-case';
import { GetCommentsUseCase } from '../../application/use-cases/get-comments.use-case';
import { CreateCommentUseCase } from '../../application/use-cases/create-comment.use-case';
import { DeleteCommentUseCase } from '../../application/use-cases/delete-comment.use-case';
import { ReactToPostUseCase } from '../../application/use-cases/react-to-post.use-case';
import { ModGetMembersUseCase } from '../../application/use-cases/moderator/get-members.use-case';
import { ModChangeAccessUseCase } from '../../application/use-cases/moderator/change-access.use-case';
import { ModSuspendMemberUseCase } from '../../application/use-cases/moderator/suspend-member.use-case';
import { ModRequestBanUseCase } from '../../application/use-cases/moderator/request-ban.use-case';
import { ModRemoveMemberUseCase } from '../../application/use-cases/moderator/remove-member.use-case';
import { ModAddMemberUseCase } from '../../application/use-cases/moderator/add-member.use-case';
import { CreatePostDto } from '../dtos/post.dto';
import { CreateCommentDto } from '../dtos/comment.dto';
import { ReactDto } from '../dtos/reaction.dto';
import { ReplyForumDto, ChangeAccessDto, SuspendMemberDto, RequestBanDto, AddMemberDto } from '../dtos/moderator.dto';
import { GetDailyForumUseCase } from '../../application/use-cases/get-daily-forum.use-case';
import { GetDailyForumDetailUseCase } from '../../application/use-cases/get-daily-forum-detail.use-case';
import { ReplyDailyForumUseCase } from '../../application/use-cases/reply-daily-forum.use-case';
import { LikeForumReplyUseCase } from '../../application/use-cases/like-forum-reply.use-case';
import { CommentForumReplyUseCase } from '../../application/use-cases/comment-forum-reply.use-case';
import { GetAllForumsUseCase } from '../../application/use-cases/get-all-forums.use-case';
import { LikeCommentUseCase } from '../../application/use-cases/like-comment.use-case';
import { ReplyToCommentUseCase } from '../../application/use-cases/reply-to-comment.use-case';
import { LikeCommentReplyUseCase } from '../../application/use-cases/like-comment-reply.use-case';
import { DeleteReplyUseCase } from '../../application/use-cases/delete-reply.use-case';

@ApiTags('Comunidades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('communities')
export class CommunitiesController {
  constructor(
    private readonly getMyCommunitiesUseCase: GetMyCommunitiesUseCase,
    private readonly getCommunityDetailUseCase: GetCommunityDetailUseCase,
    private readonly getPostsUseCase: GetPostsUseCase,
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly getCommentsUseCase: GetCommentsUseCase,
    private readonly createCommentUseCase: CreateCommentUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
    private readonly reactToPostUseCase: ReactToPostUseCase,
    private readonly getDailyForumUseCase: GetDailyForumUseCase,
    private readonly getDailyForumDetailUseCase: GetDailyForumDetailUseCase,
    private readonly replyDailyForumUseCase: ReplyDailyForumUseCase,
    private readonly likeForumReplyUseCase: LikeForumReplyUseCase,
    private readonly commentForumReplyUseCase: CommentForumReplyUseCase,
    private readonly modGetMembersUseCase: ModGetMembersUseCase,
    private readonly modChangeAccessUseCase: ModChangeAccessUseCase,
    private readonly modSuspendMemberUseCase: ModSuspendMemberUseCase,
    private readonly modRequestBanUseCase: ModRequestBanUseCase,
    private readonly modRemoveMemberUseCase: ModRemoveMemberUseCase,
    private readonly modAddMemberUseCase: ModAddMemberUseCase,
    private readonly getAllForumsUseCase: GetAllForumsUseCase,
    private readonly likeCommentUseCase: LikeCommentUseCase,
    private readonly replyToCommentUseCase: ReplyToCommentUseCase,
    private readonly likeCommentReplyUseCase: LikeCommentReplyUseCase,
    private readonly deleteReplyUseCase: DeleteReplyUseCase,
  ) { }

  // ── Comunidades ────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Listar mis comunidades' })
  async getMyCommunities(@Request() req: any) {
    return this.getMyCommunitiesUseCase.execute(req.user.uid);
  }

  // ── Foros (rutas estáticas antes de :id) ──────────────────────────────────
  @Get('daily-forum')
  @ApiOperation({ summary: 'Obtener foro del día con comunidades del usuario' })
  async getDailyForum(@Request() req: any) {
    return this.getDailyForumUseCase.execute(req.user.uid);
  }

  @Get('all-forums')
  @ApiOperation({ summary: 'Listar todos los foros del día (histórico)' })
  async getAllForums(@Request() req: any) {
    return this.getAllForumsUseCase.execute(req.user.uid);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de una comunidad' })
  async getCommunityDetail(@Param('id') id: string, @Request() req: any) {
    return this.getCommunityDetailUseCase.execute(id, req.user.uid);
  }

  // ── Posts ──────────────────────────────────────────────────────────────────

  @Get(':id/posts')
  @ApiOperation({ summary: 'Ver feed de posts' })
  async getPosts(@Param('id') id: string, @Request() req: any) {
    return this.getPostsUseCase.execute(id, req.user.uid);
  }

  @Post(':id/posts')
  @ApiOperation({ summary: 'Crear post' })
  async createPost(@Param('id') id: string, @Body() dto: CreatePostDto, @Request() req: any) {
    return this.createPostUseCase.execute(id, req.user.uid, dto.contenido, dto.titulo);
  }

  @Delete(':id/posts/:postId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar post (propio o moderador)' })
  async deletePost(@Param('id') id: string, @Param('postId') postId: string, @Request() req: any) {
    return this.deletePostUseCase.execute(id, postId, req.user.uid);
  }

  // ── Comentarios ────────────────────────────────────────────────────────────

  @Get(':id/posts/:postId/comments')
  @ApiOperation({ summary: 'Ver comentarios de un post' })
  async getComments(@Param('id') id: string, @Param('postId') postId: string, @Request() req: any) {
    return this.getCommentsUseCase.execute(id, postId, req.user.uid);
  }

  @Post(':id/posts/:postId/comments')
  @ApiOperation({ summary: 'Comentar en un post' })
  async createComment(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.createCommentUseCase.execute(id, postId, req.user.uid, dto.contenido);
  }

  @Delete(':id/posts/:postId/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar comentario (propio o moderador)' })
  async deleteComment(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    return this.deleteCommentUseCase.execute(id, postId, commentId, req.user.uid);
  }

  // ── Likes y respuestas de comentarios ─────────────────────────────────────

  @Post(':id/posts/:postId/comments/:commentId/likes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like/unlike a un comentario (toggle)' })
  async likeComment(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    return this.likeCommentUseCase.execute(id, postId, commentId, req.user.uid);
  }

  @Post(':id/posts/:postId/comments/:commentId/replies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Responder a un comentario' })
  async replyToComment(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    return this.replyToCommentUseCase.execute(id, postId, commentId, req.user.uid, dto.contenido);
  }

  @Delete(':id/posts/:postId/comments/:commentId/replies/:replyId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar respuesta a comentario (propio o moderador)' })
  async deleteReply(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Param('replyId') replyId: string,
    @Request() req: any,
  ) {
    return this.deleteReplyUseCase.execute(id, postId, commentId, replyId, req.user.uid);
  }

  @Post(':id/posts/:postId/comments/:commentId/replies/:replyId/likes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like/unlike a una respuesta de comentario (toggle)' })
  async likeCommentReply(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Param('replyId') replyId: string,
    @Request() req: any,
  ) {
    return this.likeCommentReplyUseCase.execute(id, replyId, req.user.uid);
  }

  // ── Reacciones ─────────────────────────────────────────────────────────────

  @Post(':id/posts/:postId/reactions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reaccionar a un post (toggle)' })
  async reactToPost(
    @Param('id') id: string,
    @Param('postId') postId: string,
    @Body() dto: ReactDto,
    @Request() req: any,
  ) {
    return this.reactToPostUseCase.execute(id, postId, req.user.uid, dto.tipo);
  }

  // ── Foros ──────────────────────────────────────────────────────────────────
  @Get(':id/daily-forum/:foroId')
  @ApiOperation({ summary: 'Detalle del foro del día en una comunidad específica' })
  async getDailyForumDetail(
    @Param('id') id: string,
    @Param('foroId') foroId: string,
    @Request() req: any,
  ) {
    return this.getDailyForumDetailUseCase.execute(foroId, id, req.user.uid);
  }

  @Post(':id/daily-forum/:foroId/replies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Responder al foro del día (solo si es hoy)' })
  async replyDailyForum(
    @Param('id') id: string,
    @Param('foroId') foroId: string,
    @Body() dto: ReplyForumDto,
    @Request() req: any,
  ) {
    return this.replyDailyForumUseCase.execute(foroId, id, req.user.uid, dto.contenido);
  }

  @Post(':id/daily-forum/:foroId/replies/:replyId/likes')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Like/unlike a una respuesta del foro (toggle)' })
  async likeForumReply(
    @Param('id') id: string,
    @Param('replyId') replyId: string,
    @Request() req: any,
  ) {
    return this.likeForumReplyUseCase.execute(id, replyId, req.user.uid);
  }

  @Post(':id/daily-forum/:foroId/replies/:replyId/comments')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Comentar en una respuesta del foro (solo si es hoy)' })
  async commentForumReply(
    @Param('id') id: string,
    @Param('foroId') foroId: string,
    @Param('replyId') replyId: string,
    @Body() dto: ReplyForumDto,
    @Request() req: any,
  ) {
    return this.commentForumReplyUseCase.execute(foroId, id, replyId, req.user.uid, dto.contenido);
  }

  // ── Moderador ──────────────────────────────────────────────────────────────

  @Get(':id/members')
  @ApiOperation({ summary: '[MOD] Ver miembros de la comunidad' })
  async getMembers(@Param('id') id: string, @Request() req: any) {
    return this.modGetMembersUseCase.execute(id, req.user.uid);
  }

  @Patch(':id/members/:uid/access')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[MOD] Cambiar tipo de acceso de un miembro' })
  async changeAccess(
    @Param('id') id: string,
    @Param('uid') uid: string,
    @Body() dto: ChangeAccessDto,
    @Request() req: any,
  ) {
    return this.modChangeAccessUseCase.execute(id, uid, req.user.uid, dto.tipoAcceso);
  }

  @Post(':id/members/:uid/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[MOD] Suspender a un miembro N días' })
  async suspendMember(
    @Param('id') id: string,
    @Param('uid') uid: string,
    @Body() dto: SuspendMemberDto,
    @Request() req: any,
  ) {
    return this.modSuspendMemberUseCase.execute(id, uid, req.user.uid, dto.dias);
  }

  @Post(':id/ban-requests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[MOD] Solicitar baneo permanente al admin' })
  async requestBan(
    @Param('id') id: string,
    @Body() dto: RequestBanDto,
    @Request() req: any,
  ) {
    // El body debe incluir el usuario_id del reportado
    return this.modRequestBanUseCase.execute(id, dto.usuario_id, req.user.uid, dto.motivo);
  }

  @Post(':id/members')
  @ApiOperation({ summary: '[MOD] Agregar miembro por correo' })
  async addMember(
    @Param('id') id: string,
    @Body() dto: AddMemberDto,
    @Request() req: any,
  ) {
    return this.modAddMemberUseCase.execute(id, req.user.uid, dto.email, dto.tipoAcceso);
  }

  @Delete(':id/members/:uid')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '[MOD] Expulsar miembro de la comunidad' })
  async removeMember(
    @Param('id') id: string,
    @Param('uid') uid: string,
    @Request() req: any,
  ) {
    return this.modRemoveMemberUseCase.execute(id, uid, req.user.uid);
  }
}