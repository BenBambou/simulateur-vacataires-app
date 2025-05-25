/**
 * Template d'email personnalisé (optionnel)
 * Ce fichier peut être utilisé pour personnaliser davantage les emails
 */

/**
 * Obtenir le template d'email personnalisé
 * @param {string} type - Type de template (eligible, non_eligible, erreur)
 * @return {Object} Template avec sujet et corps
 */
function getEmailTemplate(type) {
  const templates = {
    eligible: {
      subject: "✅ Résultat positif - Votre éligibilité aux fonctions d'enseignant vacataire",
      header: "Félicitations ! Vous êtes éligible",
      intro: "Nous avons le plaisir de vous informer que, selon les informations fournies, vous remplissez les conditions administratives pour exercer des fonctions d'enseignant vacataire dans notre établissement.",
      footer: "Prochaines étapes : Veuillez constituer votre dossier avec les documents listés ci-dessus et le transmettre au service des ressources humaines."
    },
    
    non_eligible: {
      subject: "❌ Résultat de votre simulation - Enseignant vacataire",
      header: "Résultat de votre simulation",
      intro: "Après analyse de vos informations, il apparaît que vous ne remplissez pas actuellement toutes les conditions administratives requises pour exercer des fonctions d'enseignant vacataire.",
      footer: "Si votre situation évolue ou si vous pensez qu'une erreur s'est produite, n'hésitez pas à contacter le service des ressources humaines."
    },
    
    erreur: {
      subject: "⚠️ Erreur lors du traitement de votre demande",
      header: "Une erreur s'est produite",
      intro: "Nous sommes désolés, mais une erreur technique s'est produite lors du traitement de votre simulation.",
      footer: "Veuillez réessayer ultérieurement ou contacter directement le service des ressources humaines."
    }
  };
  
  return templates[type] || templates.erreur;
}

/**
 * Construire un email avec template personnalisé
 * @param {Object} formData - Données du formulaire
 * @param {Object} result - Résultat de l'analyse
 * @return {string} HTML de l'email
 */
function buildCustomEmailHtml(formData, result) {
  const template = getEmailTemplate(result.eligible ? 'eligible' : 'non_eligible');
  
  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.8; 
          color: #2c3e50; 
          background-color: #f5f5f5;
          margin: 0;
          padding: 0;
        }
        .wrapper {
          background-color: #f5f5f5;
          padding: 20px 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px; 
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 300;
        }
        .content {
          padding: 30px;
        }
        .result-box { 
          border: 2px solid ${result.eligible ? '#27ae60' : '#e74c3c'}; 
          background-color: ${result.eligible ? '#f0f9f4' : '#fef5f5'};
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0; 
          text-align: center;
        }
        .result-icon {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .eligible { color: #27ae60; }
        .not-eligible { color: #e74c3c; }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 10px;
          margin: 20px 0;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        .info-label {
          font-weight: bold;
          color: #7f8c8d;
        }
        .section { 
          margin: 25px 0; 
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
        }
        .section-title { 
          font-weight: bold; 
          color: #34495e;
          margin-bottom: 15px; 
          font-size: 18px;
          border-bottom: 2px solid #3498db;
          padding-bottom: 5px;
        }
        ul { 
          margin: 10px 0; 
          padding-left: 25px; 
        }
        li {
          margin-bottom: 8px;
        }
        .alert { 
          background-color: #fff3cd; 
          border-left: 4px solid #ffc107;
          padding: 15px; 
          border-radius: 5px; 
          margin: 10px 0; 
        }
        .alert-icon {
          color: #856404;
          font-weight: bold;
        }
        .documents {
          background-color: #e8f4f8;
          border-left: 4px solid #3498db;
          padding: 15px;
          border-radius: 5px;
        }
        .footer { 
          margin-top: 30px; 
          padding: 30px;
          background-color: #2c3e50;
          color: #ecf0f1;
          text-align: center;
          font-size: 0.9em; 
        }
        .footer a {
          color: #3498db;
          text-decoration: none;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .social {
          margin-top: 20px;
        }
        .social a {
          margin: 0 10px;
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          <div class="header">
            <h1>${template.header}</h1>
            <p>Simulateur d'éligibilité - Enseignants vacataires</p>
          </div>
          
          <div class="content">
            <p>${template.intro}</p>
            
            <div class="result-box">
              <div class="result-icon ${result.eligible ? 'eligible' : 'not-eligible'}">
                ${result.eligible ? '✅' : '❌'}
              </div>
              <h2 class="${result.eligible ? 'eligible' : 'not-eligible'}">
                ${result.eligible ? 'ÉLIGIBLE' : 'NON ÉLIGIBLE'}
              </h2>
            </div>
            
            <div class="info-grid">
              <div class="info-label">Date de simulation :</div>
              <div>${new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</div>
              
              <div class="info-label">Statut déclaré :</div>
              <div>${formData.statutPrincipal}</div>
              
              ${result.categorieVacataire ? `
                <div class="info-label">Catégorie :</div>
                <div>${result.categorieVacataire}</div>
              ` : ''}
              
              ${result.plafondHeures ? `
                <div class="info-label">Plafond horaire :</div>
                <div>${result.plafondHeures} heures équivalent TD</div>
              ` : ''}
            </div>
  `;
  
  // Raisons de non-éligibilité
  if (!result.eligible && result.raisons.length > 0) {
    html += `
            <div class="section">
              <div class="section-title">📋 Conditions non remplies</div>
              <ul>
                ${result.raisons.map(r => `<li>${r}</li>`).join('')}
              </ul>
              <p><em>Pour devenir éligible, vous devez satisfaire toutes les conditions ci-dessus.</em></p>
            </div>
    `;
  }
  
  // Alertes
  if (result.alertes.length > 0) {
    html += `
            <div class="section">
              <div class="section-title">⚠️ Points d'attention</div>
              ${result.alertes.map(a => `
                <div class="alert">
                  <span class="alert-icon">⚠️</span> ${a}
                </div>
              `).join('')}
            </div>
    `;
  }
  
  // Documents requis
  if (result.eligible && result.documentsRequis.length > 0) {
    html += `
            <div class="section documents">
              <div class="section-title">📄 Documents à fournir</div>
              <p>Pour constituer votre dossier, vous devez fournir :</p>
              <ul>
                ${result.documentsRequis.map(d => `<li>✓ ${d}</li>`).join('')}
              </ul>
              <p><strong>Important :</strong> Tous les documents doivent être en cours de validité.</p>
            </div>
    `;
  }
  
  // Pied de page
  html += `
            <div style="text-align: center; margin-top: 30px;">
              <p>${template.footer}</p>
              ${result.eligible ? `
                <a href="#" class="button">Accéder au portail RH</a>
              ` : ''}
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Avertissement :</strong> Ce résultat est fourni à titre indicatif sur la base des informations déclarées. 
            Il ne constitue pas une décision officielle d'embauche. Seul le service des ressources humaines est habilité 
            à valider définitivement votre éligibilité après examen complet de votre dossier.</p>
            
            <p style="margin-top: 20px;">
              📧 Contact : <a href="mailto:${CONFIG.ADMIN_EMAIL}">${CONFIG.ADMIN_EMAIL}</a><br>
              📞 Téléphone : 01 23 45 67 89<br>
              🏢 Service des Ressources Humaines
            </p>
            
            <div class="social">
              <a href="#">🌐 Site web</a>
              <a href="#">📘 Facebook</a>
              <a href="#">🐦 Twitter</a>
              <a href="#">💼 LinkedIn</a>
            </div>
            
            <p style="margin-top: 20px; font-size: 0.8em; color: #95a5a6;">
              © ${new Date().getFullYear()} [Nom de l'établissement] - Tous droits réservés<br>
              Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return html;
}

/**
 * Envoyer un email de bienvenue après éligibilité confirmée
 * @param {string} email - Email du candidat
 * @param {Object} formData - Données du formulaire
 */
function sendWelcomeEmail(email, formData) {
  const subject = "🎓 Bienvenue dans notre équipe d'enseignants vacataires";
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* Styles similaires au template principal */
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Bienvenue !</h1>
        <p>Votre dossier a été accepté. Voici les prochaines étapes...</p>
        <!-- Contenu personnalisé -->
      </div>
    </body>
    </html>
  `;
  
  GmailApp.sendEmail(email, subject, '', {
    htmlBody: htmlBody,
    name: 'Équipe pédagogique'
  });
}