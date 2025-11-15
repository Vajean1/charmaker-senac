# Community - Casos de Uso e Exemplos

## 🎯 Casos de Uso Principais

### Caso 1: Usuário Novo Publica Seu Primeiro Post

**Cenário:**
- João se registra e cria seu personagem 3D (avatar feminino, cabelo cacheado, pele parda)
- Navega até Community
- Digita: "Adorei criar meu personagem! Que legal saber mais sobre a cultura afro-brasileira! 🎉"
- Clica "Publicar"

**O que acontece:**
```
1. handleSubmitPost() é chamada
2. Firestore salva em: posts/post_1731678600000
   {
     author: "João Silva",
     authorId: "uid_joao",
     avatar: "👨🏾",
     content: "Adorei criar meu personagem! ...",
     category: "Compartilhamento",
     likes: 0,
     likedBy: [],
     character: {
       gender: "female",
       bodyType: "body1",
       skinColor: "skin2",
       faceOption: "face2",
       hairId: 8
     },
     createdAt: Timestamp(2024-11-15 16:30:00)
   }

3. UI atualiza imediatamente com:
   - Avatar3D com gradiente roxo/violeta (porque é seu post)
   - Nome "João Silva"
   - Categoria "Compartilhamento"
   - Tempo "agora"
   - Contador de likes: 0
   - Contador de comentários: 0
```

**Resultado:**
- Post aparece no topo da feed
- Outros usuários podem ver e comentar
- Dados persistem permanentemente

---

### Caso 2: Outro Usuário Comenta no Post

**Cenário:**
- Maria vê o post de João
- Clica no ícone de comentário para expandir
- Digita: "Verdade! Eu também aprendi muito sobre minha cultura! 🌟"
- Clica para enviar

**O que acontece:**
```
1. handleSubmitComment("post_1731678600000") é chamada
2. Firestore salva em: posts/post_1731678600000/comments/comment_1731678800000
   {
     author: "Maria Santos",
     authorId: "uid_maria",
     content: "Verdade! Eu também aprendi...",
     likes: 0,
     likedBy: [],
     character: {
       gender: "female",
       bodyType: "body2",
       skinColor: "skin1",
       faceOption: "face1",
       hairId: 10
     },
     createdAt: Timestamp(2024-11-15 16:35:00)
   }

3. UI atualiza com novo comentário:
   - Avatar3D de Maria com gradiente dourado
   - Nome "Maria Santos"
   - Tempo "agora"
   - Coração (para curtir)
   - Contador de likes: 0

4. Array post.comments na UI inclui novo comentário
5. Contador de comentários no post agora mostra: 1
```

**Resultado:**
- Comentário aparece imediatamente
- João pode ver quem comentou
- Outros podem curtir o comentário

---

### Caso 3: Usuário Curte Post e Comentário

**Cenário:**
- Carlos vê o post de João
- Clica no coração ❤️ do post
- Clica no ícone de comentário
- Vê comentário de Maria
- Clica no coração do comentário de Maria

**Fluxo 1 - Like no Post:**
```
1. handleLike("post_1731678600000") é chamada
2. Firestore atualiza:
   - likes: increment(1) → 1
   - likedBy: arrayUnion("uid_carlos") → ["uid_carlos"]

3. UI atualiza:
   - Coração fica preenchido (vermelho) 
   - Contador muda de 0 para 1
   - Quando Carlos descurtir: volta a ficar vazio

4. Resultado em Firestore:
   {
     ...resto do post,
     likes: 1,
     likedBy: ["uid_carlos"],
   }
```

**Fluxo 2 - Like no Comentário:**
```
1. handleLikeComment("post_1731678600000", "comment_1731678800000") é chamada
2. Firestore atualiza comentário:
   - likes: increment(1) → 1
   - likedBy: arrayUnion("uid_carlos") → ["uid_carlos"]

3. UI atualiza no comentário de Maria:
   - Coração fica preenchido
   - Contador muda de 0 para 1

4. Resultado em Firestore:
   {
     ...resto do comentário,
     likes: 1,
     likedBy: ["uid_carlos"],
   }
```

**Resultado:**
- João vê que seu post foi curtido por Carlos
- Maria vê que seu comentário foi curtido por Carlos
- Contador de likes aumenta

---

### Caso 4: Múltiplos Usuários Interagindo

**Timeline de Interações:**

```
10:00 - João publica post
        post.likes = 0, post.comments = 0

10:05 - Maria comenta
        post.comments.length = 1

10:10 - Carlos curte post de João
        post.likes = 1, post.likedBy = ["uid_carlos"]

10:12 - Ana comenta no post
        post.comments.length = 2

10:15 - Carlos curte comentário de Maria
        comment[Maria].likes = 1, comment[Maria].likedBy = ["uid_carlos"]

10:18 - João curte comentário de Ana
        comment[Ana].likes = 1, comment[Ana].likedBy = ["uid_joao"]

10:20 - Maria curte comentário de Ana
        comment[Ana].likes = 2, comment[Ana].likedBy = ["uid_joao", "uid_maria"]

10:22 - Ana curte o post de João
        post.likes = 2, post.likedBy = ["uid_carlos", "uid_ana"]

Resultado Final:
{
  post: {
    author: "João",
    likes: 2,
    likedBy: ["uid_carlos", "uid_ana"],
    comments: [
      {
        author: "Maria",
        likes: 1,
        likedBy: ["uid_carlos"]
      },
      {
        author: "Ana",
        likes: 2,
        likedBy: ["uid_joao", "uid_maria"]
      }
    ]
  }
}
```

**Relatório de Engajamento:**
- Post de João: 2 curtidas, 2 comentários
- Comentário de Maria: 1 curtida
- Comentário de Ana: 2 curtidas

---

## 📊 Estrutura de Dados em Ação

### POST ORIGINAL
```json
{
  "id": "post_1731678600000",
  "author": "João Silva",
  "authorId": "uid_joao",
  "avatar": "👨🏾",
  "content": "Adorei criar meu personagem!",
  "category": "Compartilhamento",
  "likes": 2,
  "likedBy": ["uid_carlos", "uid_ana"],
  "createdAt": "2024-11-15T16:30:00Z",
  "character": {
    "gender": "female",
    "bodyType": "body1",
    "skinColor": "skin2",
    "faceOption": "face2",
    "hairId": 8
  }
}
```

### COMENTÁRIO 1
```json
{
  "id": "comment_1731678800000",
  "author": "Maria Santos",
  "authorId": "uid_maria",
  "content": "Verdade! Eu também aprendi!",
  "likes": 1,
  "likedBy": ["uid_carlos"],
  "createdAt": "2024-11-15T16:35:00Z",
  "character": {
    "gender": "female",
    "bodyType": "body2",
    "skinColor": "skin1",
    "faceOption": "face1",
    "hairId": 10
  }
}
```

### COMENTÁRIO 2
```json
{
  "id": "comment_1731679000000",
  "author": "Ana Costa",
  "authorId": "uid_ana",
  "content": "Que experiência incrível!",
  "likes": 2,
  "likedBy": ["uid_joao", "uid_maria"],
  "createdAt": "2024-11-15T16:40:00Z",
  "character": {
    "gender": "female",
    "bodyType": "body3",
    "skinColor": "skin5",
    "faceOption": "face5",
    "hairId": 15
  }
}
```

---

## 🎨 UI Renderizada - Exemplo Visual

```
╔════════════════════════════════════════════════════════════╗
║ COMUNIDADE - Feed de Posts                               ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║ [🎨 Seu Avatar 3D]                                       ║
║ ┌──────────────────────────────────────────────────────┐ ║
║ │ Compartilhe suas reflexões...                        │ ║
║ └──────────────────────────────────────────────────────┘ ║
║ [Publicar]                                               ║
║                                                            ║
║ ╔══════════════════════════════════════════════════════╗ ║
║ ║ [🎨 João Silva] Compartilhamento  há 22 minutos     ║ ║
║ ║ ──────────────────────────────────────────────────── ║ ║
║ ║ Adorei criar meu personagem! Que legal saber mais   ║ ║
║ ║ sobre a cultura afro-brasileira! 🎉                 ║ ║
║ ║                                                      ║ ║
║ ║ ❤️ 2  💬 2  ↗️ Compartilhar                          ║ ║
║ ╚══════════════════════════════════════════════════════╝ ║
║                                                            ║
║ ╔══════════════════════════════════════════════════════╗ ║
║ ║ Comentários (expandido)                             ║ ║
║ ║                                                      ║ ║
║ ║ [🎨 Seu Avatar] Escrever comentário...    [Enviar] ║ ║
║ ║                                                      ║ ║
║ ║ ┌─────────────────────────────────────────────────┐ ║ ║
║ ║ │ [🎨 Maria Santos]  há 17 minutos                 │ ║ ║
║ ║ │ Verdade! Eu também aprendi muito!               │ ║ ║
║ ║ │ ❤️ 1                                             │ ║ ║
║ ║ └─────────────────────────────────────────────────┘ ║ ║
║ ║                                                      ║ ║
║ ║ ┌─────────────────────────────────────────────────┐ ║ ║
║ ║ │ [🎨 Ana Costa]  há 12 minutos                   │ ║ ║
║ ║ │ Que experiência incrível!                       │ ║ ║
║ ║ │ ❤️ 2                                            │ ║ ║
║ ║ └─────────────────────────────────────────────────┘ ║ ║
║ ║                                                      ║ ║
║ ╚══════════════════════════════════════════════════════╝ ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🔄 Transações Firestore

### Transação: Publicar Post com Personagem
```typescript
// 1. Lê dados do usuário (character)
const charDoc = await getDoc(doc(db, 'characters', uid))

// 2. Cria novo documento de post
await setDoc(doc(db, 'posts', postId), {
  ...dados do post,
  character: charDoc.data() // Salva junto
})

// 3. Atualiza UI localmente
setPosts([{id: postId, ...postData}, ...posts])
```

### Transação: Like em Post
```typescript
// 1. Verifica estado atual
const currentPost = posts.find(p => p.id === postId)
const alreadyLiked = currentPost.likedBy.includes(uid)

// 2. Se curtiu, remove; senão, adiciona
if (alreadyLiked) {
  await updateDoc(postRef, {
    likes: increment(-1),
    likedBy: arrayRemove(uid)
  })
} else {
  await updateDoc(postRef, {
    likes: increment(1),
    likedBy: arrayUnion(uid)
  })
}

// 3. Atualiza UI
setPosts([...postsAtualizados])
```

---

## ✅ Checklist de Funcionalidades

- [x] Publicar posts
- [x] Carregar posts do Firestore
- [x] Comentar em posts
- [x] Curtir posts
- [x] Curtir comentários
- [x] Avatar3D em posts
- [x] Avatar3D em comentários
- [x] Timestamps formatados
- [x] Contadores de likes/comentários
- [x] Expandir/colapsar comentários
- [x] Gradientes diferenciados (dourado/roxo)
- [x] Validação de campos vazios
- [x] Sem erros de compilação

---

## 🚀 Pronto Para Usar!

Todos os casos de uso acima estão totalmente funcionais e testados. A Community agora é uma plataforma social completa! 🎉

