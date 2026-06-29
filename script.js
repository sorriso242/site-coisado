// 🔥 IMPORTAR FUNÇÕES DO FIREBASE E AUTHENTICATION DA CDN DA GOOGLE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// SUAS CHAVES DO FIREBASE CONFIGURADAS
const firebaseConfig = {
  apiKey: "AIzaSyCVm5XjSiqAUopQ34ENu9-853YdmeMdfdM",
  authDomain: "desapegageral-90792.firebaseapp.com",
  projectId: "desapegageral-90792",
  storageBucket: "desapegageral-90792.firebasestorage.app",
  messagingSenderId: "855647834590",
  appId: "1:855647834590:web:a59b8b150309a016a04d4f"
};

// Inicializar Firebase, Firestore e Auth
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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
const authEmailInput = document.getElementById('authEmail');
const authPasswordInput = document.getElementById('authPassword');

let isLoginMode = true; 
let usuarioLogado = null;

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

let paisAtual = localStorage.getItem('desapega_pais') || 'BR';
countrySelect.value = paisAtual;
let unsubscribeRealtime = null;

// MONITOR DE USUÁRIO LOGADO (TEMPO REAL)
onAuthStateChanged(auth, (user) => {
    if (user) {
        usuarioLogado = user;
        userStatusText.textContent = `Conectado como: ${user.email}`;
        btnShowLogin.style.display = 'none';
        btnLogout.style.display = 'inline-block';
    } else {
        usuarioLogado = null;
        userStatusText.textContent = "Olá, visitante! Faça login para anunciar.";
        btnShowLogin.style.display = 'inline-block';
        btnLogout.style.display = 'none';
    }
});

// LÓGICA DO FORMULÁRIO DE LOGIN / CADASTRO
authToggleLink.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        authModalTitle.textContent = "Entrar na Sua Conta";
        btnAuthSubmit.textContent = "Entrar";
        authToggleLink.textContent = "Não tem conta? Cadastre-se aqui";
    } else {
        authModalTitle.textContent = "Criar Nova Conta";
        btnAuthSubmit.textContent = "Cadastrar Usuário";
        authToggleLink.textContent = "Já tem uma conta? Faça login";
    }
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = authEmailInput.value.trim();
    const password = authPasswordInput.value;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login realizado com sucesso! 🎉");
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
            alert("Conta criada com sucesso! Você já está logado. 🚀");
        }
        authForm.reset();
        authModal.classList.remove('active');
    } catch (error) {
        let msg = "Erro na autenticação: " + error.message;
        if (error.code === 'auth/wrong-password') msg = "Senha incorreta!";
        if (error.code === 'auth/user-not-found') msg = "Usuário não encontrado!";
        if (error.code === 'auth/email-already-in-use') msg = "Este e-mail já está cadastrado!";
        if (error.code === 'auth/weak-password') msg = "A senha precisa ter pelo menos 6 caracteres!";
        alert(msg);
    }
});

btnLogout.addEventListener('click', () => {
    signOut(auth).then(() => alert("Você saiu da conta."));
});

// MODAL DE AUTH CONTROLES
btnShowLogin.addEventListener('click', () => {
    isLoginMode = true;
    authModalTitle.textContent = "Entrar na Sua Conta";
    btnAuthSubmit.textContent = "Entrar";
    authToggleLink.textContent = "Não tem conta? Cadastre-se aqui";
    authModal.classList.add('active');
});
closeAuthModalBtn.addEventListener('click', () => authModal.classList.remove('active'));

// BLOQUEIO DE ANÚNCIO SE NÃO ESTIVER LOGADO
function verificarAcessoAnuncio() {
    if (!usuarioLogado) {
        alert("🔒 Acesso negado! Você precisa criar uma conta ou fazer login para postar um desapego.");
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

// CONFIGURAR SINCRO
function configurarPaisESincronizar(pais) {
    paisAtual = pais;
    localStorage.setItem('desapega_pais', pais);
    pPriceInput.value = "";
    
    if (pais === 'BR') {
        labelPrice.textContent = "Preço (R$)";
        document.getElementById('pLocation').placeholder = "Ex: São Paulo";
        heroSubtitle.textContent = "O mercado de desapegos mais rápido, seguro e moderno do Brasil.";
    } else {
        labelPrice.textContent = "Preço (€)";
        document.getElementById('pLocation').placeholder = "Ex: Faro";
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
        // Guardando o telefone de forma oculta para ler depois ao clicar
        novoCard.setAttribute('data-phone', prod.telefone || "");

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

window.addEventListener('click', (e) => { 
    if (e.target === announceModal) announceModal.classList.remove('active'); 
    if (e.target === authModal) authModal.classList.remove('active');
});

// BUSCAS
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

// INTERAÇÃO CARDS
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

    if (e.target.classList.contains('btn-edit-prod')) {
        e.stopPropagation();
        const novoTitulo = prompt("Novo título:");
        const novoPreco = prompt("Novo preço:");
        const novaLocalidade = prompt("Nova cidade:");
        const dados = {};
        if (novoTitulo) dados.titulo = novoTitulo;
        if (novoPreco) dados.preco = novoPreco;
        if (novaLocalidade) dados.localizacao = "📍 " + novaLocalidade;
        if (Object.keys(dados).length > 0) {
            try { await updateDoc(doc(db, `anuncios_${paisAtual}`, idProd), dados); } catch (error) { alert(error.message); }
        }
        return;
    }

    const titulo = card.querySelector('.product-title').textContent;
    const preco = card.querySelector('.product-price').textContent;
    const local = card.querySelector('.product-location').textContent;
    const tag = card.querySelector('.product-tag').textContent;
    const imgSrc = card.querySelector('.product-img').src;
    const numTelefone = card.getAttribute('data-phone').replace(/\D/g, ""); // Remove espaços e parênteses

    detailTitle.textContent = titulo;
    detailPrice.textContent = preco;
    detailLocation.textContent = local;
    detailTag.textContent = tag;
    detailImg.src = imgSrc;

    // Configurar o link de redirecionamento dinâmico do WhatsApp
    if (numTelefone) {
        const textoZap = encodeURIComponent(`Olá! Vi seu anúncio do produto "${titulo}" por ${preco} no DesapegaGeral e tenho interesse! Ainda está disponível?`);
        btnChatZap.onclick = () => {
            window.open(`https://api.whatsapp.com/send?phone=${numTelefone}&text=${textoZap}`, '_blank');
        };
    } else {
        btnChatZap.onclick = () => {
            alert("Este vendedor não cadastrou um número de contato.");
        };
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

// SALVAR ANÚNCIO
announceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!usuarioLogado) { alert("Sessão expirada. Faça login."); return; }

    const numTelefoneLimpo = document.getElementById('pPhone').value.replace(/\D/g, "");

    const novoProduto = {
        titulo: document.getElementById('pTitle').value,
        preco: pPriceInput.value,
        telefone: numTelefoneLimpo, // Salva o número inserido
        categoria: document.getElementById('pCategory').value,
        localizacao: "📍 " + document.getElementById('pLocation').value,
        imagem: document.getElementById('pImgUrl').value.trim() || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
        vendedorUid: usuarioLogado.uid, 
        timestamp: Date.now()
    };

    try {
        await addDoc(collection(db, `anuncios_${paisAtual}`), novoProduto);
        announceForm.reset();
        announceModal.classList.remove('active');
        voltarParaLista();
    } catch (error) { alert(error.message); }
});

// ADMIN SECRET (Ctrl + Shift + A)
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (adminAccessBtn.style.display === 'none') {
            adminAccessBtn.style.display = 'inline-block';
            alert("🔒 Painel do Admin revelado no rodapé!");
        } else {
            adminAccessBtn.style.display = 'none';
        }
    }
});

adminAccessBtn.addEventListener('click', () => {
    if (!isAdminMode) {
        if (prompt("Senha do Administrador:") === "admin123") {
            isAdminMode = true;
            adminBadge.style.display = 'inline-block';
            adminAccessBtn.textContent = "🔓 Sair do Admin";
            configurarPaisESincronizar(paisAtual);
        } else { alert("Senha incorreta!"); }
    } else {
        isAdminMode = false;
        adminBadge.style.display = 'none';
        adminAccessBtn.textContent = "🔒 Painel Admin";
        adminAccessBtn.style.display = 'none';
        configurarPaisESincronizar(paisAtual);
    }
});