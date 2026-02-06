export interface Comment {
    comment: string;
    created_at: string;
    users: {
        name: string;
        avatar: string;
    };
}

export interface CommentResponse {
    comments: Comment[];
}
