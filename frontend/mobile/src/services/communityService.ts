import api from './api';

// ── Comunidades ───────────────────────────────────────────────────────────────

export const getMyCommunities = async () => {
  const res = await api.get('/communities');
  return res.data;
};

export const getCommunityDetail = async (id: string) => {
  const res = await api.get(`/communities/${id}`);
  return res.data;
};

// ── Posts ─────────────────────────────────────────────────────────────────────

export const getPosts = async (communityId: string) => {
  const res = await api.get(`/communities/${communityId}/posts`);
  return res.data;
};

export const createPost = async (communityId: string, contenido: string, titulo?: string) => {
  const res = await api.post(`/communities/${communityId}/posts`, { contenido, titulo });
  return res.data;
};

export const deletePost = async (communityId: string, postId: string) => {
  const res = await api.delete(`/communities/${communityId}/posts/${postId}`);
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

export const getComments = async (communityId: string, postId: string) => {
  const res = await api.get(`/communities/${communityId}/posts/${postId}/comments`);
  return res.data;
};

export const createComment = async (communityId: string, postId: string, contenido: string) => {
  const res = await api.post(`/communities/${communityId}/posts/${postId}/comments`, { contenido });
  return res.data;
};

export const deleteComment = async (communityId: string, postId: string, commentId: string) => {
  const res = await api.delete(`/communities/${communityId}/posts/${postId}/comments/${commentId}`);
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
  return res.data;
};

export const deleteReply = async (communityId: string, postId: string, commentId: string, replyId: string) => {
  const res = await api.delete(`/communities/${communityId}/posts/${postId}/comments/${commentId}/replies/${replyId}`);
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

// Foro del día
export const getDailyForum = async () => {
  const res = await api.get('/communities/daily-forum');
  return res.data;
};

export const getDailyForumDetail = async (communityId: string, foroId: string) => {
  const res = await api.get(`/communities/${communityId}/daily-forum/${foroId}`);
  return res.data;
};

export const replyDailyForum = async (communityId: string, foroId: string, contenido: string) => {
  const res = await api.post(`/communities/${communityId}/daily-forum/${foroId}/replies`, { contenido });
  return res.data;
};

export const likeForumReply = async (communityId: string, foroId: string, replyId: string) => {
  const res = await api.post(`/communities/${communityId}/daily-forum/${foroId}/replies/${replyId}/likes`);
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
  return res.data;
};

export const getAllForums = async () => {
  const res = await api.get('/communities/all-forums');
  return res.data;
};

// ── Moderador ─────────────────────────────────────────────────────────────────

export const getMembers = async (communityId: string) => {
  const res = await api.get(`/communities/${communityId}/members`);
  return res.data;
};

export const changeMemberAccess = async (
  communityId: string,
  uid: string,
  tipoAcceso: string,
) => {
  const res = await api.patch(`/communities/${communityId}/members/${uid}/access`, { tipoAcceso });
  return res.data;
};

export const suspendMember = async (communityId: string, uid: string, dias: number) => {
  const res = await api.post(`/communities/${communityId}/members/${uid}/suspend`, { dias });
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
  return res.data;
};

export const removeMember = async (communityId: string, uid: string) => {
  const res = await api.delete(`/communities/${communityId}/members/${uid}`);
  return res.data;
};
