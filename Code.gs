/**
 * Simulateur d'éligibilité administrative pour enseignants vacataires
 * Fichier principal - Google Apps Script
 */

// Configuration globale
const CONFIG = {
  FORM_ID: '', // À remplir avec l'ID de votre Google Form
  SHEET_ID: '', // À remplir avec l'ID de votre Google Sheet
  EMAIL_TEMPLATE_ID: '', // À remplir avec l'ID du Google Doc template pour les emails
  ADMIN_EMAIL: 'rh@votre-etablissement.fr' // Email de l'administrateur
};

/**
 * Fonction principale déclenchée lors de la soumission du formulaire
 * @param {Object} e - Événement de soumission du formulaire
 */
function onFormSubmit(e) {
  try {
    // Récupérer les réponses du formulaire
    const responses = e.response.getItemResponses();
    const formData = processFormResponses(responses);
    
    // Analyser l'éligibilité selon les règles
    const eligibilityResult = analyzeEligibility(formData);
    
    // Stocker les résultats dans la feuille de calcul
    storeResults(formData, eligibilityResult);
    
    // Envoyer l'email de résultat au candidat
    sendResultEmail(formData.email, formData, eligibilityResult);
    
    // Logger le succès
    console.log('Traitement réussi pour:', formData.email);
    
  } catch (error) {
    console.error('Erreur lors du traitement:', error);
    // Envoyer une notification d'erreur à l'admin
    notifyAdmin('Erreur lors du traitement', error.toString());
  }
}

/**
 * Traiter les réponses du formulaire
 * @param {Array} responses - Réponses brutes du formulaire
 * @return {Object} Données structurées du formulaire
 */
function processFormResponses(responses) {
  const formData = {};
  
  responses.forEach(response => {
    const item = response.getItem();
    const title = item.getTitle();
    const answer = response.getResponse();
    
    // Mapper les questions aux clés de données
    const key = mapQuestionToKey(title);
    if (key) {
      formData[key] = answer;
    }
  });
  
  return formData;
}

/**
 * Mapper les titres de questions aux clés de données
 * @param {string} questionTitle - Titre de la question
 * @return {string} Clé correspondante
 */
function mapQuestionToKey(questionTitle) {
  const mappings = {
    "Quel est votre statut professionnel principal actuel ?": "statutPrincipal",
    "De quelle fonction publique relevez-vous principalement ?": "fonctionPublique",
    "Quel est votre statut précis ?": "statutPrecis",
    "Quelle est votre position administrative actuelle ?": "positionAdmin",
    "Avez-vous obtenu une autorisation écrite de cumul d'activités": "autorisationCumul",
    "Quel est le type de votre contrat de travail principal ?": "typeContrat",
    "Quelle est la durée hebdomadaire de travail": "dureeHebdo",
    "Combien d'heures avez-vous effectivement travaillées": "heuresTravaillees",
    "Quelle est votre nationalité ?": "nationalite",
    "À quelle adresse email souhaitez-vous recevoir le récapitulatif": "email"
    // Ajouter tous les mappings nécessaires
  };
  
  // Rechercher la clé correspondante
  for (const [pattern, key] of Object.entries(mappings)) {
    if (questionTitle.includes(pattern)) {
      return key;
    }
  }
  
  return null;
}

/**
 * Initialiser le déclencheur pour le formulaire
 */
function setupFormTrigger() {
  const form = FormApp.openById(CONFIG.FORM_ID);
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();
}

/**
 * Fonction d'installation initiale
 */
function onInstall() {
  setupFormTrigger();
  createMenus();
}

/**
 * Créer les menus personnalisés
 */
function createMenus() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Simulateur Vacataires')
    .addItem('Tableau de bord', 'showDashboard')
    .addItem('Exporter les résultats', 'exportResults')
    .addItem('Configuration', 'showConfig')
    .addSeparator()
    .addItem('À propos', 'showAbout')
    .addToUi();
}