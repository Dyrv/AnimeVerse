//Variaveis globais
const button = document.getElementById('button');
const menu = document.getElementById('menu');

//Função para registar o utilizador no Supabase
async function signup() {
    const form = document.getElementById('signupForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email, senha: data.password })
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            localStorage.setItem('isLoggedIn', 'true'); // Armazena o estado de login
            window.location.href = "index.html";
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Erro ao realizar signup:', error);
        alert('Erro ao realizar signup.');
    }
}

//Função para logar o utilizador
async function login() {
    const form = document.getElementById('loginForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: data.email, senha: data.password })
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('isLoggedIn', 'true'); // Armazena o estado de login
            window.location.href = "index.html";
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Erro ao realizar login:', error);
        alert('Erro ao realizar login.');
    }
}

document.getElementById('signupForm').addEventListener('submit', (event) => {
    event.preventDefault();//Prevenir o comportamento padrão do formulário
    signup();//Chamar a função de registo
});

document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();//Prevenir o comportamento padrão do formulário
    login();//Chamar a função de login
});