# Simulateur d'Éligibilité Administrative - Enseignants Vacataires

## Description

Ce projet est une application Google Apps Script qui permet de simuler l'éligibilité administrative des candidats aux postes d'enseignants vacataires dans l'enseignement supérieur français, conformément au Décret n°87-889 du 29 octobre 1987.

## Fonctionnalités

- **Formulaire Google Forms** : Questionnaire adaptatif avec branchements conditionnels selon le statut professionnel
- **Analyse automatique** : Évaluation de l'éligibilité selon les règles réglementaires
- **Calcul des plafonds** : Détermination du nombre d'heures maximum autorisées
- **Envoi d'emails** : Résultats automatiquement envoyés aux candidats
- **Tableau de bord** : Statistiques et suivi des candidatures
- **Export des données** : Possibilité d'exporter les résultats en CSV

## Installation

### Prérequis

1. Un compte Google
2. Accès à Google Forms, Google Sheets et Google Apps Script

### Étapes d'installation

1. **Créer le Google Form**
   - Créez un nouveau Google Form
   - Configurez les questions selon la structure définie dans le document
   - Notez l'ID du formulaire (dans l'URL)

2. **Créer la Google Sheet**
   - Créez une nouvelle Google Sheet pour stocker les résultats
   - Notez l'ID de la feuille (dans l'URL)

3. **Configurer Apps Script**
   - Ouvrez Google Apps Script
   - Créez un nouveau projet
   - Copiez tous les fichiers .gs du projet
   - Copiez tous les fichiers .html du projet

4. **Configuration initiale**
   - Modifiez les valeurs dans `Code.gs` :
     ```javascript
     const CONFIG = {
       FORM_ID: 'VOTRE_ID_FORMULAIRE',
       SHEET_ID: 'VOTRE_ID_SHEET',
       EMAIL_TEMPLATE_ID: '', // Optionnel
       ADMIN_EMAIL: 'rh@votre-etablissement.fr'
     };
     ```

5. **Installer le déclencheur**
   - Exécutez la fonction `onInstall()` pour configurer le déclencheur automatique
   - Autorisez les permissions demandées

## Structure du projet

```
├── Code.gs              # Fichier principal avec la logique de base
├── Eligibility.gs       # Module d'analyse de l'éligibilité
├── EmailService.gs      # Service d'envoi d'emails
├── DataStorage.gs       # Gestion du stockage des données
├── UI.gs               # Interface utilisateur et fonctions UI
├── dashboard.html      # Interface du tableau de bord
├── config.html         # Interface de configuration
├── about.html          # Page à propos
└── README.md           # Documentation
```

## Utilisation

### Pour les administrateurs

1. **Accéder au tableau de bord**
   - Ouvrez la Google Sheet
   - Menu : Simulateur Vacataires > Tableau de bord

2. **Exporter les résultats**
   - Menu : Simulateur Vacataires > Exporter les résultats

3. **Modifier la configuration**
   - Menu : Simulateur Vacataires > Configuration

### Pour les candidats

1. Accéder au formulaire via le lien partagé
2. Répondre aux questions selon leur situation
3. Recevoir le résultat par email

## Règles d'éligibilité

Le simulateur applique les règles suivantes :

### Chargés d'enseignement vacataires
- Activité professionnelle principale requise
- Minimum 900 heures/an pour les salariés
- Autorisation de cumul pour les fonctionnaires
- Plafond : selon le statut

### Agents temporaires vacataires
- Inscription en 3ème cycle universitaire
- Plafond : 96h TD ou 144h TP

## Personnalisation

### Modifier les règles d'éligibilité
Éditez le fichier `Eligibility.gs` pour adapter les règles à vos besoins spécifiques.

### Personnaliser les emails
Modifiez la fonction `buildEmailHtml()` dans `EmailService.gs`.

### Ajouter des statuts
1. Ajoutez l'option dans le formulaire
2. Créez une fonction d'analyse dans `Eligibility.gs`
3. Ajoutez le cas dans `analyzeEligibility()`

## Maintenance

### Logs et débogage
- Consultez les logs dans Apps Script : Vue > Logs
- Les erreurs sont envoyées à l'email administrateur

### Sauvegarde
- Exportez régulièrement les données via le menu
- Faites des copies de sauvegarde du projet Apps Script

## Conformité RGPD

- Les données sont stockées uniquement dans Google Drive
- Aucune donnée n'est partagée avec des services tiers
- Les candidats consentent au traitement via le formulaire
- Possibilité d'anonymiser les données anciennes

## Support

Pour toute question ou problème :
- Consultez la documentation
- Contactez l'administrateur défini dans la configuration

## Licence

Ce projet est distribué sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## Crédits

Développé pour [Nom de l'établissement]
Basé sur le Décret n°87-889 du 29 octobre 1987