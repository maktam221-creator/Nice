import { supabase } from '../AuthContext';
import { Post, User, Comment, Bucket } from '../../types';
import { RealtimeChannel } from '@supabase/supabase-js';


/**
 * Uploads a media file to a specified Supabase Storage bucket.
 * @param file The file to upload.
 * @param bucket The name of the storage bucket (e.g., 'posts', 'reels').
 * @param userId The ID of the user uploading the file, used for creating a unique path.
 * @returns The public URL of the uploaded file.
 */
export const uploadMedia = async (file: File, bucket: string, userId: string): Promise<string> => {
    if (!file || !bucket || !userId) {
        throw new Error('File, bucket, and user ID are required for media upload.');
    }

    const fileExtension = file.name.split('.').pop();
    // Create a unique path to avoid name collisions.
    const filePath = `${userId}/${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw uploadError;
    }

    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
        
    if (!data.publicUrl) {
        console.error('Error getting public URL');
        throw new Error('Could not get public URL for the uploaded file.');
    }

    return data.publicUrl;
};

// --- Data Transformation Helpers ---
export const fromProfileSnakeCase = (profile: any): User | null => {
    if (!profile) return null;
    return {
        uid: profile.id,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        gender: profile.gender,
        country: profile.country,
        isOnline: true, // Placeholder, real-time status would require presence channels
    };
};

export const fromPostSnakeCase = (post: any): Post => {
    const author = fromProfileSnakeCase(post.author);
    if (!author) {
        throw new Error(`Post with id ${post.id} has no author.`);
    }
    return {
        id: post.id,
        text: post.text,
        imageUrl: post.image_url,
        videoUrl: post.video_url,
        timestamp: new Date(post.created_at),
        author: author,
        // Counts and user-specific booleans are added later
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
        isSaved: false,
    };
};

export const fromCommentSnakeCase = (comment: any): Comment => {
    const author = fromProfileSnakeCase(comment.author);
    if (!author) {
        throw new Error(`Comment with id ${comment.id} has no author.`);
    }
    return {
        id: comment.id,
        text: comment.text,
        author: author,
    };
};

// --- Bucket Functions ---
export const getBucketsForUser = async (userId: string): Promise<Bucket[]> => {
    const { data, error } = await supabase
        .from('buckets')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const createBucket = async (userId: string, name: string): Promise<Bucket> => {
    const { data, error } = await supabase
        .from('buckets')
        .insert({ user_id: userId, name })
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const addPostToBucket = async (postId: number, bucketId: number) => {
    const { error } = await supabase
        .from('bucket_posts')
        .insert({ post_id: postId, bucket_id: bucketId });
    if (error) throw error;
};

export const removePostFromBucket = async (postId: number, bucketId: number) => {
    const { error } = await supabase
        .from('bucket_posts')
        .delete()
        .match({ post_id: postId, bucket_id: bucketId });
    if (error) throw error;
};

export const getBucketsForPost = async (postId: number, userId: string): Promise<number[]> => {
    const { data, error } = await supabase
        .from('bucket_posts')
        .select('buckets!inner(id)')
        .eq('post_id', postId)
        .eq('buckets.user_id', userId);

    if (error) {
        console.error("Error fetching buckets for post:", error);
        throw error;
    }
    return data.map(item => item.buckets!.id);
};

export const getPostsInBucket = async (bucketId: number, currentUserId: string): Promise<Post[]> => {
    const { data, error } = await supabase
        .from('bucket_posts')
        .select('posts!inner(*), buckets!inner(id)')
        .eq('bucket_id', bucketId)
        .eq('buckets.user_id', currentUserId)
        .order('created_at', { foreignTable: 'posts', ascending: false });
    
    if (error) throw error;
    if (!data) return [];
    
    const rawPosts = data.map(item => item.posts).filter(Boolean);
    if (rawPosts.length === 0) return [];
    
    const authorIds = [...new Set(rawPosts.map(p => p.author_uid).filter(Boolean))];
    if (authorIds.length === 0) return [];

    const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', authorIds);

    if (profilesError) throw profilesError;

    const profilesMap = profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
    }, {} as Record<string, any>);
    
    const postsData = rawPosts
        .map(post => ({ ...post, author: profilesMap[post.author_uid] }))
        .filter(p => p.author);


    const postIds = postsData.map(p => p.id);
    if (postIds.length === 0) return [];

    const [allLikes, allComments] = await Promise.all([
        supabase.from('likes').select('post_id, user_id').in('post_id', postIds),
        supabase.from('comments').select('post_id').in('post_id', postIds),
    ]);

    if (allLikes.error || allComments.error) {
        console.error(allLikes.error || allComments.error);
        throw new Error("Failed to fetch post details for bucket");
    }

    const likesMap = allLikes.data.reduce((acc, like) => { acc[like.post_id] = (acc[like.post_id] || 0) + 1; return acc; }, {} as Record<number, number>);
    const commentsMap = allComments.data.reduce((acc, comment) => { acc[comment.post_id] = (acc[comment.post_id] || 0) + 1; return acc; }, {} as Record<number, number>);
    const userLikedIds = new Set(allLikes.data.filter(l => l.user_id === currentUserId).map(l => l.post_id));

    return postsData.map(p => ({
        ...fromPostSnakeCase(p),
        likes: likesMap[p.id] || 0,
        comments: commentsMap[p.id] || 0,
        isLiked: userLikedIds.has(p.id),
        isSaved: true,
    }));
};

// --- Fetch Functions ---

export const getPostsWithDetails = async (currentUserId: string) => {
    const { data: rawPosts, error: postsError } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

    if (postsError) throw postsError;
    
    const authorIds = [...new Set(rawPosts.map(p => p.author_uid).filter(Boolean))];
    if (authorIds.length === 0) {
        return { posts: [], comments: {} };
    }

    const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', authorIds);

    if (profilesError) throw profilesError;

    const profilesMap = profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
    }, {} as Record<string, any>);

    const postsData = rawPosts
        .map(post => ({
            ...post,
            author: profilesMap[post.author_uid]
        }))
        .filter(p => p.author);

    const postIds = postsData.map(p => p.id);
    if (postIds.length === 0) {
        return { posts: [], comments: {} };
    }

    const [allLikes, allComments, userBucketPosts] = await Promise.all([
        supabase.from('likes').select('post_id, user_id').in('post_id', postIds),
        supabase.from('comments').select('*, author:profiles!author_uid(*)').in('post_id', postIds).order('created_at', { ascending: true }),
        supabase.from('bucket_posts').select('post_id, buckets!inner(*)').in('post_id', postIds).eq('buckets.user_id', currentUserId)
    ]);
    
    if (allLikes.error || allComments.error || userBucketPosts.error) {
        console.error(allLikes.error || allComments.error || userBucketPosts.error);
        throw new Error("Failed to fetch post details");
    }

    const likesMap = allLikes.data.reduce((acc, like) => { acc[like.post_id] = (acc[like.post_id] || 0) + 1; return acc; }, {} as Record<number, number>);
    const commentsMap = allComments.data.reduce((acc, comment) => { acc[comment.post_id] = (acc[comment.post_id] || 0) + 1; return acc; }, {} as Record<number, number>);
    const userLikedIds = new Set(allLikes.data.filter(l => l.user_id === currentUserId).map(l => l.post_id));
    const userSavedIds = new Set(userBucketPosts.data.map(s => s.post_id));

    const finalPosts: Post[] = postsData.map(p => ({
        ...fromPostSnakeCase(p),
        likes: likesMap[p.id] || 0,
        comments: commentsMap[p.id] || 0,
        isLiked: userLikedIds.has(p.id),
        isSaved: userSavedIds.has(p.id),
    }));

    const finalComments: Record<number, Comment[]> = allComments.data.reduce((acc, comment) => {
        const postId = comment.post_id;
        if (!acc[postId]) acc[postId] = [];
        acc[postId].push(fromCommentSnakeCase(comment));
        return acc;
    }, {} as Record<number, Comment[]>);

    return { posts: finalPosts, comments: finalComments };
};

export const getAllUsers = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('profiles').select('*');
    if (error) throw error;
    return data.map(fromProfileSnakeCase).filter((u): u is User => u !== null);
};

export const getFollowingList = async (userId: string): Promise<string[]> => {
    const { data, error } = await supabase.from('followers').select('following_uid').eq('follower_uid', userId);
    if (error) throw error;
    return data.map(item => item.following_uid);
};


// --- Mutation Functions ---
export const addPost = async (post: { author_uid: string, text: string, image_url?: string, video_url?: string }): Promise<Post> => {
    const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select('*, author:profiles!author_uid(*)')
        .single();
    if (error) throw error;
    return fromPostSnakeCase(data);
};

export const updatePostText = async (postId: number, text: string) => {
    const { error } = await supabase.from('posts').update({ text }).eq('id', postId);
    if (error) throw error;
};

export const deletePostById = async (postId: number) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) throw error;
};

export const toggleLikePost = async (postId: number, userId: string, isLiked: boolean) => {
    if (isLiked) {
        const { error } = await supabase.from('likes').delete().match({ post_id: postId, user_id: userId });
        if (error) throw error;
    } else {
        const { error } = await supabase.from('likes').insert({ post_id: postId, user_id: userId });
        if (error) throw error;
    }
};

// Deprecated in favor of bucket system
export const toggleSavePost = async (postId: number, userId: string, isSaved: boolean) => {
    // This function is no longer used for saving. The new bucket modal handles this logic.
    // It can be removed or left here if some other part of the app uses it.
    // For this change, we assume it's replaced.
};

export const addCommentToPost = async (postId: number, userId: string, text: string): Promise<Comment> => {
    const { data, error } = await supabase
        .from('comments')
        .insert({ post_id: postId, author_uid: userId, text })
        .select('*, author:profiles!author_uid(*)')
        .single();
    if (error) throw error;
    return fromCommentSnakeCase(data);
};

export const toggleFollowUser = async (currentUserId: string, targetUserId: string, isFollowing: boolean) => {
    if (isFollowing) {
        const { error } = await supabase.from('followers').delete().match({ follower_uid: currentUserId, following_uid: targetUserId });
        if (error) throw error;
    } else {
        const { error } = await supabase.from('followers').insert({ follower_uid: currentUserId, following_uid: targetUserId });
        if (error) throw error;
    }
};

// --- Real-time Subscriptions ---
export const onPostsChanges = (
    handleNewPost: (post: any) => void,
    handleUpdatePost: (post: any) => void,
    handleDeletePost: (postId: number) => void
): RealtimeChannel => {
    const channel = supabase.channel('public:posts');
    channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, async (payload) => {
            const { data, error } = await supabase.from('posts').select('*, author:profiles!author_uid(*)').eq('id', payload.new.id).single();
            if (error) { console.error("Error fetching new post with profile", error); return; }
            handleNewPost(data);
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'posts' }, (payload) => {
            handleUpdatePost(payload.new);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'posts' }, (payload) => {
            handleDeletePost(payload.old.id);
        })
        .subscribe();
    return channel;
};

export const onLikesChanges = (
    handleNewLike: (like: any) => void,
    handleDeleteLike: (like: any) => void
): RealtimeChannel => {
    const channel = supabase.channel('public:likes');
    channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'likes' }, (payload) => {
            handleNewLike(payload.new);
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'likes' }, (payload) => {
            handleDeleteLike(payload.old);
        })
        .subscribe();
    return channel;
};

export const onCommentsChanges = (
    handleNewComment: (comment: any) => void
): RealtimeChannel => {
    const channel = supabase.channel('public:comments');
    channel
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, async (payload) => {
            const { data, error } = await supabase.from('comments').select('*, author:profiles!author_uid(*)').eq('id', payload.new.id).single();
            if (error) { console.error("Error fetching new comment with profile", error); return; }
            handleNewComment(data);
        })
        .subscribe();
    return channel;
};