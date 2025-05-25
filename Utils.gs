 * Fichier utilitaire avec des fonctions communes
 */

/**
 * Formater une date en français
 * @param {Date} date - Date à formater
 * @return {string} Date formatée
 */
function formatDateFR(date) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('fr-FR', options);
}

/**
 * Vérifier si une adresse email est valide
 * @param {string} email - Adresse email à vérifier
 * @return {boolean} true si valide
 */
function isValidEmail(email) {
  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(email);
}

/**
 * Nettoyer et normaliser une chaîne de caractères
 * @param {string} str - Chaîne à nettoyer
 * @return {string} Chaîne nettoyée
 */
function cleanString(str) {
  if (!str) return '';
  return str.trim().replace(/\\s+/g, ' ');
}

/**
 * Convertir des heures en différents formats
 * @param {number} hours - Nombre d'heures
 * @param {string} fromType - Type source (TD, TP, CM)
 * @param {string} toType - Type destination (TD, TP, CM)
 * @return {number} Heures converties
 */
function convertHours(hours, fromType, toType) {
  const coefficients = {
    'CM': 1.5,   // 1h CM = 1.5h TD
    'TD': 1,     // 1h TD = 1h TD
    'TP': 0.67   // 1h TP = 0.67h TD
  };
  
  // Convertir en heures TD d'abord
  const hoursTD = hours * coefficients[fromType];
  
  // Puis convertir vers le type demandé
  return hoursTD / coefficients[toType];
}

/**
 * Générer un identifiant unique
 * @return {string} Identifiant unique
 */
function generateUniqueId() {
  return Utilities.getUuid();
}

/**
 * Envoyer une notification Slack (si configuré)
 * @param {string} message - Message à envoyer
 */
function sendSlackNotification(message) {
  const slackWebhook = PropertiesService.getScriptProperties().getProperty('SLACK_WEBHOOK');
  
  if (!slackWebhook) {
    console.log('Webhook Slack non configuré');
    return;
  }
  
  const payload = {
    'text': message,
    'username': 'Simulateur Vacataires',
    'icon_emoji': ':mortar_board:'
  };
  
  const options = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  };
  
  try {
    UrlFetchApp.fetch(slackWebhook, options);
  } catch (error) {
    console.error('Erreur envoi Slack:', error);
  }
}

/**
 * Créer une sauvegarde des données
 */
function createBackup() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const folder = DriveApp.getRootFolder();
  const backupFolder = folder.getFoldersByName('Sauvegardes Simulateur').hasNext() ?
    folder.getFoldersByName('Sauvegardes Simulateur').next() :
    folder.createFolder('Sauvegardes Simulateur');
  
  const date = new Date();
  const fileName = `Backup_Simulateur_${date.toISOString().split('T')[0]}`;
  
  // Créer une copie de la feuille
  const copy = spreadsheet.copy(fileName);
  const file = DriveApp.getFileById(copy.getId());
  backupFolder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  
  console.log('Sauvegarde créée:', fileName);
  
  // Nettoyer les anciennes sauvegardes (garder les 30 dernières)
  cleanOldBackups(backupFolder, 30);
}

/**
 * Nettoyer les anciennes sauvegardes
 * @param {Folder} folder - Dossier des sauvegardes
 * @param {number} keepCount - Nombre de sauvegardes à conserver
 */
function cleanOldBackups(folder, keepCount) {
  const files = folder.getFiles();
  const fileList = [];
  
  while (files.hasNext()) {
    const file = files.next();
    fileList.push({
      file: file,
      date: file.getDateCreated()
    });
  }
  
  // Trier par date décroissante
  fileList.sort((a, b) => b.date - a.date);
  
  // Supprimer les plus anciennes
  for (let i = keepCount; i < fileList.length; i++) {
    fileList[i].file.setTrashed(true);
  }
}

/**
 * Anonymiser les données anciennes
 * @param {number} daysOld - Nombre de jours après lesquels anonymiser
 */
function anonymizeOldData(daysOld = 365) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Résultats');
  if (!sheet || sheet.getLastRow() <= 1) return;
  
  const data = sheet.getDataRange().getValues();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  let anonymized = 0;
  
  for (let i = 1; i < data.length; i++) {
    const date = new Date(data[i][0]);
    
    if (date < cutoffDate && data[i][1] && !data[i][1].includes('ANONYME')) {
      // Anonymiser l'email
      sheet.getRange(i + 1, 2).setValue('ANONYME_' + generateUniqueId().substring(0, 8));
      anonymized++;
    }
  }
  
  console.log(`${anonymized} enregistrements anonymisés`);
}

/**
 * Vérifier la cohérence des données
 * @return {Object} Rapport de vérification
 */
function checkDataIntegrity() {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Résultats');
  const report = {
    totalRows: 0,
    errors: [],
    warnings: []
  };
  
  if (!sheet || sheet.getLastRow() <= 1) {
    report.warnings.push('Aucune donnée à vérifier');
    return report;
  }
  
  const data = sheet.getDataRange().getValues();
  report.totalRows = data.length - 1;
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowNum = i + 1;
    
    // Vérifier les champs obligatoires
    if (!row[0]) report.errors.push(`Ligne ${rowNum}: Date manquante`);
    if (!row[1]) report.errors.push(`Ligne ${rowNum}: Email manquant`);
    if (!row[2]) report.errors.push(`Ligne ${rowNum}: Statut principal manquant`);
    if (!row[3]) report.errors.push(`Ligne ${rowNum}: Résultat manquant`);
    
    // Vérifier la cohérence
    if (row[3] === 'Éligible' && !row[4]) {
      report.warnings.push(`Ligne ${rowNum}: Éligible mais catégorie vacataire manquante`);
    }
    
    if (row[3] === 'Non éligible' && row[6] === '') {
      report.warnings.push(`Ligne ${rowNum}: Non éligible mais aucune raison donnée`);
    }
  }
  
  return report;
}`
    
