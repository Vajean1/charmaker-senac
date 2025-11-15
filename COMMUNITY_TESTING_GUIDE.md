# 🧪 Community - Guia de Testes

## Pré-requisitos Para Testes

1. **Projeto em execução:**
   ```bash
   npm run dev
   ```

2. **Firebase configurado** com Firestore habilitado

3. **Conta teste criada** e autenticada

4. **Personagem 3D criado** (para ver avatares)

5. **Múltiplas abas do navegador** (opcional, para testar múltiplos usuários)

---

## 📋 Teste 1: Publicar Primeiro Post

**Pré-requisito:** Usuário autenticado com personagem criado

**Passos:**
1. Navegue até Community
2. Veja seu Avatar3D na seção "Criar Post"
3. Digite um texto no Textarea
4. Clique no botão "Publicar"

**Resultados Esperados:**
- ✅ Input é limpo
- ✅ Post aparece imediatamente no topo da feed
- ✅ Seu Avatar3D aparece no post (com gradiente roxo/violeta)
- ✅ Seu nome aparece como autor
- ✅ Categoria "Compartilhamento" aparece como badge
- ✅ Timestamp mostra "agora"
- ✅ Contador de likes: 0
- ✅ Contador de comentários: 0
- ✅ Post é salvo em Firestore (verifique no console)

**Verificação Firestore:**
```
Dashboard Firebase → Firestore Database
→ posts → (novo documento) → Ver dados
```

---

## 📋 Teste 2: Comentar em Post

**Pré-requisito:** Pelo menos um post publicado

**Passos:**
1. Clique no ícone de comentário (💬) de um post
2. Seção de comentários expande
3. Veja seu Avatar3D na entrada de comentário
4. Digite um comentário no input
5. Clique no botão de enviar (ou Enter)

**Resultados Esperados:**
- ✅ Seção de comentários expande com animação
- ✅ Seu Avatar3D aparece na entrada de comentário
- ✅ Input é limpo após envio
- ✅ Comentário aparece imediatamente na lista
- ✅ Novo comentário mostra seu Avatar3D (gradiente roxo/violeta)
- ✅ Seu nome aparece como comentador
- ✅ Timestamp mostra "agora"
- ✅ Contador de comentários no post aumenta
- ✅ Comentário é salvo em Firestore

**Verificação Firestore:**
```
posts → (document) → comments → (novo documento)
```

---

## 📋 Teste 3: Curtir Post

**Pré-requisito:** Pelo menos um post publicado

**Passos:**
1. Clique no coração (❤️) de um post
2. Observe o coração e o contador

**Resultados Esperados:**
- ✅ Coração fica preenchido (vermelho)
- ✅ Contador aumenta de 0 para 1
- ✅ Mudança é instantânea (sem delay)
- ✅ Like é salvo em Firestore
- ✅ Se clicar novamente: coração fica vazio, contador volta a 0

**Verificação Firestore:**
```
posts → (document) → likes: 1, likedBy: ["seu_uid"]
```

---

## 📋 Teste 4: Curtir Comentário

**Pré-requisito:** Pelo menos um comentário publicado

**Passos:**
1. Clique no coração de um comentário
2. Observe o coração e o contador

**Resultados Esperados:**
- ✅ Coração do comentário fica preenchido
- ✅ Contador de like do comentário aumenta
- ✅ Mudança é instantânea
- ✅ Like é salvo em Firestore (subcollection comments)

---

## 📋 Teste 5: Avatar3D em Diferentes Contextos

**Pré-requisito:** Personagem criado

**Passos:**
1. Veja seu Avatar3D na entrada de post (roxo/violeta)
2. Publique um post
3. Veja seu Avatar3D no post (roxo/violeta)
4. Expanda comentários
5. Veja seu Avatar3D na entrada de comentário (roxo/violeta)
6. Comente
7. Veja seu Avatar3D no comentário (roxo/violeta)

**Resultados Esperados:**
- ✅ Todos os avatares aparecem com **gradiente roxo/violeta**
- ✅ Tamanhos variam: 48px (post), 40px (comentário input), 36px (comentário)
- ✅ Avatares carregam com Suspense (mostra loading até carregarem)
- ✅ Não há erros no console

---

## 📋 Teste 6: Avatar3D de Outros Usuários

**Pré-requisito:** 2 abas abertas, 2 usuários diferentes autenticados

**Passos:**
1. **Aba 1 - Usuário A:** Publica um post
2. **Aba 2 - Usuário B:** Recarrega Community (F5)
3. **Aba 2:** Vê o post de Usuário A com seu Avatar3D
4. **Aba 2:** Comenta no post
5. **Aba 1:** Recarrega (F5)
6. **Aba 1:** Vê comentário de Usuário B com seu Avatar3D

**Resultados Esperados:**
- ✅ Post de Usuário A mostra seu Avatar3D com **gradiente dourado**
- ✅ Comentário de Usuário B mostra seu Avatar3D com **gradiente dourado**
- ✅ Avatares são diferentes visualmente
- ✅ Dados sincronizam entre abas
- ✅ Timestamps são corretos

---

## 📋 Teste 7: Timestamps Relativos

**Passos:**
1. Publique um post (vê "agora")
2. Aguarde 5 minutos
3. Recarregue a página (F5)
4. Veja o timestamp do post

**Resultados Esperados:**
- ✅ Imediatamente após: "agora"
- ✅ Após 5 minutos: "há 5m"
- ✅ Após 1 hora: "há 1h"
- ✅ Após 1 dia: "há 1d"
- ✅ Após 7+ dias: data formatada "15/11/2024"

---

## 📋 Teste 8: Múltiplas Interações Simultâneas

**Pré-requisito:** 2 abas, 2 usuários diferentes

**Passos:**
1. **Aba 1:** Publica Post A
2. **Aba 2:** Recarrega, vê Post A
3. **Aba 2:** Curte Post A
4. **Aba 1:** Verifica se contador aumentou
5. **Aba 1:** Comenta em Post A
6. **Aba 2:** Recarrega, vê novo comentário
7. **Aba 2:** Curte comentário
8. **Aba 1:** Recarrega, vê like no comentário

**Resultados Esperados:**
- ✅ Contador de likes aumenta em tempo real
- ✅ Novos comentários aparecem após recarregar
- ✅ Likes em comentários sincronizam
- ✅ Sem conflitos de dados
- ✅ Firestore reflete todas as mudanças

---

## 📋 Teste 9: Validações

**Passos:**
1. Tente publicar post vazio (só espaços)
2. Tente comentar vazio
3. Tente clicar "Publicar" com input vazio

**Resultados Esperados:**
- ✅ Botão "Publicar" fica desabilitado (disabled) quando input vazio
- ✅ Não envia post vazio para Firestore
- ✅ Input de comentário vazio não é enviado
- ✅ Sem erros no console

---

## 📋 Teste 10: Fallback de Avatar

**Pré-requisito:** Usuário sem personagem criado (ou character não salvo)

**Passos:**
1. Crie conta e skip a criação de personagem (se possível)
2. Vá para Community
3. Tente publicar post

**Resultados Esperados:**
- ✅ Entrada de post mostra emoji fallback (roxo/violeta gradiente)
- ✅ Post publicado mostra emoji fallback (roxo/violeta gradiente)
- ✅ Sem erros
- ✅ Funcionalidade completa (pode curtir, comentar, etc)

---

## 🔍 Verificações no Console

**Abra DevTools (F12) e vá para "Console"**

### ✅ Verificar Logs

```javascript
// Não deve haver erros vermelhos
// Deve haver warnings normais do React/Vite

// Ao publicar post:
// "Post publicado" (se implementar console.log)

// Ao carregar posts:
// Deve carregar sem erros
```

### ✅ Verificar Network

1. Abra "Network" tab
2. Publique um post
3. Vê requisição para Firestore?

```
POST /v1/projects/.../databases/(default)/documents/posts
Status: 200
```

---

## 🧪 Teste de Performance

**Passos:**
1. Publique 10 posts rapidamente
2. Expanda comentários múltiplos
3. Curta vários posts
4. Observe se UI fica responsiva

**Resultados Esperados:**
- ✅ UI sempre responsiva
- ✅ Sem travamentos
- ✅ Animações suaves
- ✅ Sem memory leaks (verificar DevTools)

---

## 🧪 Teste de Responsividade

**Passos:**
1. Teste em Desktop (1920x1080)
2. Teste em Tablet (768x1024)
3. Teste em Mobile (375x667)
4. Use DevTools Device Emulation (F12 → Ctrl+Shift+M)

**Resultados Esperados:**
- ✅ Layout se adapta corretamente
- ✅ Posts legíveis em todos os tamanhos
- ✅ Botões clicáveis em mobile
- ✅ Comentários expandem corretamente
- ✅ Avatares redimensionam apropriadamente

---

## 📊 Checklist Final de Testes

- [ ] Post publicado com sucesso
- [ ] Post aparece na feed
- [ ] Avatar3D renderiza no post
- [ ] Comentário adicionado com sucesso
- [ ] Comentário mostra Avatar3D
- [ ] Like em post funciona
- [ ] Like em comentário funciona
- [ ] Contador de likes atualiza
- [ ] Coração fica preenchido quando curtido
- [ ] Timestamps formatam corretamente
- [ ] Dados sincronizam entre abas
- [ ] Múltiplos usuários interagem corretamente
- [ ] Validações funcionam
- [ ] Sem erros no console
- [ ] UI responsiva em todos os tamanhos
- [ ] Firestore armazena dados corretamente

---

## 🐛 Troubleshooting

### Problema: Posts não aparecem
**Solução:** 
- Verifique se Firestore collection `posts` existe
- Verifique permissões Firestore (deve permitir leitura)
- Verifique console para erros de conexão

### Problema: Avatar3D não renderiza
**Solução:**
- Verifique se personagem foi criado e salvo
- Verifique se `character` document existe em Firestore
- Verifique modelos 3D estão em `/public/models/`

### Problema: Likes não sincronizam
**Solução:**
- Verifique Firestore Rules permitem atualização
- Recarregue a página (F5)
- Verifique se user.uid está correto

### Problema: Comentários não aparecem
**Solução:**
- Recarregue a página (pode estar em cache)
- Verifique se subcollection `comments` foi criada
- Verifique permissões Firestore para subcollections

---

## ✅ Testes Completos!

Quando todos os 10 testes passarem, a Community está pronta para produção! 🚀

