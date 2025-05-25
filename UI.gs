 * Module Interface Utilisateur
 * Gère les interfaces HTML et les interactions utilisateur
 */

/**
 * Afficher le tableau de bord
 */
function showDashboard() {
  const html = HtmlService.createHtmlOutputFromFile('dashboard')
    .setTitle('Tableau de bord - Simulateur Vacataires')
    .setWidth(800)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Tableau de bord');
}

/**
 * Afficher la page de configuration
 */
function showConfig() {
  const html = HtmlService.createHtmlOutputFromFile('config')
    .setTitle('Configuration - Simulateur Vacataires')
    .setWidth(600)
    .setHeight(400);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'Configuration');
}

/**
 * Afficher la page À propos
 */
function showAbout() {
  const html = HtmlService.createHtmlOutputFromFile('about')
    .setTitle('À propos - Simulateur Vacataires')
    .setWidth(500)
    .setHeight(400);
  
  SpreadsheetApp.getUi().showModalDialog(html, 'À propos');
}

/**
 * Obtenir les données pour le tableau de bord
 * @return {Object} Données du tableau de bord
 */
function getDashboardData() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const dataSheet = spreadsheet.getSheetByName('Résultats');
  
  if (!dataSheet || dataSheet.getLastRow() <= 1) {
    return {
      total: 0,
      eligible: 0,
      notEligible: 0,
      byStatus: {},
      recentSubmissions: [],
      lastUpdate: new Date().toLocaleString('fr-FR')
    };
  }
  
  const stats = calculateStatistics(dataSheet);
  
  // Obtenir les 10 dernières soumissions
  const lastRows = Math.min(10, dataSheet.getLastRow() - 1);
  const recentData = dataSheet.getRange(dataSheet.getLastRow() - lastRows + 1, 1, lastRows, 4).getValues();
  
  const recentSubmissions = recentData.map(row => ({
    date: row[0],
    email: row[1],
    status: row[2],
    result: row[3]
  })).reverse();
  
  return {
    ...stats,
    recentSubmissions,
    lastUpdate: new Date().toLocaleString('fr-FR')
  };
}

/**
 * Obtenir la configuration actuelle
 * @return {Object} Configuration
 */
function getConfig() {
  return {
    formId: CONFIG.FORM_ID,
    sheetId: CONFIG.SHEET_ID,
    emailTemplateId: CONFIG.EMAIL_TEMPLATE_ID,
    adminEmail: CONFIG.ADMIN_EMAIL
  };
}

/**
 * Sauvegarder la configuration
 * @param {Object} newConfig - Nouvelle configuration
 */
function saveConfig(newConfig) {
  // Dans un environnement réel, vous devriez stocker ceci dans les Properties Service
  const scriptProperties = PropertiesService.getScriptProperties();
  
  scriptProperties.setProperties({
    'FORM_ID': newConfig.formId,
    'SHEET_ID': newConfig.sheetId,
    'EMAIL_TEMPLATE_ID': newConfig.emailTemplateId,
    'ADMIN_EMAIL': newConfig.adminEmail
  });
  
  // Mettre à jour la configuration en mémoire
  CONFIG.FORM_ID = newConfig.formId;
  CONFIG.SHEET_ID = newConfig.sheetId;
  CONFIG.EMAIL_TEMPLATE_ID = newConfig.emailTemplateId;
  CONFIG.ADMIN_EMAIL = newConfig.adminEmail;
  
  return { success: true, message: 'Configuration sauvegardée avec succès' };
}

/**
 * Exporter les résultats au format CSV
 */
function exportResults() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const dataSheet = spreadsheet.getSheetByName('Résultats');
  
  if (!dataSheet || dataSheet.getLastRow() <= 1) {
    SpreadsheetApp.getUi().alert('Aucune donnée à exporter');
    return;
  }
  
  // Créer un nouveau fichier
  const fileName = `Export_Simulateur_Vacataires_${new Date().toISOString().split('T')[0]}.csv`;
  const folder = DriveApp.getRootFolder();
  
  // Obtenir les données
  const data = dataSheet.getDataRange().getValues();
  
  // Convertir en CSV
  const csv = convertToCSV(data);
  
  // Créer le fichier
  const blob = Utilities.newBlob(csv, 'text/csv', fileName);
  const file = folder.createFile(blob);
  
  // Afficher le lien
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    'Export terminé',
    `Le fichier a été créé : ${file.getName()}\
\
Voulez-vous ouvrir le fichier ?`,
    ui.ButtonSet.YES_NO
  );
  
  if (result === ui.Button.YES) {
    const html = `<script>window.open('${file.getUrl()}');google.script.host.close();</script>`;
    const userInterface = HtmlService.createHtmlOutput(html);
    ui.showModalDialog(userInterface, 'Ouverture du fichier...');
  }
}

/**
 * Convertir les données en format CSV
 * @param {Array} data - Données à convertir
 * @return {string} Données au format CSV
 */
function convertToCSV(data) {
  return data.map(row => {
    return row.map(cell => {
      // Échapper les guillemets et encapsuler si nécessaire
      const value = String(cell).replace(/\"/g, '\"\"');
      return value.includes(',') || value.includes('\"') || value.includes('\
') 
        ? `\"${value}\"` 
        : value;
    }).join(',');
  }).join('\
');
}

/**
 * Obtenir les statistiques par période
 * @param {string} period - Période (jour, semaine, mois)
 * @return {Object} Statistiques par période
 */
function getStatsByPeriod(period) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const dataSheet = spreadsheet.getSheetByName('Résultats');
  
  if (!dataSheet || dataSheet.getLastRow() <= 1) {
    return { labels: [], eligible: [], notEligible: [] };
  }
  
  const data = dataSheet.getRange(2, 1, dataSheet.getLastRow() - 1, 4).getValues();
  const now = new Date();
  const stats = {};
  
  data.forEach(row => {
    const date = new Date(row[0]);
    const result = row[3];
    
    let key;
    if (period === 'jour') {
      key = date.toLocaleDateString('fr-FR');
    } else if (period === 'semaine') {
      const weekNumber = getWeekNumber(date);
      key = `Semaine ${weekNumber}`;
    } else if (period === 'mois') {
      key = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    }
    
    if (!stats[key]) {
      stats[key] = { eligible: 0, notEligible: 0 };
    }
    
    if (result === 'Éligible') {
      stats[key].eligible++;
    } else {
      stats[key].notEligible++;
    }
  });
  
  // Convertir en format pour graphique
  const labels = Object.keys(stats);
  const eligible = labels.map(label => stats[label].eligible);
  const notEligible = labels.map(label => stats[label].notEligible);
  
  return { labels, eligible, notEligible };
}

/**
 * Obtenir le numéro de semaine
 * @param {Date} date - Date
 * @return {number} Numéro de semaine
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}`
  
