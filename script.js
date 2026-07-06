// 🔥 IMPORTAR FUNÇÕES DO FIREBASE E AUTHENTICATION
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, onSnapshot, getDoc, setDoc, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCVm5XjSiqAUopQ34ENu9-853YdmeMdfdM",
  authDomain: "desapegageral-90792.firebaseapp.com",
  projectId: "desapegageral-90792",
  storageBucket: "desapegageral-90792.firebasestorage.app",
  messagingSenderId: "855647834590",
  appId: "1:855647834590:web:a59b8b150309a016a04d4f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Seleção de Elementos
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const announceModal = document.getElementById('announceModal');
const announceForm = document.getElementById('announceForm');
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const countrySelect = document.getElementById('countrySelect');
const pPriceInput = document.getElementById('pPrice');
const labelPrice = document.getElementById('labelPrice');
const heroSubtitle = document.getElementById('heroSubtitle');
const heroStartBtn = document.getElementById('heroStartBtn');

// Auth Elementos
const authModal = document.getElementById('authModal');
const btnShowLogin = document.getElementById('btnShowLogin');
const btnLogout = document.getElementById('btnLogout');
const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
const authForm = document.getElementById('authForm');
const authModalTitle = document.getElementById('authModalTitle');
const btnAuthSubmit = document.getElementById('btnAuthSubmit');
const authToggleLink = document.getElementById('authToggleLink');
const userStatusText = document.getElementById('userStatusText');
const registerFieldsWrap = document.getElementById('registerFieldsWrap');
const authNameInput = document.getElementById('authName');
const authPhoneInput = document.getElementById('authPhone');
const authCityInput = document.getElementById('authCity');
const authEmailInput = document.getElementById('authEmail');
const authPasswordInput = document.getElementById('authPassword');
const btnGoogleAuth = document.getElementById('btnGoogleAuth');

// Carrinho Elementos
const btnCartToggle = document.getElementById('btnCartToggle');
const cartSidebar = document.getElementById('cartSidebar');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItems');
const cartCountLabel = document.getElementById('cartCount');
const cartTotalValLabel = document.getElementById('cartTotalVal');
const btnCheckoutCart = document.getElementById('btnCheckoutCart');
const btnAddToCartDetail = document.getElementById('btnAddToCartDetail');

// CHAT ELEMENTOS NOVOS
const btnOpenMyChats = document.getElementById('btnOpenMyChats');
const chatListSidebar = document.getElementById('chatListSidebar');
const closeChatListBtn = document.getElementById('closeChatListBtn');
const chatListInbox = document.getElementById('chatListInbox');
const chatWindow = document.getElementById('chatWindow');
const closeChatWindowBtn = document.getElementById('closeChatWindowBtn');
const chatWithNameLabel = document.getElementById('chatWithName');
const chatMessagesBox = document.getElementById('chatMessagesBox');
const chatInputForm = document.getElementById('chatInputForm');
const chatMessageInput = document.getElementById('chatMessageInput');
const btnOpenInternalChat = document.getElementById('btnOpenInternalChat');

let isLoginMode = true; 
let usuarioLogado = null;
let dadosPerfilLogado = null; 
let carrinho = JSON.parse(localStorage.getItem('desapega_cart')) || [];
let currentChatId = null; 
let unsubscribeMessages = null;
let unsubscribeInbox = null;

const adminAccessBtn = document.getElementById('adminAccessBtn');
const adminBadge = document.getElementById('adminBadge');
let isAdminMode = false;

const heroSection = document.querySelector('.hero-section');
const categoriesSection = document.querySelector('.categories-section');
const productsSection = document.querySelector('.products-section');
const productDetailsPage = document.getElementById('productDetailsPage');
const btnBackToList = document.getElementById('btnBackToList');

const detailImg = document.getElementById('detailImg');
const detailTag = document.getElementById('detailTag');
const detailTitle = document.getElementById('detailTitle');
const detailPrice = document.getElementById('detailPrice');
const detailLocation = document.getElementById('detailLocation');
const detailSellerName = document.getElementById('detailSellerName');

let itemSelecionadoParaCarrinho = null;
let paisAtual = localStorage.getItem('desapega_pais') || 'BR';
countrySelect.value = paisAtual;
let unsubscribeRealtime = null;

// MONITOR DE USUÁRIO LOGADO
onAuthStateChanged(auth, async (user) => {
    if (user) {
        usuarioLogado = user;
        btnOpenMyChats.style.display = 'inline-block';
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) dadosPerfilLogado = docSnap.data();
        
        userStatusText.textContent = `Conectado como: ${user.displayName || user.email}`;
        btnShowLogin.style.display = 'none';
        btnLogout.style.display = 'inline-block';
        sincronizarCaixaDeEntradaChat();
    } else {
        usuarioLogado = null;
        dadosPerfilLogado = null;
        btnOpenMyChats.style.display = 'none';
        chatListSidebar.classList.remove('active');
        chatWindow.classList.remove('active');
        userStatusText.textContent = "Olá, visitante! Faça login para anunciar.";
        btnShowLogin.style.display = 'inline-block';
        btnLogout.style.display = 'none';
        if (unsubscribeInbox) unsubscribeInbox();
    }
});

// ALTERNAR ENTRE LOGIN E CADASTRO
authToggleLink.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        authModalTitle.textContent = "Entrar na Sua Conta";
        btnAuthSubmit.textContent = "Entrar";
        authToggleLink.textContent = "Não tem conta? Cadastre-se aqui";
        registerFieldsWrap.style.display = "none";
    } else {
        authModalTitle.textContent = "Criar Nova Conta";
        btnAuthSubmit.textContent = "Cadastrar Usuário";
        authToggleLink.textContent = "Já tem uma conta? Faça login";
        registerFieldsWrap.style.display = "block";
    }
});

// FORMULÁRIO AUTH EMAIL/SENHA
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login realizado com sucesso! 🎉");
        } else {
            const nome = authNameInput.value.trim();
            const telefone = authPhoneInput.value.replace(/\D/g, "");
            const city = authCityInput.value.trim();

            if (!nome || telefone.length < 10 || !city) {
                alert("❌ Erro: Todos os dados cadastrais são obrigatórios!");
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: nome });
            
            await setDoc(doc(db, "usuarios", userCredential.user.uid), {
                nome, telefone, cidade: city, email
            });

            dadosPerfilLogado = { nome, telefone, cidade: city };
            alert(`Conta criada com sucesso! 🚀`);
        }
        authForm.reset();
        authModal.classList.remove('active');
    } catch (error) { alert(error.message); }
});

// GOOGLE AUTH
btnGoogleAuth.addEventListener('click', async () => {
    try {
        const resultado = await signInWithPopup(auth, googleProvider);
        const user = resultado.user;
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            let telPrompt = prompt("Insira seu WhatsApp com DDD:") || "";
            let cidPrompt = prompt("Insira sua Cidade:") || "Londrina";
            await setDoc(doc(db, "usuarios", user.uid), {
                nome: user.displayName, telefone: telPrompt.replace(/\D/g, ""), cidade: cidPrompt, email: user.email
            });
            dadosPerfilLogado = { nome: user.displayName, telefone: telPrompt, cidade: cidPrompt };
        }
        authModal.classList.remove('active');
    } catch (error) { alert(error.message); }
});

btnLogout.addEventListener('click', () => signOut(auth));
btnShowLogin.addEventListener('click', () => { isLoginMode = true; authModal.classList.add('active'); });
closeAuthModalBtn.addEventListener('click', () => authModal.classList.remove('active'));

// CONFIGURAR PAÍS E REALTIME DE PRODUTOS
function configurarPaisESincronizar(pais) {
    paisAtual = pais;
    localStorage.setItem('desapega_pais', pais);
    if (unsubscribeRealtime) unsubscribeRealtime();

    const q = query(collection(db, `anuncios_${paisAtual}`), orderBy("timestamp", "desc"));
    unsubscribeRealtime = onSnapshot(q, (snapshot) => {
        const listaProdutos = [];
        snapshot.forEach((doc) => { listaProdutos.push({ id: doc.id, ...doc.data() }); });
        renderizarProdutos(listaProdutos);
    });
}
countrySelect.addEventListener('change', (e) => configurarPaisESincronizar(e.target.value));

function renderizarProdutos(lista) {
    productsGrid.innerHTML = '';
    const simboloMoeda = paisAtual === 'BR' ? 'R$' : '€';
    lista.forEach(prod => {
        const novoCard = document.createElement('div');
        novoCard.classList.add('product-card');
        novoCard.setAttribute('data-id', prod.id);
        novoCard.setAttribute('data-title', prod.titulo.toLowerCase());
        novoCard.setAttribute('data-seller-uid', prod.vendedorUid || "");
        novoCard.setAttribute('data-seller-name', prod.vendedorNome || "Vendedor");

        novoCard.innerHTML = `
            <button class="btn-delete-prod" style="display: ${isAdminMode ? 'block' : 'none'};">🗑️</button>
            <div class="product-image-wrap">
                <img src="${prod.imagem}" alt="${prod.titulo}" class="product-img">
                <span class="product-tag">${prod.categoria}</span>
            </div>
            <div class="product-info">
                <h4 class="product-title">${prod.titulo}</h4>
                <p class="product-price">${simboloMoeda} ${prod.preco}</p>
                <p class="product-location">${prod.localizacao}</p>
            </div>
        `;
        productsGrid.appendChild(novoCard);
    });
}
configurarPaisESincronizar(paisAtual);

// CLIQUE NO CARD DO PRODUTO
productsGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.product-card');
    if (!card || e.target.classList.contains('btn-delete-prod')) return;

    const idProd = card.getAttribute('data-id');
    const title = card.querySelector('.product-title').textContent;
    const price = card.querySelector('.product-price').textContent;
    const loc = card.querySelector('.product-location').textContent;
    const tag = card.querySelector('.product-tag').textContent;
    const img = card.querySelector('.product-img').src;
    const sellerUid = card.getAttribute('data-seller-uid');
    const sellerName = card.getAttribute('data-seller-name');

    detailTitle.textContent = title;
    detailPrice.textContent = price;
    detailLocation.textContent = loc;
    detailTag.textContent = tag;
    detailImg.src = img;
    detailSellerName.textContent = `Vendedor: ${sellerName}`;

    itemSelecionadoParaCarrinho = { id: idProd, titulo: title, preco: price, imagem: img };

    // Configuração do Botão de Chat Interno
    btnOpenInternalChat.onclick = () => {
        if (!usuarioLogado) {
            alert("🔒 Faça login para iniciar um chat com o vendedor!");
            btnShowLogin.click();
            return;
        }
        if (usuarioLogado.uid === sellerUid) {
            alert("Você não pode abrir um chat com você mesmo.");
            return;
        }
        // ID único do canal gerado combinando os dois UIDs organizados alfabeticamente
        const chatId = usuarioLogado.uid < sellerUid ? `${usuarioLogado.uid}_${sellerUid}` : `${sellerUid}_${usuarioLogado.uid}`;
        abrirJanelaDeConversa(chatId, sellerName, sellerUid);
    };

    heroSection.style.display = 'none';
    categoriesSection.style.display = 'none';
    productsSection.style.display = 'none';
    productDetailsPage.style.display = 'block';
});

function voltarParaLista() {
    productDetailsPage.style.display = 'none';
    heroSection.style.display = 'block';
    categoriesSection.style.display = 'block';
    productsSection.style.display = 'block';
}
btnBackToList.addEventListener('click', voltarParaLista);

// SALVAR NOVO ANÚNCIO
openModalBtn.addEventListener('click', () => { if(usuarioLogado) { announceModal.classList.add('active'); } else { btnShowLogin.click(); } });
closeModalBtn.addEventListener('click', () => announceModal.classList.remove('active'));
announceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pPriceInput = document.getElementById('pPrice');
    const novoProduto = {
        titulo: document.getElementById('pTitle').value,
        preco: pPriceInput.value,
        categoria: document.getElementById('pCategory').value,
        imagem: document.getElementById('pImgUrl').value.trim() || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        localizacao: "📍 " + (dadosPerfilLogado?.cidade || "Brasil"),
        vendedorUid: usuarioLogado.uid,
        vendedorNome: dadosPerfilLogado?.nome || usuarioLogado.displayName || usuarioLogado.email,
        timestamp: Date.now()
    };
    try {
        await addDoc(collection(db, `anuncios_${paisAtual}`), novoProduto);
        announceForm.reset();
        announceModal.classList.remove('active');
        voltarParaLista();
    } catch(err) { alert(err.message); }
});

// =========================================================================
// SINDROME DO CHAT REALTIME - LÓGICA CORE DO CHAT INTERNO
// =========================================================================

// Abrir e fechar a caixa lateral dos meus chats
btnOpenMyChats.addEventListener('click', () => chatListSidebar.classList.add('active'));
closeChatListBtn.addEventListener('click', () => chatListSidebar.classList.remove('active'));
closeChatWindowBtn.addEventListener('click', () => chatWindow.classList.remove('active'));

// Sincronizar todos os chats que o usuário logado está participando
function sincronizarCaixaDeEntradaChat() {
    if (!usuarioLogado) return;
    const q = query(collection(db, "chats"), where("participantes", "array-contains", usuarioLogado.uid));
    
    unsubscribeInbox = onSnapshot(q, (snapshot) => {
        chatListInbox.innerHTML = "";
        if (snapshot.empty) {
            chatListInbox.innerHTML = "<p class='no-chats'>Nenhuma conversa ativa ainda.</p>";
            return;
        }
        snapshot.forEach((docSnap) => {
            const dadosChat = docSnap.data();
            const idChat = docSnap.id;
            
            // Descobrir qual dos nomes não é o do usuário logado
            const outroNome = dadosChat.nomesParticipantes[0] === usuarioLogado.displayName ? dadosChat.nomesParticipantes[1] : dadosChat.nomesParticipantes[0];
            const outroUid = dadosChat.participantes[0] === usuarioLogado.uid ? dadosChat.participantes[1] : dadosChat.participantes[0];

            const divCanal = document.createElement('div');
            divCanal.classList.add('chat-inbox-row');
            divCanal.innerHTML = `
                <div class="chat-row-avatar">💬</div>
                <div class="chat-row-info">
                    <h4>${outroNome || 'Usuário'}</h4>
                    <p>${dadosChat.ultimaMensagem || 'Clique para ver as mensagens'}</p>
                </div>
            `;
            divCanal.addEventListener('click', () => {
                chatListSidebar.classList.remove('active');
                abrirJanelaDeConversa(idChat, outroNome, outroUid);
            });
            chatListInbox.appendChild(divCanal);
        });
    });
}

// Abrir a caixinha de texto flutuante e puxar as mensagens em tempo real
async function abrirJanelaDeConversa(chatId, nomeDoOutro, uidDoOutro) {
    currentChatId = chatId;
    chatWithNameLabel.textContent = nomeDoOutro;
    chatWindow.classList.add('active');
    chatMessagesBox.innerHTML = "<p class='loading-chat'>Carregando mensagens...</p>";

    // Criar ou atualizar os cabeçalhos do chat na coleção global de conversas
    await setDoc(doc(db, "chats", chatId), {
        participantes: [usuarioLogado.uid, uidDoOutro],
        nomesParticipantes: [usuarioLogado.displayName || usuarioLogado.email, nomeDoOutro],
        idChat: chatId
    }, { merge: true });

    if (unsubscribeMessages) unsubscribeMessages();

    // Puxar mensagens ordenadas por tempo
    const msgQuery = query(collection(db, `chats/${chatId}/mensagens`), orderBy("timestamp", "asc"));
    unsubscribeMessages = onSnapshot(msgQuery, (snapshot) => {
        chatMessagesBox.innerHTML = "";
        snapshot.forEach((mDoc) => {
            const msgData = mDoc.data();
            const balao = document.createElement('div');
            balao.classList.add('message-bubble');
            // Se o uid do remetente for igual ao meu, joga o balão pra direita
            balao.classList.add(msgData.remetenteId === usuarioLogado.uid ? 'me' : 'other');
            balao.textContent = msgData.texto;
            chatMessagesBox.appendChild(balao);
        });
        chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight; // Rola o chat pro final
    });
}

// Enviar mensagem pelo formulário do chat
chatInputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const textoMsg = chatMessageInput.value.trim();
    if (!textoMsg || !currentChatId) return;

    chatMessageInput.value = ""; // Limpa o campo na hora

    const novaMensagem = {
        texto: textoMsg,
        remetenteId: usuarioLogado.uid,
        remetenteNome: usuarioLogado.displayName || usuarioLogado.email,
        timestamp: Date.now()
    };

    try {
        // Salva a mensagem na subcoleção interna do canal
        await addDoc(collection(db, `chats/${currentChatId}/mensagens`), novaMensagem);
        // Atualiza o resumo da conversa no nó pai
        await updateDoc(doc(db, "chats", currentChatId), {
            ultimaMensagem: textoMsg,
            timestampUltima: Date.now()
        });
    } catch (err) { console.error("Erro ao enviar mensagem: ", err); }
});

// --- LÓGICA DO CARRINHO ---
function atualizarInterfaceCarrinho() {
    cartItemsContainer.innerHTML = "";
    let total = 0;
    carrinho.forEach((item, index) => {
        const nPreco = parseFloat(item.preco.replace(/[^\d,.]/g, "").replace(".", "").replace(",", "."));
        total += isNaN(nPreco) ? 0 : nPreco;
        const divItem = document.createElement('div');
        divItem.classList.add('cart-item-row');
        divItem.innerHTML = `
            <img src="${item.imagem}" alt="">
            <div class="cart-item-info"><h4>${item.titulo}</h4><p>${item.preco}</p></div>
            <span class="remove-cart-item" data-index="${index}">&times;</span>
        `;
        cartItemsContainer.appendChild(divItem);
    });
    cartCountLabel.textContent = carrinho.length;
    const moeda = paisAtual === 'BR' ? 'R$' : '€';
    cartTotalValLabel.textContent = `${moeda} ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    localStorage.setItem('desapega_cart', JSON.stringify(carrinho));
}
btnAddToCartDetail.addEventListener('click', () => {
    if (itemSelecionadoParaCarrinho) {
        carrinho.push(itemSelecionadoParaCarrinho);
        atualizarInterfaceCarrinho();
        cartSidebar.classList.add('active');
    }
});
cartItemsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-cart-item')) {
        carrinho.splice(e.target.getAttribute('data-index'), 1);
        atualizarInterfaceCarrinho();
    }
});
btnCartToggle.addEventListener('click', () => cartSidebar.classList.add('active'));
closeCartBtn.addEventListener('click', () => cartSidebar.classList.remove('active'));
atualizarInterfaceCarrinho();