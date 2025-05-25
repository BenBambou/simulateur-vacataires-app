# Guide d'Installation Détaillé

## Prérequis

- Compte Google avec accès à Google Workspace
- Droits d'administration sur Google Forms, Sheets et Apps Script
- Navigateur web moderne (Chrome, Firefox, Safari, Edge)

## Étape 1 : Créer le Google Form

### 1.1 Création du formulaire

1. Connectez-vous à votre compte Google
2. Accédez à [Google Forms](https://forms.google.com)
3. Cliquez sur "+ Créer un formulaire"
4. Donnez un titre : "Simulateur d'Éligibilité - Enseignants Vacataires"

### 1.2 Configuration des sections

Créez les sections suivantes dans l'ordre :

1. **Section 1 : Informations Préliminaires et Consentement**
2. **Section 2 : Identification de votre Statut Professionnel Principal**
3. **Sections spécifiques par statut** (F, S, TI, AE, R, D, DE, B, E, AUTRE)
4. **Section FIN_COMMUNE : Informations Complémentaires**

### 1.3 Configuration des branchements

Pour chaque réponse de la Section 2, configurez le branchement vers la section appropriée :
- Fonctionnaire → Section F
- Salarié du privé → Section S
- etc.

### 1.4 Récupérer l'ID du formulaire

1. Dans l'URL du formulaire, copiez l'ID entre `/forms/d/` et `/edit`
2. Exemple : `https://docs.google.com/forms/d/1ABC...XYZ/edit`
3. L'ID est : `1ABC...XYZ`

## Étape 2 : Créer la Google Sheet

### 2.1 Création de la feuille

1. Accédez à [Google Sheets](https://sheets.google.com)
2. Créez une nouvelle feuille de calcul
3. Nommez-la : "Simulateur Vacataires - Résultats"

### 2.2 Récupérer l'ID de la feuille

1. Dans l'URL, copiez l'ID entre `/spreadsheets/d/` et `/edit`
2. Exemple : `https://docs.google.com/spreadsheets/d/1DEF...UVW/edit`
3. L'ID est : `1DEF...UVW`

## Étape 3 : Configurer Google Apps Script

### 3.1 Créer le projet Apps Script

1. Accédez à [Google Apps Script](https://script.google.com)
2. Cliquez sur "Nouveau projet"
3. Nommez le projet : "Simulateur Vacataires"

### 3.2 Copier les fichiers du projet

1. **Supprimer** le fichier `Code.gs` par défaut
2. Pour chaque fichier `.gs` du projet GitHub :
   - Cliquez sur "+" → "Script"
   - Nommez le fichier (sans l'extension .gs)
   - Copiez-collez le contenu

3. Pour chaque fichier `.html` :
   - Cliquez sur "+" → "HTML"
   - Nommez le fichier (sans l'extension .html)
   - Copiez-collez le contenu

### 3.3 Copier le fichier appsscript.json

1. Dans Apps Script : Projet → Paramètres du projet
2. Cochez "Afficher le fichier manifeste appsscript.json"
3. Retournez dans l'éditeur
4. Ouvrez `appsscript.json`
5. Remplacez le contenu par celui du projet

## Étape 4 : Configuration initiale

### 4.1 Modifier la configuration

1. Ouvrez le fichier `Code.gs`
2. Modifiez la constante `CONFIG` :

```javascript
const CONFIG = {
  FORM_ID: 'VOTRE_ID_FORM_ICI',
  SHEET_ID: 'VOTRE_ID_SHEET_ICI',
  EMAIL_TEMPLATE_ID: '',
  ADMIN_EMAIL: 'votre-email@etablissement.fr'
};
```

### 4.2 Configurer les propriétés du script (optionnel)

1. Projet → Paramètres du projet
2. Propriétés du script → Ajouter une propriété
3. Ajoutez les propriétés suivantes si besoin :
   - `SLACK_WEBHOOK` : URL du webhook Slack (si utilisé)

## Étape 5 : Installation et autorisations

### 5.1 Exécuter la fonction d'installation

1. Sélectionnez la fonction `onInstall` dans le menu déroulant
2. Cliquez sur "Exécuter"
3. Une fenêtre d'autorisation s'ouvre

### 5.2 Autoriser les permissions

1. Cliquez sur "Examiner les autorisations"
2. Choisissez votre compte Google
3. Cliquez sur "Avancé" puis "Accéder à Simulateur Vacataires (non sécurisé)"
4. Cliquez sur "Autoriser"

### 5.3 Vérifier l'installation

1. Allez dans "Déclencheurs" (icône horloge)
2. Vérifiez qu'un déclencheur `onFormSubmit` est créé

## Étape 6 : Lier le formulaire à la feuille

1. Retournez dans votre Google Form
2. Onglet "Réponses" → Icône Google Sheets
3. Sélectionnez "Sélectionner une feuille de calcul existante"
4. Choisissez votre feuille "Simulateur Vacataires - Résultats"

## Étape 7 : Tests

### 7.1 Test de base

1. Ouvrez le formulaire en mode aperçu
2. Remplissez un test complet
3. Soumettez le formulaire
4. Vérifiez :
   - La réception de l'email
   - L'enregistrement dans la feuille
   - Les logs dans Apps Script

### 7.2 Tests approfondis

Testez chaque parcours :
- Fonctionnaire éligible
- Salarié non éligible (< 900h)
- Doctorant
- etc.

## Étape 8 : Déploiement

### 8.1 Partager le formulaire

1. Dans Google Forms : bouton "Envoyer"
2. Obtenez le lien de partage
3. Configurez les paramètres de réponse si nécessaire

### 8.2 Configurer les menus dans Sheets

1. Ouvrez la Google Sheet
2. Actualisez la page
3. Le menu "Simulateur Vacataires" devrait apparaître

## Dépannage

### Le menu n'apparaît pas dans Sheets

1. Exécutez manuellement la fonction `createMenus()` dans Apps Script
2. Actualisez la page Sheets

### Les emails ne sont pas envoyés

1. Vérifiez les logs dans Apps Script
2. Vérifiez que l'email est correctement saisi
3. Vérifiez les quotas d'envoi Gmail

### Le déclencheur ne fonctionne pas

1. Supprimez le déclencheur existant
2. Réexécutez `setupFormTrigger()`
3. Vérifiez les autorisations

### Erreur "Impossible de trouver la méthode"

1. Vérifiez que tous les fichiers sont bien copiés
2. Vérifiez les noms des fonctions
3. Sauvegardez et réessayez

## Maintenance

### Sauvegardes régulières

Configurez une sauvegarde automatique :

1. Créez un déclencheur temporel pour `createBackup()`
2. Fréquence recommandée : hebdomadaire

### Anonymisation des données

Pour respecter le RGPD :

1. Créez un déclencheur pour `anonymizeOldData()`
2. Fréquence : mensuelle
3. Paramètre : 365 jours par défaut

### Vérification de l'intégrité

Exécutez régulièrement `checkDataIntegrity()` pour vérifier la cohérence des données.

## Support

En cas de problème :

1. Consultez les logs dans Apps Script
2. Vérifiez la section Dépannage
3. Contactez l'administrateur système

## Ressources utiles

- [Documentation Google Apps Script](https://developers.google.com/apps-script)
- [Documentation Google Forms API](https://developers.google.com/forms)
- [Documentation Google Sheets API](https://developers.google.com/sheets)
- [Guide sur les déclencheurs](https://developers.google.com/apps-script/guides/triggers)