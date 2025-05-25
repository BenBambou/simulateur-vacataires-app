/**
 * Module de stockage des données
 * Gère l'enregistrement des résultats dans Google Sheets
 */

/**
 * Stocker les résultats dans la feuille de calcul
 * @param {Object} formData - Données du formulaire
 * @param {Object} eligibilityResult - Résultat de l'analyse
 */
function storeResults(formData, eligibilityResult) {
  const sheet = SpreadsheetApp.openById(CONFIG.SHEET_ID).getSheetByName('Résultats') || 
                SpreadsheetApp.openById(CONFIG.SHEET_ID).insertSheet('Résultats');
  
  // Créer les en-têtes si nécessaire
  if (sheet.getLastRow() === 0) {
    createHeaders(sheet);
  }
  
  // Préparer la ligne de données
  const row = [
    new Date(), // Timestamp
    formData.email,
    formData.statutPrincipal,
    eligibilityResult.eligible ? 'Éligible' : 'Non éligible',
    eligibilityResult.categorieVacataire || '',
    eligibilityResult.plafondHeures || '',
    eligibilityResult.raisons.join('; '),
    eligibilityResult.alertes.join('; '),
    eligibilityResult.documentsRequis.join('; '),
    formData.nationalite || '',
    formData.fonctionPublique || '',
    formData.statutPrecis || '',
    formData.positionAdmin || '',
    formData.autorisationCumul || '',
    formData.typeContrat || '',
    formData.heuresTravaillees || '',
    // Ajouter d'autres champs selon les besoins
  ];
  
  // Ajouter la ligne
  sheet.appendRow(row);
  
  // Formater la nouvelle ligne
  const lastRow = sheet.getLastRow();
  formatResultRow(sheet, lastRow);
}

/**
 * Créer les en-têtes de la feuille de résultats
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Feuille de calcul
 */
function createHeaders(sheet) {
  const headers = [
    'Date/Heure',
    'Email',
    'Statut Principal',
    'Résultat',
    'Catégorie Vacataire',
    'Plafond Heures',
    'Raisons Non-Éligibilité',
    'Alertes',
    'Documents Requis',
    'Nationalité',
    'Fonction Publique',
    'Statut Précis',
    'Position Admin',
    'Autorisation Cumul',
    'Type Contrat',
    'Heures Travaillées'
  ];
  
  // Ajouter les en-têtes
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // Formater les en-têtes
  sheet.getRange(1, 1, 1, headers.length)
    .setBackground('#f8f9fa')
    .setFontWeight('bold')
    .setBorder(true, true, true, true, true, true);
  
  // Figer la première ligne
  sheet.setFrozenRows(1);
  
  // Ajuster la largeur des colonnes
  sheet.autoResizeColumns(1, headers.length);
}

/**
 * Formater une ligne de résultat
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet - Feuille de calcul
 * @param {number} rowNumber - Numéro de la ligne
 */
function formatResultRow(sheet, rowNumber) {
  const resultColumn = 4; // Colonne "Résultat"
  const resultCell = sheet.getRange(rowNumber, resultColumn);
  const resultValue = resultCell.getValue();
  
  // Colorer selon le résultat
  if (resultValue === 'Éligible') {
    resultCell.setBackground('#d4edda').setFontColor('#155724');
  } else {
    resultCell.setBackground('#f8d7da').setFontColor('#721c24');
  }
  
  // Formater la date
  sheet.getRange(rowNumber, 1).setNumberFormat('dd/mm/yyyy hh:mm');
}

/**
 * Créer une feuille de tableau de bord
 */
function createDashboard() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  let dashboardSheet = spreadsheet.getSheetByName('Tableau de bord');
  
  if (!dashboardSheet) {
    dashboardSheet = spreadsheet.insertSheet('Tableau de bord');
  }
  
  dashboardSheet.clear();
  
  // Titre
  dashboardSheet.getRange('A1').setValue('Tableau de bord - Simulateur Vacataires')
    .setFontSize(18)
    .setFontWeight('bold');
  
  // Date de mise à jour
  dashboardSheet.getRange('A3').setValue('Dernière mise à jour : ' + new Date().toLocaleString('fr-FR'));
  
  // Statistiques
  const dataSheet = spreadsheet.getSheetByName('Résultats');
  if (dataSheet && dataSheet.getLastRow() > 1) {
    const stats = calculateStatistics(dataSheet);
    
    // Afficher les statistiques
    const statsData = [
      ['Statistiques Générales', ''],
      ['Total de simulations', stats.total],
      ['Candidats éligibles', stats.eligible],
      ['Candidats non éligibles', stats.notEligible],
      ['Taux d\'éligibilité', (stats.eligible / stats.total * 100).toFixed(1) + '%'],
      ['', ''],
      ['Répartition par statut', 'Nombre'],
    ];
    
    // Ajouter la répartition par statut
    Object.entries(stats.byStatus).forEach(([status, count]) => {
      statsData.push([status, count]);
    });
    
    dashboardSheet.getRange(5, 1, statsData.length, 2).setValues(statsData);
    
    // Formater
    dashboardSheet.getRange('A5:B5').setFontWeight('bold').setBackground('#f8f9fa');
    dashboardSheet.getRange('A11:B11').setFontWeight('bold').setBackground('#f8f9fa');
  }
}

/**
 * Calculer les statistiques des résultats
 * @param {GoogleAppsScript.Spreadsheet.Sheet} dataSheet - Feuille de données
 * @return {Object} Statistiques calculées
 */
function calculateStatistics(dataSheet) {
  const data = dataSheet.getRange(2, 1, dataSheet.getLastRow() - 1, dataSheet.getLastColumn()).getValues();
  
  const stats = {
    total: data.length,
    eligible: 0,
    notEligible: 0,
    byStatus: {}
  };
  
  data.forEach(row => {
    // Compter éligibles/non éligibles
    if (row[3] === 'Éligible') {
      stats.eligible++;
    } else {
      stats.notEligible++;
    }
    
    // Compter par statut
    const status = row[2];
    if (status) {
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    }
  });
  
  return stats;
}