/**
 * Fichier de tests pour vérifier le bon fonctionnement du simulateur
 */

/**
 * Exécuter tous les tests
 */
function runAllTests() {
  console.log('=== Début des tests ===');
  
  testEligibilityFonctionnaire();
  testEligibilitySalarie();
  testEligibilityDoctorant();
  testEligibilityRetraite();
  testEmailFormatting();
  testDataStorage();
  
  console.log('=== Fin des tests ===');
}

/**
 * Tester l'éligibilité d'un fonctionnaire
 */
function testEligibilityFonctionnaire() {
  console.log('\nTest: Fonctionnaire en activité avec autorisation');
  
  const formData = {
    statutPrincipal: 'Fonctionnaire ou agent contractuel de la fonction publique (État, Territoriale, Hospitalière) en activité.',
    positionAdmin: 'En activité à temps plein.',
    autorisationCumul: 'Oui',
    nationalite: 'Française',
    email: 'test@example.com'
  };
  
  const result = analyzeEligibility(formData);
  
  console.log('Résultat:', result.eligible ? 'Éligible' : 'Non éligible');
  console.log('Catégorie:', result.categorieVacataire);
  console.log('Plafond:', result.plafondHeures);
  
  // Vérifications
  if (result.eligible !== true) {
    console.error('ERREUR: Fonctionnaire avec autorisation devrait être éligible');
  }
  if (result.plafondHeures !== 64) {
    console.error('ERREUR: Plafond devrait être 64 heures');
  }
}

/**
 * Tester l'éligibilité d'un salarié
 */
function testEligibilitySalarie() {
  console.log('\nTest: Salarié avec 1200 heures');
  
  const formData = {
    statutPrincipal: 'Salarié(e) du secteur privé (CDI, CDD, etc.)',
    heuresTravaillees: '1200',
    clauseExclusivite: 'Non',
    nationalite: 'Française',
    email: 'test@example.com'
  };
  
  const result = analyzeEligibility(formData);
  
  console.log('Résultat:', result.eligible ? 'Éligible' : 'Non éligible');
  console.log('Catégorie:', result.categorieVacataire);
  
  if (result.eligible !== true) {
    console.error('ERREUR: Salarié avec 1200h devrait être éligible');
  }
  
  // Test avec moins de 900h
  console.log('\nTest: Salarié avec 800 heures');
  formData.heuresTravaillees = '800';
  const result2 = analyzeEligibility(formData);
  
  if (result2.eligible !== false) {
    console.error('ERREUR: Salarié avec 800h ne devrait pas être éligible');
  }
}

/**
 * Tester l'éligibilité d'un doctorant
 */
function testEligibilityDoctorant() {
  console.log('\nTest: Doctorant régulièrement inscrit');
  
  const formData = {
    statutPrincipal: 'Doctorant(e) ou Étudiant(e) régulièrement inscrit(e) en 3ème cycle universitaire',
    niveauInscription: 'Doctorant(e) régulièrement inscrit(e) en thèse',
    contratDoctoral: 'Non, je suis doctorant(e) sans contrat doctoral financé',
    nationalite: 'Française',
    email: 'test@example.com'
  };
  
  const result = analyzeEligibility(formData);
  
  console.log('Résultat:', result.eligible ? 'Éligible' : 'Non éligible');
  console.log('Catégorie:', result.categorieVacataire);
  console.log('Plafond:', result.plafondHeures);
  
  if (result.eligible !== true) {
    console.error('ERREUR: Doctorant devrait être éligible');
  }
  if (result.categorieVacataire !== 'Agent temporaire vacataire') {
    console.error('ERREUR: Catégorie devrait être Agent temporaire vacataire');
  }
  if (result.plafondHeures !== 96) {
    console.error('ERREUR: Plafond devrait être 96 heures TD');
  }
}

/**
 * Tester l'éligibilité d'un retraité
 */
function testEligibilityRetraite() {
  console.log('\nTest: Retraité du secteur privé');
  
  const formData = {
    statutPrincipal: 'Retraité(e) (anciennement secteur public ou privé)',
    regimeRetraite: 'Régime général des salariés (CNAV/CARSAT)',
    liquidationComplete: 'Oui',
    activitesCumul: 'Non',
    nationalite: 'Française',
    email: 'test@example.com'
  };
  
  const result = analyzeEligibility(formData);
  
  console.log('Résultat:', result.eligible ? 'Éligible' : 'Non éligible');
  console.log('Catégorie:', result.categorieVacataire);
}

/**
 * Tester le formatage des emails
 */
function testEmailFormatting() {
  console.log('\nTest: Formatage email pour candidat éligible');
  
  const formData = {
    statutPrincipal: 'Doctorant(e)',
    email: 'test@example.com'
  };
  
  const eligibilityResult = {
    eligible: true,
    categorieVacataire: 'Agent temporaire vacataire',
    plafondHeures: 96,
    raisons: [],
    alertes: ['Votre inscription doit être valide pour toute la période'],
    documentsRequis: ['Certificat de scolarité', 'CV', 'RIB']
  };
  
  const html = buildEmailHtml(formData, eligibilityResult);
  
  // Vérifier que l'email contient les éléments attendus
  if (!html.includes('ÉLIGIBLE')) {
    console.error('ERREUR: Email devrait contenir ÉLIGIBLE');
  }
  if (!html.includes('96')) {
    console.error('ERREUR: Email devrait contenir le plafond horaire');
  }
  if (!html.includes('Certificat de scolarité')) {
    console.error('ERREUR: Email devrait contenir les documents requis');
  }
  
  console.log('Email généré avec succès');
}

/**
 * Tester le stockage des données
 */
function testDataStorage() {
  console.log('\nTest: Stockage des données');
  
  // Créer une feuille de test
  const testSheetName = 'Test_' + new Date().getTime();
  const spreadsheet = SpreadsheetApp.openById(CONFIG.SHEET_ID);
  const testSheet = spreadsheet.insertSheet(testSheetName);
  
  try {
    // Créer les en-têtes
    createHeaders(testSheet);
    
    // Vérifier que les en-têtes sont créés
    const headers = testSheet.getRange(1, 1, 1, 16).getValues()[0];
    if (headers[0] !== 'Date/Heure') {
      console.error('ERREUR: En-têtes mal créés');
    }
    
    console.log('Stockage testé avec succès');
    
  } finally {
    // Nettoyer : supprimer la feuille de test
    spreadsheet.deleteSheet(testSheet);
  }
}

/**
 * Fonction utilitaire pour tester manuellement avec des données spécifiques
 */
function testManual() {
  // Modifier les données ici pour tester des cas spécifiques
  const formData = {
    statutPrincipal: 'Travailleur indépendant / Exerçant une profession libérale (hors auto-entrepreneur/micro-entrepreneur)',
    activitePrincipale: 'Consultant informatique',
    immatriculation: 'Oui',
    dateDebut: '2020-01-01',
    uniqueSource: 'Oui, c\'est mon unique/principale source de revenus',
    nationalite: 'Française',
    email: 'test@example.com'
  };
  
  const result = analyzeEligibility(formData);
  
  console.log('\n=== Résultat du test manuel ===');
  console.log('Données:', formData);
  console.log('\nRésultat:');
  console.log(JSON.stringify(result, null, 2));
}