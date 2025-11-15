# 💡 Community - Dicas de Desenvolvimento

## 🔍 Como Debugar

### Verificar Posts Salvos
```javascript
// No console do navegador
firebase.firestore().collection('posts').get().then(snap => {
  snap.forEach(doc => console.log(doc.data()))
})
```

### Verificar Comentários
```javascript
firebase.firestore().collection('posts').doc('POST_ID').collection('comments').get().then(snap => {
  snap.forEach(doc => console.log(doc.data()))
})
```

### Verificar Usuário Autenticado
```javascript
firebase.auth().currentUser
```

---

## 🚀 Como Adicionar Novas Funcionalidades

### 1. Editar Post

```typescript
const handleEditPost = async (postId: string, newContent: string) => {
  try {
    await updateDoc(doc(db, 'posts', postId), {
      content: newContent,
      editedAt: Timestamp.now()
    });
    // Atualizar UI
  } catch (e) {
    console.error('Erro ao editar:', e);
  }
};
```

### 2. Deletar Post

```typescript
const handleDeletePost = async (postId: string) => {
  try {
    // Deletar todos os comentários primeiro
    const commentsQuery = query(
      collection(db, 'posts', postId, 'comments')
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    commentsSnapshot.forEach(doc => deleteDoc(doc.ref));
    
    // Deletar o post
    await deleteDoc(doc(db, 'posts', postId));
    
    // Atualizar UI
    setPosts(posts.filter(p => p.id !== postId));
  } catch (e) {
    console.error('Erro ao deletar:', e);
  }
};
```

### 3. Filtrar por Categoria

```typescript
const filteredPosts = activeTab === 'recent' 
  ? posts 
  : posts.sort((a, b) => b.likes - a.likes);

// Ou com categoria:
const filteredPosts = posts.filter(p => p.category === selectedCategory);
```

### 4. Buscar Posts

```typescript
const [searchQuery, setSearchQuery] = useState('');

const filteredPosts = posts.filter(post =>
  post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
  post.author.toLowerCase().includes(searchQuery.toLowerCase())
);
```

### 5. Imagens em Posts

```typescript
// Adicionar ao Post type:
interface Post {
  // ... campos existentes
  imageUrl?: string;
}

// No handler:
const handleSubmitPost = async () => {
  // Upload para Firebase Storage
  const storageRef = ref(storage, `posts/${postId}/image`);
  const uploadedUrl = await uploadBytes(storageRef, imageFile);
  
  // Salvar URL em Firestore
  await setDoc(doc(db, 'posts', postId), {
    // ... dados do post
    imageUrl: uploadedUrl
  });
};

// No JSX:
{post.imageUrl && <img src={post.imageUrl} alt="Post" />}
```

---

## 🔄 Otimizações

### 1. Lazy Load Comentários

```typescript
// Em vez de carregar tudo de uma vez:
const [expandedComments, setExpandedComments] = useState<{[key: string]: Comment[]}>({});

const toggleComments = async (postId: string) => {
  if (expandedComments[postId]) {
    // Já carregado, just toggle
    setExpandedComments(prev => {
      const newState = {...prev};
      delete newState[postId];
      return newState;
    });
  } else {
    // Carregar comentários apenas quando expandir
    const commentsSnap = await getDocs(
      query(
        collection(db, 'posts', postId, 'comments'),
        orderBy('createdAt', 'desc')
      )
    );
    const comments = commentsSnap.docs.map(doc => ({...} as Comment));
    setExpandedComments(prev => ({...prev, [postId]: comments}));
  }
};
```

### 2. Pagination

```typescript
const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
const [hasMore, setHasMore] = useState(true);

const loadMorePosts = async () => {
  const postsQuery = lastVisibleDoc
    ? query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        startAfter(lastVisibleDoc),
        limit(10)
      )
    : query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
  
  const snapshot = await getDocs(postsQuery);
  const newPosts = snapshot.docs.map(doc => ({...} as Post));
  setPosts(prev => [...prev, ...newPosts]);
  setLastVisibleDoc(snapshot.docs[snapshot.docs.length - 1]);
  setHasMore(snapshot.docs.length === 10);
};
```

### 3. Cache Local

```typescript
const [cachedPosts, setCachedPosts] = useState<Post[]>([]);

// Salvar em localStorage
const saveToCache = (posts: Post[]) => {
  localStorage.setItem('community_posts', JSON.stringify(posts));
};

// Carregar do cache
const loadFromCache = (): Post[] => {
  const cached = localStorage.getItem('community_posts');
  return cached ? JSON.parse(cached) : [];
};

// Usar:
useEffect(() => {
  const cached = loadFromCache();
  if (cached.length > 0) setPosts(cached);
  
  loadPosts().then(newPosts => {
    setPosts(newPosts);
    saveToCache(newPosts);
  });
}, []);
```

---

## 🧪 Testes com Cypress

```typescript
// cypress/e2e/community.cy.ts

describe('Community', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/community');
  });

  it('should publish a post', () => {
    cy.get('textarea').type('Meu primeiro post');
    cy.get('button:contains("Publicar")').click();
    cy.get('p:contains("Meu primeiro post")').should('exist');
  });

  it('should comment on a post', () => {
    cy.get('[data-testid="comment-button"]').first().click();
    cy.get('input[placeholder*="Escrever"]').type('Ótimo post!');
    cy.get('button:contains("Enviar")').click();
    cy.get('p:contains("Ótimo post!")').should('exist');
  });

  it('should like a post', () => {
    cy.get('[data-testid="like-button"]').first().click();
    cy.get('[data-testid="like-count"]').first().should('contain', '1');
  });
});
```

---

## 📊 Analytics (Opcional)

```typescript
// Rastrear engajamento
const trackPostEngagement = (postId: string, action: 'view' | 'like' | 'comment') => {
  // Firebase Analytics
  logEvent(analytics, 'post_engagement', {
    post_id: postId,
    action: action,
    timestamp: new Date(),
    user_id: auth.currentUser?.uid
  });
};

// Usar:
handleLike: () => {
  trackPostEngagement(postId, 'like');
  // ... código existente
};
```

---

## 🔐 Validações Avançadas

### Rate Limiting

```typescript
const [lastPostTime, setLastPostTime] = useState(0);
const POST_COOLDOWN = 30000; // 30 segundos

const handleSubmitPost = async () => {
  const now = Date.now();
  if (now - lastPostTime < POST_COOLDOWN) {
    alert('Aguarde antes de publicar outro post');
    return;
  }
  
  // ... código existente
  setLastPostTime(now);
};
```

### Content Filtering

```typescript
const bannedWords = ['spam', 'offensive'];

const isContentValid = (content: string): boolean => {
  return !bannedWords.some(word => 
    content.toLowerCase().includes(word)
  );
};

const handleSubmitPost = async () => {
  if (!isContentValid(newPost)) {
    alert('Seu post contém conteúdo inadequado');
    return;
  }
  // ... código existente
};
```

---

## 🎯 Métricas para Rastrear

```typescript
interface PostMetrics {
  postId: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  engagementRate: number;
}

const calculateEngagement = (post: Post): PostMetrics => {
  const engagementRate = (post.likes + post.comments.length) / (post.viewCount || 1);
  return {
    postId: post.id,
    viewCount: post.viewCount || 0,
    likeCount: post.likes,
    commentCount: post.comments.length,
    shareCount: 0, // Se implementar share
    engagementRate
  };
};
```

---

## 🌍 Internacionalização

```typescript
const i18n = {
  pt: {
    community: 'Comunidade',
    shareExperiences: 'Compartilhe experiências',
    publish: 'Publicar',
    comment: 'Comentar',
    like: 'Curtir',
    noPostsYet: 'Nenhum post ainda'
  },
  en: {
    community: 'Community',
    shareExperiences: 'Share your experiences',
    publish: 'Publish',
    comment: 'Comment',
    like: 'Like',
    noPostsYet: 'No posts yet'
  }
};

// Usar:
<h1>{i18n[language].community}</h1>
```

---

## 📈 Escalabilidade

Para quando tiver muitos posts:

1. **Índices Firestore** - Criar índices para queries complexas
2. **Sharding** - Distribuir dados em múltiplas collections
3. **Denormalização** - Copiar dados relevantes para acesso rápido
4. **CDN** - Servir imagens via CDN
5. **Realtime Database** - Considerar mudar para Realtime para mais velocidade

---

## 🎓 Referências

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [React Query para Cache](https://tanstack.com/query/latest)
- [Cypress Testing](https://www.cypress.io/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [React Best Practices](https://react.dev/learn)

---

## 🚀 Deployment

### Preparar para Produção

1. Revisar Firestore Security Rules
2. Habilitar Rate Limiting
3. Implementar Content Filtering
4. Testar Performance com muitos posts
5. Configurar Backups automáticos
6. Implementar Monitoring/Logging
7. Setup CI/CD Pipeline

### Monitorar em Produção

```typescript
// Erros
logError: (error: Error) => {
  console.error(error);
  // Enviar para serviço de logging (Sentry, LogRocket, etc)
};

// Performance
trackPerformance: () => {
  const metrics = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  console.log(`Load time: ${metrics.loadEventEnd - metrics.loadEventStart}ms`);
};
```

---

## ✅ Checklist Pré-Produção

- [ ] Security Rules revisadas
- [ ] Rate limiting implementado
- [ ] Content filtering ativo
- [ ] Testes E2E passando
- [ ] Performance otimizada
- [ ] Error boundaries funcionando
- [ ] Logging setup
- [ ] Backup configurado
- [ ] Monitoria ativa
- [ ] Plano de escalabilidade

---

**Com essas dicas, você tem tudo para manter e expandir a Community! 🚀**

