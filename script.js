// 1. CONFIGURATION DE SUPABASE
// ==========================================
const SUPABASE_URL = "https://bpvcdtuvwbliaqxxmodq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bBnDkvUYr1uX70YcCm9WjQ_lfO65iHt";

// On renomme la variable pour éviter le conflit avec la bibliothèque
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. ÉLÉMENTS DU DOM
// ==========================================
const authBox = document.getElementById('auth-box');
const adminPanel = document.getElementById('admin-panel');
const userEmailSpan = document.getElementById('user-email');
const statusMsg = document.getElementById('status-msg');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// ==========================================
// 3. AUTHENTIFICATION
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    showAdminPanel(session.user.email);
  }
});

async function login() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Veuillez remplir tous les champs.", "red");
    return;
  }

  showMessage("Connexion en cours...", "white");

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    showMessage("Erreur de connexion : " + error.message, "red");
  } else {
    showAdminPanel(data.user.email);
    showMessage("Connexion réussie !", "green");
  }
}

async function logout() {
  await supabaseClient.auth.signOut();
  authBox.classList.remove('hidden');
  adminPanel.classList.add('hidden');
  emailInput.value = '';
  passwordInput.value = '';
  showMessage("Vous avez été déconnecté.", "white");
}

function showAdminPanel(email) {
  userEmailSpan.textContent = email;
  authBox.classList.add('hidden');
  adminPanel.classList.remove('hidden');
}

// ==========================================
// 4. COMMANDES SERVEUR
// ==========================================
async function requestAction(actionName) {
  showMessage(`Demande de "${actionName}" en cours d'envoi...`, "white");

  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    showMessage("Session expirée. Veuillez vous reconnecter.", "red");
    logout();
    return;
  }

  const { error } = await supabaseClient
    .from('server_commands')
    .insert([
      { action: actionName, status: 'pending' }
    ]);

  if (error) {
    showMessage("Erreur lors de l'envoi : " + error.message, "red");
  } else {
    showMessage(`Ordre "${actionName}" transmis à Supabase !`, "green");
  }
}

function showMessage(message, color) {
  statusMsg.style.color = color === "red" ? "#f44336" : (color === "green" ? "#4caf50" : "#ffffff");
  statusMsg.textContent = message;
}
