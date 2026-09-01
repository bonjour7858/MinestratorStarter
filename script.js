// ==========================================
// 1. CONFIGURATION DE SUPABASE
// ==========================================
// ⚠️ Remplace ces valeurs par tes identifiants trouvables dans Supabase (Settings > API)
const SUPABASE_URL = "https://bpvcdtuvwbliaqxxmodq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bBnDkvUYr1uX70YcCm9WjQ_lfO65iHt";

// Initialisation du client Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// 2. ÉLÉMENTS DU DOM (HTML)
// ==========================================
const authBox = document.getElementById('auth-box');
const adminPanel = document.getElementById('admin-panel');
const userEmailSpan = document.getElementById('user-email');
const statusMsg = document.getElementById('status-msg');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

// ==========================================
// 3. GESTION DE LA SESSION & AUTHENTIFICATION
// ==========================================

// Vérifier si un utilisateur est déjà connecté au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    showAdminPanel(session.user.email);
  }
});

// Fonction de connexion
async function login() {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Veuillez remplir tous les champs.", "red");
    return;
  }

  showMessage("Connexion en cours...", "white");

  const { data, error } = await supabase.auth.signInWithPassword({
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

// Fonction de déconnexion
async function logout() {
  await supabase.auth.signOut();
  authBox.classList.remove('hidden');
  adminPanel.classList.add('hidden');
  emailInput.value = '';
  passwordInput.value = '';
  showMessage("Vous avez été déconnecté.", "white");
}

// Afficher le panneau administration
function showAdminPanel(email) {
  userEmailSpan.textContent = email;
  authBox.classList.add('hidden');
  adminPanel.classList.remove('hidden');
}

// ==========================================
// 4. GESTION DES COMMANDES SERVEUR
// ==========================================

// Envoyer la demande d'action (start, stop, restart) dans Supabase
async function requestAction(actionName) {
  showMessage(`Demande de "${actionName}" en cours d'envoi...`, "white");

  // Récupérer la session actuelle pour vérifier qu'on est bien connecté
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    showMessage("Session expirée. Veuillez vous reconnecter.", "red");
    logout();
    return;
  }

  // Insertion de la commande dans la table 'server_commands'
  const { error } = await supabase
    .from('server_commands')
    .insert([
      { action: actionName, status: 'pending' }
    ]);

  if (error) {
    showMessage("Erreur lors de l'envoi : " + error.message, "red");
  } else {
    showMessage(`Ordre "${actionName}" transmis ! GitHub Actions va l'exécuter dans un instant.`, "green");
  }
}

// Helper pour afficher les messages de statut avec couleur
function showMessage(message, color) {
  statusMsg.style.color = color === "red" ? "#f44336" : (color === "green" ? "#4caf50" : "#ffffff");
  statusMsg.textContent = message;
}
