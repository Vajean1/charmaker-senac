# Firestore Community Structure

## Collections

### 1. `posts/`
Each post document contains:
```typescript
{
  id: string (auto-generated)
  author: string (username)
  authorId: string (user ID)
  avatar: string (emoji fallback)
  content: string (post text)
  category: string (e.g., "Compartilhamento", "Reflexão", etc)
  likes: number (total likes count)
  likedBy: string[] (array of user IDs who liked)
  createdAt: Timestamp
  character: {
    gender: string
    bodyType: string
    skinColor: string
    faceOption: string
    hairId: number
  } (optional - character data of post author)
}
```

### 2. `posts/{postId}/comments/`
Each comment document contains:
```typescript
{
  id: string (auto-generated)
  author: string (username)
  authorId: string (user ID)
  content: string (comment text)
  likes: number (total likes count)
  likedBy: string[] (array of user IDs who liked)
  createdAt: Timestamp
  character: {
    gender: string
    bodyType: string
    skinColor: string
    faceOption: string
    hairId: number
  } (optional - character data of commenter)
}
```

## Features Implemented

### Posts
- ✅ Create/Publish posts
- ✅ Display posts from all users
- ✅ Like/Unlike posts
- ✅ Show author's 3D avatar (Avatar3D component)
- ✅ Timestamp with relative time formatting (e.g., "há 2h")
- ✅ Category badges
- ✅ Posts sorted by most recent first

### Comments
- ✅ Add comments to posts
- ✅ Display comments with author's 3D avatar
- ✅ Like/Unlike comments
- ✅ Toggle comments visibility (expand/collapse)
- ✅ Timestamp for comments
- ✅ Comments sorted by most recent first

### User Interactions
- ✅ Track who liked posts (filled heart icon)
- ✅ Track who liked comments
- ✅ Display like counts
- ✅ Display comment counts
- ✅ Comment count shows in post actions

## UI Components Used
- Avatar3D: Renders user's 3D character in posts/comments
- Card: Post and comment containers
- Textarea: Post and comment input
- Button: Submit and toggle actions
- Badge: Category badges
- Icons: Heart, MessageCircle, Share2, Clock, TrendingUp, ArrowLeft

## Styling Features
- Posts gradient background for author avatars: Golden (#FFD700, #FF9800, #FF8C00)
- User's new post/comment avatar gradient: Purple/Violet (#9333ea, #7c3aed, #6d28d9)
- Hover effects on buttons and comments
- Smooth animations on post creation
- Interactive like button with filled/unfilled states
- Relative timestamp formatting

## Real-time Interactions
- Posts load on component mount
- Comments load with each post
- Like updates reflect immediately in UI
- New posts appear at top of feed
- New comments appear in comment section
- Comment count updates automatically

## Notes
- Each user can only see posts that were published (no draft system yet)
- Likes are tracked per user (prevents duplicate likes)
- Characters are optional - if not available, emoji fallback is used
- Time formatting handles: minutes, hours, days, and full dates
