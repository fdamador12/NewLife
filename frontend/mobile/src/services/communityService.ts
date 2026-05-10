import api from './api';
import { communityCache, CK, TTL } from './communityCache';

// ── Comunidades ───────────────────────────────────────────────────────────────

export const getMyCommunities = async (force = false) => {
  if (!force) {
    const cached = communityCache.get<any[]>(CK.communities, TTL.communities);
    if (cached) return cached;
  }
  const res = await api.get('/communities');
  communityCache.set(CK.communities, res.data);
  return res.data;
};

export const getCommunityDetail = async (id: string, force = false) => {
  const key = CK.detail(id);
  if (!force) {
    const cached = communityCache.get<any>(key, TTL.communities);
    if (cached) return cached;
  }
  const res = await api.get(`/communities/${id}`);
  communityCache.set(key, res.data);
  return res.data;
};

// ── Posts ─────────────────────────────────────────────────────────────────────

export const getPosts = async (communityId: string, force = false) => {
  const key = CK.posts(communityId);
  if (!force) {
    const cached = communityCache.get<any[]>(key, TTL.posts);
    if (cached) return cached;
  }
  const res = await api.get(`/communities/${communityId}/posts`);
  communityCache.set(key, res.data);
  return res.data;
};

export const createPost = async (communityId: string, contenido: string, titulo?: string) => {
  const res = await api.post(`/communities/${communityId}/posts`, { contenido, titulo });
  communityCache.invalidate(CK.posts(communityId), CK.socialFeed);
  return res.data;
};

export const deletePost = async (communityId: string, postId: string) => {
  const res = await api.delete(`/communities/${communityId}/posts/${postId}`);
  communityCache.invalidate(CK.posts(communityId), CK.socialFeed);
  return res.data;
};

export const getUserPosts = async () => {
  const res = await api.get('/user/posts');
  return res.data;
};

export const getUserPostsById = async (robleId: string) => {
  const res = await api.get(`/user/${robleId}/posts`);
  return res.data;
};

// ── Comentarios ───────────────────────────────────────────────────────────────

export const getComments = async (communityId: string, postId: string, force = false) => {
  const key = CK.comments(communityId, postId);
  if (!force) {
    const cached = communityCache.get<any[]>(key, TTL.comments);
    if (cached) return cached;
  }
  const res = await api.get(`/communities/${communityId}/posts/${postId}/comments`);
  communityCache.set(key, res.data);
  return res.data;
};

export const createComment = async (communityId: string, postId: string, contenido: string) => {
  const res = await api.post(`/communities/${communityId}/posts/${postId}/comments`, { contenido });
  communityCache.invalidate(CK.comments(communityId, postId));
  return res.data;
};

export const deleteComment = async (communityId: string, postId: string, commentId: string) => {
  const res = await api.delete(`/communities/${communityId}/posts/${postId}/comments/${commentId}`);
  communityCache.invalidate(CK.comments(communityId, postId));
  return res.data;
};

export const likeComment = async (communityId: string, postId: string, commentId: string) => {
  const res = await api.post(`/communities/${communityId}/posts/${postId}/comments/${commentId}/likes`);
  return res.data;
};

export const replyToComment = async (
  communityId: string,
  postId: string,
  commentId: string,
  contenido: string,
) => {
  const res = await api.post(
    `/communities/${communityId}/posts/${postId}/comments/${commentId}/replies`,
    { contenido },
  );
  communityCache.invalidate(CK.comments(communityId, postId));
  return res.data;
};

export const deleteReply = async (
  communityId: string,
  postId: string,
  commentId: string,
  replyId: string,
) => {
  const res = await api.delete(
    `/communities/${communityId}/posts/${postId}/comments/${commentId}/replies/${replyId}`,
  );
  communityCache.invalidate(CK.comments(communityId, postId));
  return res.data;
};

export const likeCommentReply = async (
  communityId: string,
  postId: string,
  commentId: string,
  replyId: string,
) => {
  const res = await api.post(
    `/communities/${communityId}/posts/${postId}/comments/${commentId}/replies/${replyId}/likes`,
  );
  return res.data;
};

// ── Reacciones ────────────────────────────────────────────────────────────────

export const reactToPost = async (communityId: string, postId: string, tipo: string) => {
  const res = await api.post(`/communities/${communityId}/posts/${postId}/reactions`, { tipo });
  return res.data;
};

// ── Foros ─────────────────────────────────────────────────────────────────────

export const getDailyForum = async (force = false) => {
  if (!force) {
    const cached = communityCache.get<any>(CK.dailyForum, TTL.dailyForum);
    if (cached) return cached;
  }
  const res = await api.get('/communities/daily-forum');
  communityCache.set(CK.dailyForum, res.data);
  return res.data;
};

export const getDailyForumDetail = async (communityId: string, foroId: string, force = false) => {
  const key = CK.forumDetail(communityId, foroId);
  if (!force) {
    const cached = communityCache.get<any>(key, TTL.forumDetail);
    if (cached) return cached;
  }
  const res = await api.get(`/communities/${communityId}/daily-forum/${foroId}`);
  communityCache.set(key, res.data);
  return res.data;
};

export const replyDailyForum = async (communityId: string, foroId: string, contenido: string) => {
  const res = await api.post(`/communities/${communityId}/daily-forum/${foroId}/replies`, { contenido });
  communityCache.invalidate(CK.forumDetail(communityId, foroId), CK.dailyForum);
  return res.data;
};

export const likeForumReply = async (communityId: string, foroId: string, replyId: string) => {
  const res = await api.post(
    `/communities/${communityId}/daily-forum/${foroId}/replies/${replyId}/likes`,
  );
  return res.data;
};

export const commentForumReply = async (
  communityId: string,
  foroId: string,
  replyId: string,
  contenido: string,
) => {
  const res = await api.post(
    `/communities/${communityId}/daily-forum/${foroId}/replies/${replyId}/comments`,
    { contenido },
  );
  communityCache.invalidate(CK.forumDetail(communityId, foroId));
  return res.data;
};

export const getAllForums = async (force = false) => {
  if (!force) {
    const cached = communityCache.get<any>(CK.allForums, TTL.allForums);
    if (cached) return cached;
  }
  const res = await api.get('/communities/all-forums');
  communityCache.set(CK.allForums, res.data);
  return res.data;
};

// ── Moderador ─────────────────────────────────────────────────────────────────

export const getMembers = async (communityId: string, force = false) => {
  const key = CK.members(communityId);
  if (!force) {
    const cached = communityCache.get<any[]>(key, TTL.members);
    if (cached) return cached;
  }
  const res = await api.get(`/communities/${communityId}/members`);
  communityCache.set(key, res.data);
  return res.data;
};

export const changeMemberAccess = async (communityId: string, uid: string, tipoAcceso: string) => {
  const res = await api.patch(`/communities/${communityId}/members/${uid}/access`, { tipoAcceso });
  communityCache.invalidate(CK.members(communityId));
  return res.data;
};

export const suspendMember = async (communityId: string, uid: string, dias: number) => {
  const res = await api.post(`/communities/${communityId}/members/${uid}/suspend`, { dias });
  communityCache.invalidate(CK.members(communityId));
  return res.data;
};

export const requestBan = async (communityId: string, usuario_id: string, motivo: string) => {
  const res = await api.post(`/communities/${communityId}/ban-requests`, { usuario_id, motivo });
  return res.data;
};

export const addMember = async (
  communityId: string,
  email: string,
  tipoAcceso: string = 'POSTEAR_COMENTAR',
) => {
  const res = await api.post(`/communities/${communityId}/members`, { email, tipoAcceso });
  communityCache.invalidate(CK.members(communityId));
  return res.data;
};

export const removeMember = async (communityId: string, uid: string) => {
  const res = await api.delete(`/communities/${communityId}/members/${uid}`);
  communityCache.invalidate(CK.members(communityId));
  return res.data;
};

// ── Chat ──────────────────────────────────────────────────────────────────────

export const getChatHistory = async (communityId: string, limit = 50) => {
  const res = await api.get(`/chat/${communityId}/messages`, { params: { limit } });
  return res.data;
};
