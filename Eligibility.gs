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
