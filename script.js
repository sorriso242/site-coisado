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

// Seleção de Elementos da Interface
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

// Elementos do Auth
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

// Elementos do Carrinho
const btnCartToggle = document.getElementById('btnCartToggle');
const cartSidebar = document.getElementById('cartSidebar');
const closeCartBtn = document.getElementById('closeCartBtn');
const cartItemsContainer = document.getElementById('cartItems');
const cartCountLabel = document.getElementById('cartCount');
const cartTotalValLabel = document.getElementById('cartTotalVal');
const btnCheckoutCart = document.getElementById('btnCheckoutCart');
const btnAddToCartDetail = document.getElementById('btnAddToCartDetail');

// Elementos do Chat Interno
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

// ATALHO SECRETO PARA ADMIN: CTRL + SHIFT + S
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        isAdminMode = !isAdminMode;
        if (adminBadge) adminBadge.style.display = isAdminMode ? 'inline-block' : 'none';
        if (adminAccessBtn) adminAccessBtn.style.display = isAdminMode ? 'inline-block' : 'none';
        
        // Atualiza a visibilidade dos botões de lixeira nos cards atuais
        const lixeiras = document.querySelectorAll('.btn-delete-prod');
        lixeiras.forEach(btn => btn.style.display = isAdminMode ? 'block' : 'none');
        
        alert(isAdminMode ? "Modo Administrador Ativado! 🔒" : "Modo Administrador Desativado! 🔓");
    }
});

// MONITOR DE USUÁRIO LOGADO
onAuthStateChanged(auth, async (user) => {
    if (user) {
        usuarioLogado = user;
        if (btnOpenMyChats) btnOpenMyChats.style.display = 'inline-block';
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
        if (btnOpenMyChats) btnOpenMyChats.style.display = 'none';
        if (chatListSidebar) chatListSidebar.classList.remove('active');
        if (chatWindow) chatWindow.classList.remove('active');
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

// SUBMIT DO FORMULÁRIO DE AUTENTICAÇÃO (EMAIL/SENHA) - COM TRAVA DE ERRO
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

            if (!nome || nome.length < 3) {
                alert("❌ Erro de Cadastro: Você precisa inserir seu nome completo para criar a conta!");
                return;
            }
            if (!telefone || telefone.length < 10) {
                alert("❌ Erro de Cadastro: Você precisa inserir um número de WhatsApp válido com DDD!");
                return;
            }
            if (!city || city.length < 2) {
                alert("❌ Erro de Cadastro: Você precisa preencher a sua cidade para continuar!");
                return;
            }

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: nome });
            
            await setDoc(doc(db, "usuarios", userCredential.user.uid), {
                nome: nome,
                telefone: telefone,
                cidade: city,
                email: email
            });

            dadosPerfilLogado = { nome, telefone, cidade: city };
            alert(`Conta criada com sucesso! Bem-vindo(a), ${nome}! 🚀`);
        }
        authForm.reset();
        authModal.classList.remove('active');
    } catch (error) {
        let msg = "Erro na autenticação: " + error.message;
        if (error.code === 'auth/email-already-in-use') msg = "❌ Este e-mail já está sendo usado por outra conta!";
        if (error.code === 'auth/weak-password') msg = "❌ A senha precisa ter pelo menos 6 caracteres!";
        if (error.code === 'auth/invalid-email') msg = "❌ O endereço de e-mail inserido é inválido!";
        alert(msg);
    }
});

// LOGIN COM O GOOGLE - COM VALIDAÇÃO OBRIGATORIEDADE DE DADOS
btnGoogleAuth.addEventListener('click', async () => {
    try {
        const resultado = await signInWithPopup(auth, googleProvider);
        const user = resultado.user;
        
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            let telPrompt = "";
            let cidPrompt = "";

            while (!telPrompt || telPrompt.replace(/\D/g, "").length < 10) {
                telPrompt = prompt("⚠️ Cadastro Incompleto!\nInsira seu WhatsApp com DDD para ativar sua conta:");
                if (telPrompt === null) {
                    await signOut(auth);
                    alert("❌ Cadastro cancelado. É necessário informar os dados.");
                    return;
                }
            }
            const telefoneLimpo = telPrompt.replace(/\D/g, "");

            while (!cidPrompt || cidPrompt.trim().length < 2) {
                cidPrompt = prompt("⚠️ Cadastro Incompleto!\nInsira a sua Cidade para continuar:");
                if (cidPrompt === null) {
                    await signOut(auth);
                    alert("❌ Cadastro cancelado. É necessário informar os dados.");
                    return;
                }
            }
            const cidadeLimpa = cidPrompt.trim();

            await setDoc(doc(db, "usuarios", user.uid), {
                nome: user.displayName,
                telefone: telefoneLimpo,
                cidade: cidadeLimpa,
                email: user.email
            });
            
            dadosPerfilLogado = { nome: user.displayName, telefone: telefoneLimpo, cidade: cidadeLimpa };
        } else {
            dadosPerfilLogado = docSnap.data();
        }
        
        alert(`Conectado via Google como: ${user.displayName} 🎉`);
        authModal.classList.remove('active');
    } catch (error) {
        if (error.code !== 'auth/cancelled-popup-request') {
            alert("Erro ao logar com o Google: " + error.message);
        }
    }
});

btnLogout.addEventListener('click', () => {
    signOut(auth).then(() => alert("Você saiu da conta."));
});

// BLOQUEIO E VERIFICAÇÃO DE ANÚNCIO
function verificarAcessoAnuncio() {
    if (!usuarioLogado) {
        alert("🔒 Acesso negado! Você precisa preencher seu cadastro/login antes de postar um desapego.");
        isLoginMode = true;
        authModalTitle.textContent = "Entrar na Sua Conta";
        btnAuthSubmit.textContent = "Entrar";
        authToggleLink.textContent = "Não tem conta? Cadastre-se aqui";
        registerFieldsWrap.style.display = "none";
        authModal.classList.add('active'); 
    } else {
        announceModal.classList.add('active');
    }
}

// ATRIBUINDO CLIQUE AOS BOTÕES DE ANÚNCIO PRINCIPAIS
if (openModalBtn) openModalBtn.addEventListener('click', verificarAcessoAnuncio);
if (heroStartBtn) heroStartBtn.addEventListener('click', verificarAcessoAnuncio);

// MÁSCARA DE VALOR
pPriceInput.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor === "") { e.target.value = ""; return; }
    let numero = (parseFloat(valor) / 100).toFixed(2);
    if (paisAtual === 'BR') {
        e.target.value = parseFloat(numero).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
        e.target.value = parseFloat(numero).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
});

// CONFIGURAR PAÍS E REALTIME DE ANÚNCIOS
function configurarPaisESincronizar(pais) {
    paisAtual = pais;
    localStorage.setItem('desapega_pais', pais);
    if (pPriceInput) pPriceInput.value = "";
    
    if (pais === 'BR') {
        if (labelPrice) labelPrice.textContent = "Preço (R$)";
        if (heroSubtitle) heroSubtitle.textContent = "O mercado de desapegos mais rápido, seguro e moderno do Brasil.";
    } else {
        if (labelPrice) labelPrice.textContent = "Preço (€)";
        if (heroSubtitle) heroSubtitle.textContent = "O mercado de desapegos mais rápido, seguro e moderno de Portugal.";
    }

    if (unsubscribeRealtime) unsubscribeRealtime();

    const q = query(collection(db, `anuncios_${paisAtual}`), orderBy("timestamp", "desc"));
    
    unsubscribeRealtime = onSnapshot(q, (snapshot) => {
        const listaProdutos = [];
        snapshot.forEach((doc) => {
            listaProdutos.push({ id: doc.id, ...doc.data() });
        });
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
        novoCard.setAttribute('data-seller-name', prod.vendedorNome || "Vendedor Verificado");

        novoCard.innerHTML = `
            <button class="btn-delete-prod" style="display: ${isAdminMode ? 'block' : 'none'};" title="Apagar Anúncio">🗑️</button>
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
if (closeModalBtn) closeModalBtn.addEventListener('click', () => announceModal.classList.remove('active'));

// BUSCAS E FILTROS DO COMPONENTE DE CRIAÇÃO
function filtrarProdutos() {
    voltarParaLista(); 
    const termoBusca = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const tituloProduto = card.getAttribute('data-title').toLowerCase();
        card.style.display = tituloProduto.includes(termoBusca) ? 'block' : 'none';
    });
}
if (searchBtn) searchBtn.addEventListener('click', filtrarProdutos);
if (searchInput) searchInput.addEventListener('input', filtrarProdutos);

// CORREÇÃO: BOTÕES DE SELEÇÃO DE CATEGORIAS
const botoesCategorias = document.querySelectorAll('.category-card');
botoesCategorias.forEach(botao => {
    botao.addEventListener('click', () => {
        voltarParaLista();
        const categoriaSelecionada = botao.textContent.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").trim();
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
            const tagProduto = card.querySelector('.product-tag').textContent.trim();
            card.style.display = (tagProduto === categoriaSelecionada) ? 'block' : 'none';
        });
    });
});

// CORREÇÃO: VOLTAR PARA LISTA COMPLETA
function voltarParaLista() {
    productDetailsPage.style.display = 'none';
    heroSection.style.display = 'block';
    categoriesSection.style.display = 'block';
    productsSection.style.display = 'block';
    
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => card.style.display = 'block');
    if (searchInput) searchInput.value = "";
}
if (btnBackToList) btnBackToList.addEventListener('click', voltarParaLista);

// CORREÇÃO: CLIQUE NA LOGO DO SITE
const logoBtn = document.querySelector('.logo');
if (logoBtn) logoBtn.addEventListener('click', voltarParaLista);

// CLIQUE NOS CARDS (ABRIR DETALHES)
productsGrid.addEventListener('click', async (e) => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    const idProd = card.getAttribute('data-id');

    if (e.target.classList.contains('btn-delete-prod')) {
        e.stopPropagation();
        if (confirm("Deseja realmente apagar este anúncio de forma GLOBAL?")) {
            try { await deleteDoc(doc(db, `anuncios_${paisAtual}`, idProd)); } catch (error) { alert(error.message); }
        }
        return;
    }

    const titulo = card.querySelector('.product-title').textContent;
    const preco = card.querySelector('.product-price').textContent;
    const local = card.querySelector('.product-location').textContent;
    const tag = card.querySelector('.product-tag').textContent;
    const imgSrc = card.querySelector('.product-img').src;
    const sellerUid = card.getAttribute('data-seller-uid');
    const nomeDoVendedor = card.getAttribute('data-seller-name');

    detailTitle.textContent = titulo;
    detailPrice.textContent = preco;
    detailLocation.textContent = local;
    detailTag.textContent = tag;
    detailImg.src = imgSrc;
    detailSellerName.textContent = `Vendedor: ${nomeDoVendedor}`;

    itemSelecionadoParaCarrinho = { id: idProd, titulo, preco, imagem: imgSrc };

    // Configuração do clique no chat interno
    btnOpenInternalChat.onclick = () => {
        if (!usuarioLogado) {
            alert("🔒 Faça login para iniciar um chat com o vendedor!");
            verificarAcessoAnuncio();
            return;
        }
        if (usuarioLogado.uid === sellerUid) {
            alert("Você não pode abrir uma conversa com você mesmo.");
            return;
        }
        const chatId = usuarioLogado.uid < sellerUid ? `${usuarioLogado.uid}_${sellerUid}` : `${sellerUid}_${usuarioLogado.uid}`;
        abrirJanelaDeConversa(chatId, nomeDoVendedor, sellerUid);
    };

    heroSection.style.display = 'none';
    categoriesSection.style.display = 'none';
    productsSection.style.display = 'none';
    productDetailsPage.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// PUBLICAR NOVO ANÚNCIO
announceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!usuarioLogado) return;

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
        alert("Anúncio publicado com sucesso! 🚀");
    } catch (error) { alert(error.message); }
});

// =========================================================================
// LÓGICA DO CHAT INTERNO EM TEMPO REAL
// =========================================================================
if (btnOpenMyChats) btnOpenMyChats.addEventListener('click', () => chatListSidebar.classList.add('active'));
if (closeChatListBtn) closeChatListBtn.addEventListener('click', () => chatListSidebar.classList.remove('active'));
if (closeChatWindowBtn) closeChatWindowBtn.addEventListener('click', () => chatWindow.classList.remove('active'));

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
            
            const outroNome = dadosChat.nomesParticipantes[0] === (usuarioLogado.displayName || usuarioLogado.email) ? dadosChat.nomesParticipantes[1] : dadosChat.nomesParticipantes[0];
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

async function abrirJanelaDeConversa(chatId, nomeDoOutro, uidDoOutro) {
    currentChatId = chatId;
    chatWithNameLabel.textContent = nomeDoOutro;
    chatWindow.classList.add('active');
    chatMessagesBox.innerHTML = "<p class='loading-chat'>Carregando...</p>";

    await setDoc(doc(db, "chats", chatId), {
        participantes: [usuarioLogado.uid, uidDoOutro],
        nomesParticipantes: [usuarioLogado.displayName || usuarioLogado.email, nomeDoOutro],
        idChat: chatId
    }, { merge: true });

    if (unsubscribeMessages) unsubscribeMessages();

    const msgQuery = query(collection(db, `chats/${chatId}/mensagens`), orderBy("timestamp", "asc"));
    unsubscribeMessages = onSnapshot(msgQuery, (snapshot) => {
        chatMessagesBox.innerHTML = "";
        snapshot.forEach((mDoc) => {
            const msgData = mDoc.data();
            const balao = document.createElement('div');
            balao.classList.add('message-bubble');
            balao.classList.add(msgData.remetenteId === usuarioLogado.uid ? 'me' : 'other');
            balao.textContent = msgData.texto;
            chatMessagesBox.appendChild(balao);
        });
        chatMessagesBox.scrollTop = chatMessagesBox.scrollHeight;
    });
}

chatInputForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const textoMsg = chatMessageInput.value.trim();
    if (!textoMsg || !currentChatId) return;

    chatMessageInput.value = "";

    const novaMensagem = {
        texto: textoMsg,
        remetenteId: usuarioLogado.uid,
        remetenteNome: usuarioLogado.displayName || usuarioLogado.email,
        timestamp: Date.now()
    };

    try {
        await addDoc(collection(db, `chats/${currentChatId}/mensagens`), novaMensagem);
        await updateDoc(doc(db, "chats", currentChatId), {
            ultimaMensagem: textoMsg,
            timestampUltima: Date.now()
        });
    } catch (err) { console.error(err); }
});

// --- LÓGICA DO CARRINHO ---
function atualizarInterfaceCarrinho() {
    cartItemsContainer.innerHTML = "";
    let totalAcumulado = 0;

    carrinho.forEach((item, index) => {
        const nPreco = parseFloat(item.preco.replace(/[^\d,.]/g, "").replace(".", "").replace(",", "."));
        totalAcumulado += isNaN(nPreco) ? 0 : nPreco;

        const divItem = document.createElement('div');
        divItem.classList.add('cart-item-row');
        divItem.innerHTML = `
            <img src="${item.imagem}" alt="">
            <div class="cart-item-info">
                <h4>${item.titulo}</h4>
                <p>${item.preco}</p>
            </div>
            <span class="remove-cart-item" data-index="${index}">&times;</span>
        `;
        cartItemsContainer.appendChild(divItem);
    });

    cartCountLabel.textContent = carrinho.length;
    const moeda = paisAtual === 'BR' ? 'R$' : '€';
    cartTotalValLabel.textContent = `${moeda} ${totalAcumulado.toLocaleString(paisAtual === 'BR' ? 'pt-BR' : 'pt-PT', { minimumFractionDigits: 2 })}`;
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
        const index = e.target.getAttribute('data-index');
        carrinho.splice(index, 1);
        atualizarInterfaceCarrinho();
    }
});

btnCartToggle.addEventListener('click', () => cartSidebar.classList.add('active'));
closeCartBtn.addEventListener('click', () => cartSidebar.classList.remove('active'));
atualizarInterfaceCarrinho();