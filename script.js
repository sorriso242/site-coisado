// 🔥 IMPORTAR FUNÇÕES DO FIREBASE DA CDN DA GOOGLE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, updateDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// SUAS CHAVES DO FIREBASE CONFIGURADAS
const firebaseConfig = {
  apiKey: "AIzaSyCVm5XjSiqAUopQ34ENu9-853YdmeMdfdM",
  authDomain: "desapegageral-90792.firebaseapp.com",
  projectId: "desapegageral-90792",
  storageBucket: "desapegageral-90792.firebasestorage.app",
  messagingSenderId: "855647834590",
  appId: "1:855647834590:web:a59b8b150309a016a04d4f"
};

// Inicializar Firebase e Firestore (Nuvem)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

// MÁSCARA DE FORMATAÇÃO DE MOEDA EM TEMPO REAL (Ex: 100.000.000)
pPriceInput.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
    
    if (valor === "") {
        e.target.value = "";
        return;
    }

    // Transforma em formato numérico decimal
    let numero = (parseFloat(valor) / 100).toFixed(2);
    
    // Aplica a formatação visual baseada no país selecionado
    if (paisAtual === 'BR') {
        e.target.value = parseFloat(numero).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
        e.target.value = parseFloat(numero).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
});

// CONFIGURAR IDIOMA/MOEDA E SINCRONIZAR COM O FIREBASE EM TEMPO REAL
function configurarPaisESincronizar(pais) {
    paisAtual = pais;
    localStorage.setItem('desapega_pais', pais);
    pPriceInput.value = ""; // Limpa para evitar conflito de moedas
    
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

// RENDERIZAR CARDS NO HTML
function renderizarProdutos(lista) {
    productsGrid.innerHTML = '';
    const simboloMoeda = paisAtual === 'BR' ? 'R$' : '€';

    lista.forEach(prod => {
        const novoCard = document.createElement('div');
        novoCard.classList.add('product-card');
        novoCard.setAttribute('data-id', prod.id);
        novoCard.setAttribute('data-title', prod.titulo.toLowerCase());

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

// GESTÃO DO MODAL
openModalBtn.addEventListener('click', () => {
    pPriceInput.value = ""; 
    announceModal.classList.add('active');
});
closeModalBtn.addEventListener('click', () => announceModal.classList.remove('active'));
window.addEventListener('click', (e) => { if (e.target === announceModal) announceModal.classList.remove('active'); });

// FILTROS DE BUSCA E CATEGORIA
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

// EVENTOS NOS CARDS (VER DETALHES, APAGAR E EDITAR)
productsGrid.addEventListener('click', async (e) => {
    const card = e.target.closest('.product-card');
    if (!card) return;
    
    const idProd = card.getAttribute('data-id');

    if (e.target.classList.contains('btn-delete-prod')) {
        e.stopPropagation();
        if (confirm("Deseja realmente apagar este anúncio de forma GLOBAL?")) {
            try {
                await deleteDoc(doc(db, `anuncios_${paisAtual}`, idProd));
            } catch (error) {
                alert("Erro ao apagar da nuvem: " + error.message);
            }
        }
        return;
    }

    if (e.target.classList.contains('btn-edit-prod')) {
        e.stopPropagation();
        const novoTitulo = prompt("Novo título do produto:");
        const novoPreco = prompt("Novo preço (Use o formato formatado ex: 2.500,00):");
        const novaLocalidade = prompt("Nova cidade:");

        const dadosAtualizados = {};
        if (novoTitulo) dadosAtualizados.titulo = novoTitulo;
        if (novoPreco) dadosAtualizados.preco = novoPreco;
        if (novaLocalidade) dadosAtualizados.localizacao = "📍 " + novaLocalidade;

        if (Object.keys(dadosAtualizados).length > 0) {
            try {
                await updateDoc(doc(db, `anuncios_${paisAtual}`, idProd), dadosAtualizados);
            } catch (error) {
                alert("Erro ao atualizar na nuvem: " + error.message);
            }
        }
        return;
    }

    const titulo = card.querySelector('.product-title').textContent;
    const preco = card.querySelector('.product-price').textContent;
    const local = card.querySelector('.product-location').textContent;
    const tag = card.querySelector('.product-tag').textContent;
    const imgSrc = card.querySelector('.product-img').src;

    detailTitle.textContent = titulo;
    detailPrice.textContent = preco;
    detailLocation.textContent = local;
    detailTag.textContent = tag;
    detailImg.src = imgSrc;

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

// 🔥 ENVIAR NOVO ANÚNCIO PARA O CLOUD FIRESTORE
announceForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('pTitle').value;
    const preco = pPriceInput.value; // Salva o valor exatamente com os pontos inseridos na máscara
    const categoria = document.getElementById('pCategory').value;
    const localizacao = "📍 " + document.getElementById('pLocation').value;
    let urlImagem = document.getElementById('pImgUrl').value.trim();

    if (!urlImagem) {
        urlImagem = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80";
    }

    const novoProduto = {
        titulo: titulo,
        preco: preco,
        categoria: categoria,
        localizacao: localizacao,
        imagem: urlImagem,
        timestamp: Date.now()
    };

    try {
        await addDoc(collection(db, `anuncios_${paisAtual}`), novoProduto);
        announceForm.reset();
        announceModal.classList.remove('active');
        voltarParaLista();
    } catch (error) {
        alert("Erro ao salvar o anúncio na nuvem: " + error.message);
    }
});

// 🔑 COMBINAÇÃO SECRETA PARA O ADMIN (Apenas você sabe)
// Pressione simultaneamente no seu teclado: Ctrl + Shift + A
window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        // Revela o botão secreto no rodapé da página
        if (adminAccessBtn.style.display === 'none') {
            adminAccessBtn.style.display = 'inline-block';
            alert("🔒 Botão de acesso do Administrador revelado no rodapé!");
        } else {
            adminAccessBtn.style.display = 'none';
        }
    }
});

// AÇÃO DO PAINEL ADMINISTRADOR (Senha: admin123)
adminAccessBtn.addEventListener('click', () => {
    if (!isAdminMode) {
        const senha = prompt("Digite a senha do Administrador:");
        if (senha === "admin123") {
            isAdminMode = true;
            adminBadge.style.display = 'inline-block';
            adminAccessBtn.textContent = "🔓 Sair do Admin";
            configurarPaisESincronizar(paisAtual);
        } else {
            alert("Senha incorreta!");
        }
    } else {
        isAdminMode = false;
        adminBadge.style.display = 'none';
        adminAccessBtn.textContent = "🔒 Painel Admin";
        adminAccessBtn.style.display = 'none'; // Esconde o botão novamente ao sair
        configurarPaisESincronizar(paisAtual);
    }
});