 * Module d'analyse de l'éligibilité
 * Contient toutes les règles métier pour déterminer l'éligibilité
 */

/**
 * Analyser l'éligibilité d'un candidat selon les règles du décret
 * @param {Object} formData - Données du formulaire
 * @return {Object} Résultat de l'analyse d'éligibilité
 */
function analyzeEligibility(formData) {
  const result = {
    eligible: false,
    raisons: [],
    plafondHeures: 0,
    documentsRequis: [],
    alertes: [],
    categorieVacataire: null
  };
  
  // Appliquer les règles selon le statut principal
  switch (formData.statutPrincipal) {
    case 'Fonctionnaire ou agent contractuel de la fonction publique (État, Territoriale, Hospitalière) en activité.':
      analyzeFonctionnaire(formData, result);
      break;
      
    case 'Salarié(e) du secteur privé (CDI, CDD, etc.)':
      analyzeSalarie(formData, result);
      break;
      
    case 'Travailleur indépendant / Exerçant une profession libérale (hors auto-entrepreneur/micro-entrepreneur)':
      analyzeTravailleurIndependant(formData, result);
      break;
      
    case 'Auto-entrepreneur / Micro-entrepreneur (à titre principal)':
      analyzeAutoEntrepreneur(formData, result);
      break;
      
    case 'Retraité(e) (anciennement secteur public ou privé)':
      analyzeRetraite(formData, result);
      break;
      
    case 'Doctorant(e) ou Étudiant(e) régulièrement inscrit(e) en 3ème cycle universitaire':
      analyzeDoctorant(formData, result);
      break;
      
    case 'Demandeur d'emploi (indemnisé ou non par Pôle Emploi/France Travail)':
      analyzeDemandeurEmploi(formData, result);
      break;
      
    case 'Personnel BIATSS (Bibliothèques, Ingénieurs, Administratifs, Techniciens, Sociaux et de Santé) de l'établissement recruteur':
      analyzeBIATSS(formData, result);
      break;
      
    case 'Enseignant(e) ou Enseignant-Chercheur titulaire ou contractuel (CDI/CDD) d'un établissement d'enseignement':
      analyzeEnseignant(formData, result);
      break;
      
    default:
      result.raisons.push('Statut non reconnu ou non éligible');
  }
  
  // Vérifier les conditions communes
  checkCommonConditions(formData, result);
  
  return result;
}

/**
 * Analyser l'éligibilité d'un fonctionnaire
 */
function analyzeFonctionnaire(formData, result) {
  // Vérifier la position administrative
  if (formData.positionAdmin === 'En activité à temps plein.' || 
      formData.positionAdmin === 'En activité à temps partiel.') {
    
    // Vérifier l'autorisation de cumul
    if (formData.autorisationCumul === 'Oui') {
      result.eligible = true;
      result.categorieVacataire = 'Chargé d\\'enseignement vacataire';
      result.plafondHeures = 64; // Heures de cours max pour fonctionnaires
      result.documentsRequis.push(
        'Autorisation de cumul d\\'activités signée par votre administration',
        'Attestation de votre employeur principal',
        'Dernier bulletin de salaire'
      );
    } else {
      result.eligible = false;
      result.raisons.push('Autorisation de cumul d\\'activités requise pour les agents publics en activité');
      result.alertes.push('Vous devez obtenir une autorisation de cumul avant de pouvoir exercer des vacations');
    }
    
  } else if (formData.positionAdmin === 'En disponibilité.') {
    result.eligible = true;
    result.categorieVacataire = 'Chargé d\\'enseignement vacataire';
    result.documentsRequis.push(
      'Arrêté de mise en disponibilité',
      'Justificatif d\\'activité professionnelle principale si applicable'
    );
    
  } else {
    result.alertes.push('Votre position administrative nécessite une analyse au cas par cas');
  }
}

/**
 * Analyser l'éligibilité d'un salarié du privé
 */
function analyzeSalarie(formData, result) {
  const heuresTravaillees = parseInt(formData.heuresTravaillees) || 0;
  
  // Vérifier le seuil de 900 heures
  if (heuresTravaillees >= 900) {
    result.eligible = true;
    result.categorieVacataire = 'Chargé d\\'enseignement vacataire';
    result.documentsRequis.push(
      'Attestation de l\\'employeur principal indiquant le nombre d\\'heures travaillées',
      'Contrat de travail',
      'Derniers bulletins de salaire (3 mois)'
    );
    
    // Vérifier les clauses d'exclusivité
    if (formData.clauseExclusivite === 'Oui' && formData.accordEmployeur !== 'Oui') {
      result.eligible = false;
      result.raisons.push('Accord de l\\'employeur requis en cas de clause d\\'exclusivité');
    }
  } else {
    result.eligible = false;
    result.raisons.push('Minimum de 900 heures de travail annuel requis dans l\\'emploi principal');
    result.alertes.push(`Vous avez déclaré ${heuresTravaillees} heures. Il vous manque ${900 - heuresTravaillees} heures.`);
  }
}

/**
 * Analyser l'éligibilité d'un doctorant
 */
function analyzeDoctorant(formData, result) {
  result.eligible = true;
  result.categorieVacataire = 'Agent temporaire vacataire';
  result.plafondHeures = 96; // Heures TD max pour ATERv
  
  result.documentsRequis.push(
    'Certificat de scolarité en cours de validité',
    'Attestation d\\'inscription en doctorat'
  );
  
  // Cas spécifique des doctorants contractuels avec mission d'enseignement
  if (formData.contratDoctoral === 'Oui, j\\'ai un contrat doctoral avec mission d\\'enseignement (avenant d\\'enseignement).') {
    const heuresMission = parseInt(formData.heuresMissionEnseignement) || 0;
    result.plafondHeures = Math.max(0, 64 - heuresMission);
    result.alertes.push(`Votre plafond de vacations est limité à ${result.plafondHeures}h en plus de vos ${heuresMission}h de mission d'enseignement`);
  }
}

/**
 * Vérifier les conditions communes à tous les profils
 */
function checkCommonConditions(formData, result) {
  // Vérifier la nationalité et le droit au travail
  if (formData.nationalite === 'Autre pays') {
    if (formData.titreSejour !== 'Oui (merci de préciser le type de titre dans la case ci-dessous)') {
      result.eligible = false;
      result.raisons.push('Titre de séjour avec autorisation de travail requis');
    } else {
      result.documentsRequis.push('Copie du titre de séjour en cours de validité');
    }
  }
  
  // Documents communs à tous
  result.documentsRequis.push(
    'CV détaillé',
    'Copie de la carte d\\'identité ou passeport',
    'RIB',
    'Copie du diplôme le plus élevé'
  );
  
  // Définir l'éligibilité finale
  if (result.raisons.length > 0) {
    result.eligible = false;
  }
}`
    },
    {
      `path`: `EmailService.gs`,
      `content`: `/**
 * Service d'envoi d'emails
 * Gère l'envoi des résultats par email aux candidats
 */

/**
 * Envoyer l'email de résultat au candidat
 * @param {string} email - Email du destinataire
 * @param {Object} formData - Données du formulaire
 * @param {Object} eligibilityResult - Résultat de l'analyse
 */
function sendResultEmail(email, formData, eligibilityResult) {
  const subject = 'Résultat de votre simulation d\\'éligibilité - Enseignant vacataire';
  
  // Construire le corps de l'email en HTML
  const htmlBody = buildEmailHtml(formData, eligibilityResult);
  
  // Options de l'email
  const options = {
    htmlBody: htmlBody,
    name: 'Service RH - Simulateur Vacataires',
    replyTo: CONFIG.ADMIN_EMAIL
  };
  
  try {
    GmailApp.sendEmail(email, subject, '', options);
    console.log('Email envoyé à:', email);
  } catch (error) {
    console.error('Erreur envoi email:', error);
    throw error;
  }
}

/**
 * Construire le HTML de l'email
 * @param {Object} formData - Données du formulaire
 * @param {Object} result - Résultat de l'analyse
 * @return {string} HTML de l'email
 */
function buildEmailHtml(formData, result) {
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .result-box { border: 2px solid ${result.eligible ? '#28a745' : '#dc3545'}; 
                      padding: 20px; border-radius: 5px; margin: 20px 0; }
        .eligible { color: #28a745; font-weight: bold; }
        .not-eligible { color: #dc3545; font-weight: bold; }
        .section { margin: 20px 0; }
        .section-title { font-weight: bold; margin-bottom: 10px; }
        ul { margin: 10px 0; padding-left: 20px; }
        .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; 
                 padding: 10px; border-radius: 5px; margin: 10px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; 
                  font-size: 0.9em; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class=\"container\">
        <div class=\"header\">
          <h2>Résultat de votre simulation d'éligibilité</h2>
          <p>Date de la simulation : ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <div class=\"result-box\">
          <h3 class=\"${result.eligible ? 'eligible' : 'not-eligible'}\">
            ${result.eligible ? '✓ ÉLIGIBLE' : '✗ NON ÉLIGIBLE'}
          </h3>
          <p>Statut principal : ${formData.statutPrincipal}</p>
          ${result.categorieVacataire ? `<p>Catégorie : ${result.categorieVacataire}</p>` : ''}
          ${result.plafondHeures ? `<p>Plafond horaire : ${result.plafondHeures} heures équivalent TD</p>` : ''}
        </div>
  `;
  
  // Ajouter les raisons de non-éligibilité
  if (!result.eligible && result.raisons.length > 0) {
    html += `
        <div class=\"section\">
          <div class=\"section-title\">Raisons de non-éligibilité :</div>
          <ul>
            ${result.raisons.map(r => `<li>${r}</li>`).join('')}
          </ul>
        </div>
    `;
  }
  
  // Ajouter les alertes
  if (result.alertes.length > 0) {
    html += `
        <div class=\"section\">
          <div class=\"section-title\">Points d'attention :</div>
          ${result.alertes.map(a => `<div class=\"alert\">⚠️ ${a}</div>`).join('')}
        </div>
    `;
  }
  
  // Ajouter les documents requis
  if (result.eligible && result.documentsRequis.length > 0) {
    html += `
        <div class=\"section\">
          <div class=\"section-title\">Documents à fournir pour votre dossier :</div>
          <ul>
            ${result.documentsRequis.map(d => `<li>${d}</li>`).join('')}
          </ul>
        </div>
    `;
  }
  
  // Footer
  html += `
        <div class=\"footer\">
          <p><strong>Important :</strong> Ce résultat est fourni à titre indicatif et ne constitue pas une décision officielle. 
          Seul le service des ressources humaines est habilité à valider définitivement votre recrutement après examen complet de votre dossier.</p>
          
          <p>Pour toute question, veuillez contacter : ${CONFIG.ADMIN_EMAIL}</p>
          
          <p>Cordialement,<br>
          Service des Ressources Humaines</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return html;
}

/**
 * Notifier l'administrateur en cas d'erreur
 * @param {string} subject - Sujet de la notification
 * @param {string} message - Message d'erreur
 */
function notifyAdmin(subject, message) {
  const fullSubject = `[Simulateur Vacataires] ${subject}`;
  const body = `
    Une erreur s'est produite dans le simulateur de vacataires.
    
    Détails :
    ${message}
    
    Date : ${new Date().toLocaleString('fr-FR')}
  `;
  
  try {
    GmailApp.sendEmail(CONFIG.ADMIN_EMAIL, fullSubject, body);
  } catch (error) {
    console.error('Impossible d\\'envoyer la notification admin:', error);
  }
}`
    },
    {
      `path`: `DataStorage.gs`,
      `content`: `/**
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
  const resultColumn = 4; // Colonne \"Résultat\"
  const resultCell = sheet.getRange(rowNumber, resultColumn);
  const resultValue = resultCell.getValue();
  
  // Colorer selon le résultat
  if (resultValue === 'Éligible') {
    resultCell.setBackground('#d4edda').setFontColor('#155724`
    }
  ],
  `branch`: `main`
}
