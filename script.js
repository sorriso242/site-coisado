// 🔥 IMPORTAR FUNÇÕES DO FIREBASE E AUTHENTICATION
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, onSnapshot, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
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
const btnChatZap = document.getElementById('btnChatZap');

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

let isLoginMode = true; 
let usuarioLogado = null;
let dadosPerfilLogado = null; // Guarda telefone e cidade da nuvem
let carrinho = JSON.parse(localStorage.getItem('desapega_cart')) || [];

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
        // Puxar telefone e cidade complementares salvos no Firestore
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            dadosPerfilLogado = docSnap.data();
        }
        
        const nomeParaMostrar = user.displayName || user.email;
        userStatusText.textContent = `Conectado como: ${nomeParaMostrar}`;
        btnShowLogin.style.display = 'none';
        btnLogout.style.display = 'inline-block';
    } else {
        usuarioLogado = null;
        dadosPerfilLogado = null;
        userStatusText.textContent = "Olá, visitante! Faça login para anunciar.";
        btnShowLogin.style.display = 'inline-block';
        btnLogout.style.display = 'none';
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
        authNameInput.removeAttribute('required');
        authPhoneInput.removeAttribute('required');
        authCityInput.removeAttribute('required');
    } else {
        authModalTitle.textContent = "Criar Nova Conta";
        btnAuthSubmit.textContent = "Cadastrar Usuário";
        authToggleLink.textContent = "Já tem uma conta? Faça login";
        registerFieldsWrap.style.display = "block";
        authNameInput.setAttribute('required', 'true');
        authPhoneInput.setAttribute('required', 'true');
        authCityInput.setAttribute('required', 'true');
    }
});

// SUBMIT FORMULÁRIO DE AUTH
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
            const cidade = authCityInput.value.trim();

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: nome });
            
            // Salva dados adicionais requeridos na coleção "usuarios"
            await setDoc(doc(db, "usuarios", userCredential.user.uid), {
                nome: nome,
                telefone: telefone,
                cidade: cidade,
                email: email
            });

            dadosPerfilLogado = { nome, telefone, cidade };
            alert(`Conta criada com sucesso! Bem-vindo(a), ${nome}! 🚀`);
        }
        authForm.reset();
        authModal.classList.remove('active');
    } catch (error) {
        alert("Erro na autenticação: " + error.message);
    }
});

// LOGIN COM O GOOGLE
btnGoogleAuth.addEventListener('click', async () => {
    try {
        const resultado = await signInWithPopup(auth, googleProvider);
        const user = resultado.user;
        
        // Verifica se o usuário do Google já tem dados extras, senão cria um padrão inicial
        const docRef = doc(db, "usuarios", user.uid);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            let telPrompt = prompt("Insira seu número do WhatsApp com DDD para contato de vendas (Apenas números):") || "";
            let cidPrompt = prompt("Insira sua Cidade:") || "Não Informada";
            telPrompt = telPrompt.replace(/\D/g, "");

            await setDoc(doc(db, "usuarios", user.uid), {
                nome: user.displayName,
                telefone: telPrompt,
                cidade: cidPrompt,
                email: user.email
            });
            dadosPerfilLogado = { nome: user.displayName, telefone: telPrompt, cidade: cidPrompt };
        }
        alert(`Conectado via Google como: ${user.displayName} 🎉`);
        authModal.classList.remove('active');
    } catch (error) {
        alert("Erro ao logar com o Google: " + error.message);
    }
});

btnLogout.addEventListener('click', () => {
    signOut(auth).then(() => alert("Você saiu da conta."));
});

btnShowLogin.addEventListener('click', () => {
    isLoginMode = true;
    authModalTitle.textContent = "Entrar na Sua Conta";
    btnAuthSubmit.textContent = "Entrar";
    authToggleLink.textContent = "Não tem conta? Cadastre-se aqui";
    registerFieldsWrap.style.display = "none";
    authModal.classList.add('active');
});
closeAuthModalBtn.addEventListener('click', () => authModal.classList.remove('active'));

// BLOQUEIO DE ANÚNCIO
function verificarAcessoAnuncio() {
    if (!usuarioLogado) {
        alert("🔒 Acesso negado! Você precisa preencher seu cadastro/login antes de postar um desapego.");
        btnShowLogin.click(); 
    } else {
        announceModal.classList.add('active');
    }
}
openModalBtn.addEventListener('click', verificarAcessoAnuncio);
heroStartBtn.addEventListener('click', verificarAcessoAnuncio);

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

// CONFIGURAR PAÍS E REALTIME
function configurarPaisESincronizar(pais) {
    paisAtual = pais;
    localStorage.setItem('desapega_pais', pais);
    pPriceInput.value = "";
    
    if (pais === 'BR') {
        labelPrice.textContent = "Preço (R$)";
        heroSubtitle.textContent = "O mercado de desapegos mais rápido, seguro e moderno do Brasil.";
    } else {
        labelPrice.textContent = "Preço (€)";
        heroSubtitle.textContent = "O mercado de desapegos mais rápido, seguro e moderno de Portugal.";
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
        novoCard.setAttribute('data-phone', prod.vendedorTelefone || "");
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
                <button class="btn-edit-prod" style="display: ${isAdminMode ? 'inline-block' : 'none'};">✏️ Editar</button>
            </div>
        `;
        productsGrid.appendChild(novoCard);
    });
}
configurarPaisESincronizar(paisAtual);
closeModalBtn.addEventListener('click', () => announceModal.classList.remove('active'));

// BUSCAS E FILTROS
function filtrarProdutos() {
    voltarParaLista(); 
    const termoBusca = searchInput.value.toLowerCase().trim();
    const cards = document.querySelectorAll('.product-card');
    cards.forEach(card => {
        const tituloProduto = card.getAttribute('data-title').toLowerCase();
        card.style.display = tituloProduto.includes(termoBusca) ? 'block' : 'none';
    });
}
searchBtn.addEventListener('click', filtrarProdutos);
searchInput.addEventListener('input', filtrarProdutos);

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
    const numTelefone = card.getAttribute('data-phone').replace(/\D/g, "");
    const nomeDoVendedor = card.getAttribute('data-seller-name');

    detailTitle.textContent = titulo;
    detailPrice.textContent = preco;
    detailLocation.textContent = local;
    detailTag.textContent = tag;
    detailImg.src = imgSrc;
    detailSellerName.textContent = `Vendedor: ${nomeDoVendedor}`;

    // Guarda a referência do item atual para o botão do carrinho usar
    itemSelecionadoParaCarrinho = { id: idProd, titulo, preco, telefone: numTelefone, imagem: imgSrc };

    if (numTelefone) {
        const textoZap = encodeURIComponent(`Olá! Vi seu anúncio de "${titulo}" por ${preco} no DesapegaGeral e quero negociar!`);
        btnChatZap.onclick = () => {
            window.open(`https://api.whatsapp.com/send?phone=${numTelefone}&text=${textoZap}`, '_blank');
        };
    } else {
        btnChatZap.onclick = () => { alert("Este vendedor não cadastrou contato."); };
    }

    heroSection.style.display = 'none';
    categoriesSection.style.display = 'none';
    productsSection.style.display = 'none';
    productDetailsPage.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

function voltarParaLista() {
    productDetailsPage.style.display = 'none';
    heroSection.style.display = 'block';
    categoriesSection.style.display = 'block';
    productsSection.style.display = 'block';
}
btnBackToList.addEventListener('click', voltarParaLista);
document.querySelector('.logo').addEventListener('click', voltarParaLista);

// PUBLICAR NOVO ANÚNCIO (Dados automáticos do usuário logado)
announceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!usuarioLogado || !dadosPerfilLogado) { 
        alert("Sessão ou dados do perfil ausentes. Por favor refaça o login."); 
        return; 
    }

    const novoProduto = {
        titulo: document.getElementById('pTitle').value,
        preco: pPriceInput.value,
        categoria: document.getElementById('pCategory').value,
        imagem: document.getElementById('pImgUrl').value.trim() || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        localizacao: "📍 " + (dadosPerfilLogado.cidade || "Brasil"),
        vendedorUid: usuarioLogado.uid, 
        vendedorNome: dadosPerfilLogado.nome || usuarioLogado.displayName || usuarioLogado.email,
        vendedorTelefone: dadosPerfilLogado.telefone || "",
        timestamp: Date.now()
    };

    try {
        await addDoc(collection(db, `anuncios_${paisAtual}`), novoProduto);
        announceForm.reset();
        announceModal.classList.remove('active');
        voltarParaLista();
        alert("Anúncio publicado com sucesso com seus dados de perfil! 🚀");
    } catch (error) { alert(error.message); }
});

// --- LÓGICA CORE DO CARRINHO DE COMPRAS ---
function atualizarInterfaceCarrinho() {
    cartItemsContainer.innerHTML = "";
    let totalAcumulado = 0;

    carrinho.forEach((item, index) => {
        // Converte string de preço limpa para cálculo rápido
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

// Botão Adicionar ao Carrinho (Tela de Detalhes)
btnAddToCartDetail.addEventListener('click', () => {
    if (itemSelecionadoParaCarrinho) {
        carrinho.push(itemSelecionadoParaCarrinho);
        atualizarInterfaceCarrinho();
        alert("Produto adicionado ao seu carrinho! 🛒");
        cartSidebar.classList.add('active'); // Abre a barra lateral do carrinho
    }
});

// Remover item do carrinho
cartItemsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-cart-item')) {
        const index = e.target.getAttribute('data-index');
        carrinho.splice(index, 1);
        atualizarInterfaceCarrinho();
    }
});

// Abrir/Fechar Carrinho Lateral
btnCartToggle.addEventListener('click', () => cartSidebar.classList.add('active'));
closeCartBtn.addEventListener('click', () => cartSidebar.classList.remove('active'));

// Finalizar pedido enviando a lista condensada para o WhatsApp do suporte do Marketplace
btnCheckoutCart.addEventListener('click', () => {
    if (carrinho.length === 0) { alert("Seu carrinho está vazio!"); return; }
    
    let mensagemPedido = "🛍️ *Novo Pedido - DesapegaGeral*\n\nGostaria de comprar estes itens:\n";
    carrinho.forEach((item, i) => {
        mensagemPedido += `\n${i+1}) *${item.titulo}* - ${item.preco}\n   Contato do Vendedor: wa.me/${item.telefone}\n`;
    });
    mensagemPedido += `\n*Total Geral:* ${cartTotalValLabel.textContent}`;
    
    // Altere este número abaixo (5511999999999) para o número que vai gerenciar ou intermediar as compras do site se quiser
    window.open(`https://api.whatsapp.com/send?phone=5511999999999&text=${encodeURIComponent(mensagemPedido)}`, '_blank');
});

// Inicializa carrinho
atualizarInterfaceCarrinho();

// ADMIN SECRET (Ctrl + Shift + A)
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        adminAccessBtn.style.display = adminAccessBtn.style.display === 'none' ? 'inline-block' : 'none';
    }
});
adminAccessBtn.addEventListener('click', () => {
    if (!isAdminMode) {
        if (prompt("Senha do Administrador:") === "admin123") {
            isAdminMode = true;
            adminBadge.style.display = 'inline-block';
            adminAccessBtn.textContent = "🔓 Sair do Admin";
            configurarPaisESincronizar(paisAtual);
        }
    } else {
        isAdminMode = false;
        adminBadge.style.display = 'none';
        adminAccessBtn.textContent = "🔒 Painel Admin";
        configurarPaisESincronizar(paisAtual);
    }
});