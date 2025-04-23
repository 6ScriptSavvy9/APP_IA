// Configuration de l'API Mistral AI
const MISTRAL_API_KEY = 'S2jQOXPv0fIqghKVvHHqHSv9lCOmIkiY';
const API_URL = 'https://api.mistral.ai/v1/chat/completions';

// Éléments du DOM
document.addEventListener('DOMContentLoaded', function() {
    // Éléments pour le chat
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    
    // Éléments pour les onglets
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    // Éléments pour les démonstrations
    const demoCards = document.querySelectorAll('.demo-card');
    
    // Éléments pour les ateliers
    const workshopSelect = document.getElementById('workshop-select');
    const workshopContents = document.querySelectorAll('.workshop-content');
    
    // Éléments pour l'atelier de prompt engineering
    const evaluatePromptBtn = document.getElementById('evaluate-prompt');
    const promptExercise = document.getElementById('prompt-exercise');
    const promptFeedback = document.getElementById('prompt-feedback');
    const customPrompt = document.getElementById('custom-prompt');
    const tryPromptBtn = document.getElementById('try-prompt');
    const promptResult = document.getElementById('prompt-result');
    
    // Éléments pour l'atelier de description d'images
    const changeImageBtn = document.getElementById('change-image');
    const sampleImage = document.getElementById('sample-image');
    const imageDescription = document.getElementById('image-description');
    const generateSimilarBtn = document.getElementById('generate-similar');
    const imageResult = document.getElementById('image-result');
    
    // Éléments pour l'atelier d'analyse de sentiment
    const sentimentText = document.getElementById('sentiment-text');
    const analyzeSentimentBtn = document.getElementById('analyze-sentiment');
    const sentimentResult = document.getElementById('sentiment-result');
    
    // Éléments pour l'atelier d'écriture créative
    const writingType = document.getElementById('writing-type');
    const writingGenre = document.getElementById('writing-genre');
    const writingStart = document.getElementById('writing-start');
    const continueWritingBtn = document.getElementById('continue-writing');
    const writingResult = document.getElementById('writing-result');
    const extendWritingBtn = document.getElementById('extend-writing');
    
    // Gestion des onglets
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Retirer la classe active de tous les onglets
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Activer l'onglet cliqué
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Gestion des cartes de démo
    demoCards.forEach(card => {
        const tryButton = card.querySelector('.try-button');
        tryButton.addEventListener('click', () => {
            // Récupérer le prompt d'exemple
            const examplePrompt = card.getAttribute('data-prompt');
            
            // Basculer vers l'onglet de chat
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Activer l'onglet de chat
            tabButtons[0].classList.add('active');
            document.getElementById('chat-tab').classList.add('active');
            
            // Remplir le champ de saisie avec l'exemple
            userInput.value = examplePrompt;
            
            // Mettre le focus sur le champ de saisie
            userInput.focus();
            
            // Faire défiler pour voir le bouton d'envoi
            setTimeout(() => {
                userInput.scrollIntoView({ behavior: 'smooth' });
            }, 300);
        });
    });
    
    // Gestion de la sélection d'atelier
    if (workshopSelect) {
        workshopSelect.addEventListener('change', () => {
            const selectedWorkshop = workshopSelect.value;
            
            // Cacher tous les ateliers
            workshopContents.forEach(workshop => {
                workshop.classList.remove('active');
            });
            
            // Afficher l'atelier sélectionné
            document.getElementById(`${selectedWorkshop}-workshop`).classList.add('active');
        });
    }
    
    // Fonctionnalités pour l'atelier de prompt engineering
    if (evaluatePromptBtn) {
        evaluatePromptBtn.addEventListener('click', async () => {
            const prompt = promptExercise.value.trim();
            if (!prompt) return;
            
            promptFeedback.innerHTML = '<p>Évaluation en cours...</p>';
            promptFeedback.style.display = 'block';
            
            try {
                const response = await callMistralAPI([
                    { role: 'system', content: 'Vous êtes un expert en prompt engineering. Évaluez la qualité du prompt fourni et suggérez des améliorations pour le rendre plus efficace. Votre réponse doit être concise et structurée.' },
                    { role: 'user', content: `Évaluez ce prompt et suggérez des améliorations: "${prompt}"` }
                ]);
                
                promptFeedback.innerHTML = `<p>${response.replace(/\n/g, '<br>')}</p>`;
                promptFeedback.classList.add('active');
            } catch (error) {
                promptFeedback.innerHTML = `<p>Erreur: ${error.message}</p>`;
            }
        });
    }
    
    if (tryPromptBtn) {
        tryPromptBtn.addEventListener('click', async () => {
            const prompt = customPrompt.value.trim();
            if (!prompt) return;
            
            promptResult.innerHTML = '<p>Génération de la réponse...</p>';
            promptResult.style.display = 'block';
            
            try {
                const response = await callMistralAPI([
                    { role: 'system', content: 'Vous êtes un assistant IA neutre qui répond aux questions des utilisateurs sans biais ni orientation idéologique.' },
                    { role: 'user', content: prompt }
                ]);
                
                promptResult.innerHTML = `<p>${response.replace(/\n/g, '<br>')}</p>`;
                promptResult.classList.add('active');
            } catch (error) {
                promptResult.innerHTML = `<p>Erreur: ${error.message}</p>`;
            }
        });
    }
    
    // Fonctionnalités pour l'atelier de description d'images
    const imageSamples = [
        'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1',
        'https://images.unsplash.com/photo-1551524559-8af4e6624178',
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
        'https://images.unsplash.com/photo-1577023311546-cdc07a8454d9',
        'https://images.unsplash.com/photo-1560472354-b33ff0c44a43'
    ];
    
    let currentImageIndex = 0;
    
    if (changeImageBtn && sampleImage) {
        // Initialiser avec la première image
        sampleImage.src = `${imageSamples[0]}?w=400&h=300&auto=format&fit=crop`;
        
        changeImageBtn.addEventListener('click', () => {
            currentImageIndex = (currentImageIndex + 1) % imageSamples.length;
            sampleImage.src = `${imageSamples[currentImageIndex]}?w=400&h=300&auto=format&fit=crop`;
        });
    }
    
    if (generateSimilarBtn) {
        generateSimilarBtn.addEventListener('click', async () => {
            const description = imageDescription.value.trim();
            if (!description) return;
            
            imageResult.innerHTML = '<p>Génération en cours...</p>';
            imageResult.style.display = 'block';
            
            try {
                const response = await callMistralAPI([
                    { role: 'system', content: 'Vous êtes un assistant IA spécialisé dans la génération de descriptions d\'images similaires. Analysez la description fournie et créez une description légèrement différente mais dans le même style et avec le même sujet.' },
                    { role: 'user', content: `Voici ma description d'une image: "${description}". Générez une description similaire mais différente qui pourrait donner un résultat comparable.` }
                ]);
                
                imageResult.innerHTML = `<p><strong>Description similaire:</strong><br>${response.replace(/\n/g, '<br>')}</p>`;
                imageResult.classList.add('active');
            } catch (error) {
                imageResult.innerHTML = `<p>Erreur: ${error.message}</p>`;
            }
        });
    }
    
    // Fonctionnalités pour l'atelier d'analyse de sentiment
    if (analyzeSentimentBtn) {
        analyzeSentimentBtn.addEventListener('click', async () => {
            const text = sentimentText.value.trim();
            if (!text) return;
            
            sentimentResult.innerHTML = '<p>Analyse en cours...</p>';
            sentimentResult.style.display = 'block';
            
            try {
                const response = await callMistralAPI([
                    { role: 'system', content: 'Vous êtes un assistant IA spécialisé dans l\'analyse de sentiment de texte. Analysez le texte fourni et donnez un résultat détaillé sur le sentiment (positif, négatif, neutre), l\'émotion dominante, et le ton.' },
                    { role: 'user', content: `Analysez le sentiment de ce texte: "${text}"` }
                ]);
                
                sentimentResult.innerHTML = `<p>${response.replace(/\n/g, '<br>')}</p>`;
                sentimentResult.classList.add('active');
            } catch (error) {
                sentimentResult.innerHTML = `<p>Erreur: ${error.message}</p>`;
            }
        });
    }
    
    // Fonctionnalités pour l'atelier d'écriture créative
    if (continueWritingBtn) {
        continueWritingBtn.addEventListener('click', async () => {
            const text = writingStart.value.trim();
            const type = writingType.value;
            const genre = writingGenre.value;
            
            if (!text) return;
            
            writingResult.innerHTML = '<p>Génération en cours...</p>';
            writingResult.style.display = 'block';
            extendWritingBtn.classList.add('hidden');
            
            try {
                const response = await callMistralAPI([
                    { role: 'system', content: 'Vous êtes un assistant IA spécialisé dans l\'écriture créative. Continuez le texte fourni dans le style et le genre spécifiés.' },
                    { role: 'user', content: `Continuez ce texte (type: ${type}, genre: ${genre}): "${text}"` }
                ]);
                
                writingResult.innerHTML = `<p>${response.replace(/\n/g, '<br>')}</p>`;
                writingResult.classList.add('active');
                extendWritingBtn.classList.remove('hidden');
                
                // Stocker le texte complet pour l'extension
                writingResult.setAttribute('data-full-text', text + ' ' + response);
            } catch (error) {
                writingResult.innerHTML = `<p>Erreur: ${error.message}</p>`;
            }
        });
    }
    
    if (extendWritingBtn) {
        extendWritingBtn.addEventListener('click', async () => {
            const fullText = writingResult.getAttribute('data-full-text');
            const type = writingType.value;
            const genre = writingGenre.value;
            
            if (!fullText) return;
            
            writingResult.innerHTML = '<p>Développement en cours...</p>';
            
            try {
                const response = await callMistralAPI([
                    { role: 'system', content: 'Vous êtes un assistant IA spécialisé dans l\'écriture créative. Continuez le texte fourni dans le style et le genre spécifiés.' },
                    { role: 'user', content: `Continuez ce texte (type: ${type}, genre: ${genre}): "${fullText}"` }
                ]);
                
                const newFullText = fullText + ' ' + response;
                writingResult.innerHTML = `<p>${newFullText.replace(/\n/g, '<br>')}</p>`;
                writingResult.setAttribute('data-full-text', newFullText);
            } catch (error) {
                writingResult.innerHTML = `<p>Erreur: ${error.message}</p>`;
            }
        });
    }
    
    // Gestion de l'envoi via le bouton ou la touche Entrée pour le chat
    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Ajouter un message de bienvenue
    addMessage('Bonjour ! Je suis un assistant IA propulsé par Mistral AI. Comment puis-je vous aider aujourd\'hui ?', 'ai');
    
    // Fonction pour envoyer un message à l'API
    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;
        
        // Afficher le message de l'utilisateur
        addMessage(message, 'user');
        userInput.value = '';
        
        // Ajouter un indicateur de chargement
        const loadingId = showLoadingIndicator();
        
        try {
            const aiResponse = await callMistralAPI([
                { role: 'system', content: 'Vous êtes un assistant IA neutre qui répond aux questions des utilisateurs sans biais ni orientation idéologique.' },
                { role: 'user', content: message }
            ]);
            
            // Retirer l'indicateur de chargement
            hideLoadingIndicator(loadingId);
            
            // Afficher la réponse de l'IA
            addMessage(aiResponse, 'ai');
            
        } catch (error) {
            // Gérer les erreurs
            hideLoadingIndicator(loadingId);
            console.error('Erreur lors de la communication avec l\'API:', error);
            addMessage('Désolé, une erreur s\'est produite lors de la communication avec l\'API. Veuillez réessayer.', 'ai');
        }
    }
    
    // Fonction pour appeler l'API Mistral
    async function callMistralAPI(messages) {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: 'mistral-tiny',
                messages: messages,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    // Fonction pour ajouter un message au chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // Formater le texte avec gestion des sauts de ligne
        messageDiv.textContent = text;
        
        chatMessages.appendChild(messageDiv);
        
        // Faire défiler vers le bas pour voir le nouveau message
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Fonctions pour gérer l'indicateur de chargement
    function showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('message', 'ai-message', 'loading');
        loadingDiv.textContent = 'L\'IA réfléchit...';
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return Date.now(); // Utiliser un timestamp comme ID
    }
    
    function hideLoadingIndicator(id) {
        const loadingElements = chatMessages.querySelectorAll('.loading');
        if (loadingElements.length > 0) {
            loadingElements[loadingElements.length - 1].remove();
        }
    }
});