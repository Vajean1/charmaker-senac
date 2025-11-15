# Community - Diagrama de Fluxo de Dados

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                     COMMUNITY COMPONENT                      │
└─────────────────────────────────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │             │
            ┌───────▼────────┐  ┌─▼──────────────┐
            │  COMPONENT     │  │  FIRESTORE DB  │
            │  STATE/HOOKS   │  │  (Backend)     │
            └────────────────┘  └────────────────┘
                    │
    ┌───────────────┼────────────────┐
    │               │                │
┌───▼──────┐  ┌─────▼─────┐  ┌──────▼────────┐
│  Posts   │  │ Comments  │  │  Characters   │
│  State   │  │  State    │  │  (Author)     │
└──────────┘  └───────────┘  └───────────────┘


## Fluxo 1: Publicar Post

┌──────────────────────┐
│ Usuário digita post  │
│ e clica "Publicar"   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────┐
│ handleSubmitPost()           │
│ - Valida conteúdo            │
│ - Cria objeto post           │
│ - Busca character do usuário │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ setDoc(db, "posts/{id}")     │
│ Salva em Firestore           │
│ {                            │
│   author, authorId, content, │
│   likes: 0, likedBy: [],     │
│   character: {...},          │
│   createdAt: Timestamp       │
│ }                            │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ setPosts([newPost, ...posts])│
│ Atualiza UI imediatamente    │
└──────────┬───────────────────┘
           │
           ▼
┌──────────────────────────────┐
│ Post aparece no topo da feed │
│ com Avatar3D do autor        │
└──────────────────────────────┘


## Fluxo 2: Comentar em Post

┌─────────────────────────────────┐
│ Usuário abre comentários e      │
│ digita comentário no input      │
└──────────────┬──────────────────┘
               │
               ▼
┌───────────────────────────────────┐
│ handleSubmitComment(postId)       │
│ - Valida conteúdo do comentário  │
│ - Busca character do usuário      │
└──────────────┬──────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ setDoc(db, "posts/{postId}/         │
│         comments/{commentId}")       │
│ Salva comentário na subcollection  │
│ {                                    │
│   author, authorId, content,         │
│   likes: 0, likedBy: [],             │
│   character: {...},                  │
│   createdAt: Timestamp               │
│ }                                    │
└──────────────┬─────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Atualiza post.comments array em UI  │
│ Novo comentário aparece no topo     │
│ com Avatar3D do comentador          │
└──────────────────────────────────────┘


## Fluxo 3: Curtir Post

┌──────────────────────────────┐
│ Usuário clica no coração     │
│ do post                      │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ handleLike(postId)                   │
│ - Busca post atual                   │
│ - Verifica se já curtiu              │
└──────────────┬─────────────────────┘
               │
         ┌─────┴─────┐
         │           │
    ┌────▼──────┐   ┌▼─────────┐
    │ JÁ CURTIU │   │ NÃO CURTIU│
    └────┬──────┘   └┬─────────┘
         │          │
    ┌────▼──────────▼──────────┐
    │ updateDoc + increment    │
    │ Atualiza Firestore       │
    │ - Unlike: increment(-1)  │
    │ - Like: increment(+1)    │
    │ - arrayRemove/arrayUnion │
    │   likedBy[]              │
    └──────────────┬───────────┘
                   │
                   ▼
    ┌──────────────────────────────┐
    │ Atualiza post.likes e        │
    │ post.likedBy em UI           │
    │ Coração fica preenchido      │
    │ Contador atualiza            │
    └──────────────────────────────┘


## Fluxo 4: Carregar Posts (ao montar componente)

┌──────────────────────────┐
│ useEffect([])            │
│ Componente montou        │
└──────────────┬───────────┘
               │
               ▼
┌──────────────────────────────────┐
│ getDocs(query(collection(db,     │
│ "posts"), orderBy("createdAt",   │
│ "desc")))                        │
│ Busca TODOS os posts ordenados   │
│ por mais recente                 │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ Para CADA post encontrado:       │
│ - Cria documento post            │
│ - Busca comentários da          │
│   subcollection comments         │
│ - Mapeia comentários             │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ setPosts([...todos os posts])    │
│ com seus comentários             │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ Feed renderiza todos os posts    │
│ com comentários carregados       │
└──────────────────────────────────┘


## Estrutura de Dados - Post

Post {
  id: string;                    // ID único do documento
  author: string;                // Nome do autor
  authorId: string;              // UID do autor (rastreia likes)
  avatar: string;                // Emoji fallback
  content: string;               // Texto do post
  category: string;              // Ex: "Compartilhamento"
  likes: number;                 // Contador de curtidas
  likedBy: string[];             // Array de UIDs que curtiram
  createdAt: Timestamp;          // Quando foi criado
  character: {                   // Dados do personagem 3D
    gender: string;
    bodyType: string;
    skinColor: string;
    faceOption: string;
    hairId: number;
  };
  comments: Comment[];           // Array de comentários
}

Comment {
  id: string;                    // ID único do comentário
  author: string;                // Nome do comentador
  authorId: string;              // UID do comentador
  content: string;               // Texto do comentário
  likes: number;                 // Contador de curtidas
  likedBy: string[];             // Array de UIDs que curtiram
  createdAt: Timestamp;          // Quando foi criado
  character: {                   // Dados do personagem 3D
    gender: string;
    bodyType: string;
    skinColor: string;
    faceOption: string;
    hairId: number;
  };
}


## Renderização - Estrutura Visual

Post Card
├── Header
│   ├── Avatar3D (do autor)
│   ├── Nome do autor + Badge categoria
│   └── Timestamp formatado
├── Conteúdo
│   └── Texto do post
└── Actions
    ├── Like Button (coração)
    │   └── Contador
    ├── Comment Button
    │   └── Contador
    └── Share Button

    [Se expandido]
    └── Comments Section
        ├── Input + Avatar3D seu
        ├── Lista de comentários
        │   └── Para cada comentário:
        │       ├── Avatar3D do comentador
        │       ├── Nome + Timestamp
        │       ├── Texto
        │       └── Like Button


## Timestamps - Formatação

createAt: Timestamp                    formatRelativeTime()              UI
─────────────────────────────────────────────────────────────────────────
Agora                                  "agora"
5 minutos atrás                        "há 5m"
2 horas atrás                          "há 2h"
1 dia atrás                            "há 1d"
7 dias atrás (mais)                    "15/11/2025"


## Ciclo de Vida do Componente

┌─────────────────────────────────────────┐
│ Community monta                         │
│ (usuario navega para Community)        │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
    ┌───▼──┐    ┌─────▼──────┐
    │Carrega│    │ Carrega    │
    │Character   │ Posts      │
    │do usuário  │ e Comments │
    └───────┘    └────────────┘
        │             │
        └──────┬──────┘
               │
               ▼
┌──────────────────────────────────┐
│ Estado atualizado com:           │
│ - character (Avatar3D do usuário)│
│ - posts[] (todos os posts)       │
│ UI renderiza feed completa       │
└──────────────────────────────────┘
               │
        ┌──────┴───────┬──────────┐
        │              │          │
    ┌───▼──────┐  ┌────▼────┐  ┌─▼──────┐
    │ Usuário  │  │Usuário  │  │Usuário │
    │ publica  │  │ comenta │  │ curte  │
    │ post     │  │ post    │  │ post   │
    └──────────┘  └─────────┘  └────────┘
        │              │          │
        └──────┬───────┴──────────┘
               │
               ▼
┌──────────────────────────────────┐
│ Firestore atualizado             │
│ UI re-renderiza em tempo real    │
└──────────────────────────────────┘

