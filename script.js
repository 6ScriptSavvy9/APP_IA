// Configuration de l'application
const config = {
    apiKey: 'S2jQOXPv0fIqghKVvHHqHSv9lCOmIkiY', // Remplacez par votre clé API Mistral
    apiEndpoint: 'https://api.mistral.ai/v1/chat/completions',
    xpLevels: [0, 100, 250, 450, 700, 1000, 1500], // XP requis pour chaque niveau
    questCompletionMessages: [
        "Excellent travail !",
        "Mission accomplie !",
        "Bravo pour cette réussite !",
        "Objectif atteint avec succès !",
        "Vous progressez très bien !"
    ],
    levelUpMessages: [
        "Félicitations ! Vous avez atteint le niveau suivant !",
        "Votre maîtrise de l'IA s'améliore !",
        "Vos compétences se développent rapidement !",
        "Vous franchissez une nouvelle étape dans votre apprentissage !"
    ]
};

// État de l'utilisateur
const userState = {
    xp: 0,
    level: 1,
    completedQuests: [],
    activeQuests: [],
    questProgress: {}
};

// Chargement de l'état depuis le stockage local
function loadUserState() {
    const savedState = localStorage.getItem('iaAppUserState');
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        Object.assign(userState, parsedState);
        updateUserStats();
        updateQuestCards();
    }
}

// Sauvegarde de l'état dans le stockage local
function saveUserState() {
    localStorage.setItem('iaAppUserState', JSON.stringify(userState));
}

// Mise à jour de l'affichage des statistiques utilisateur
function updateUserStats() {
    document.getElementById('user-level').textContent = `Niveau ${userState.level}`;
    document.getElementById('user-xp').textContent = `${userState.xp} XP`;
    
    // Calcul du pourcentage de progression vers le niveau suivant
    const currentLevelXP = config.xpLevels[userState.level - 1];
    const nextLevelXP = config.xpLevels[userState.level];
    const xpForNextLevel = nextLevelXP - currentLevelXP;
    const xpProgress = userState.xp - currentLevelXP;
    const progressPercentage = Math.min(Math.floor((xpProgress / xpForNextLevel) * 100), 100);
    
    // Mise à jour de la barre de progression
    document.getElementById('xp-progress').style.width = `${progressPercentage}%`;
    document.getElementById('progress-text').textContent = `${xpProgress}/${xpForNextLevel} XP`;
}

// Ajout d'XP à l'utilisateur
function addXP(amount) {
    userState.xp += amount;
    
    // Vérification du passage au niveau supérieur
    const currentLevel = userState.level;
    let newLevel = currentLevel;
    
    // Tant que l'utilisateur a suffisamment d'XP pour passer au niveau suivant
    while (newLevel < config.xpLevels.length - 1 && userState.xp >= config.xpLevels[newLevel]) {
        newLevel++;
    }
    
    // Si l'utilisateur a changé de niveau
    if (newLevel > currentLevel) {
        userState.level = newLevel;
        setTimeout(() => {
            showLevelUpNotification(newLevel);
        }, 1000);
    }
    
    updateUserStats();
    saveUserState();
    
    return newLevel > currentLevel; // Indique si l'utilisateur a monté de niveau
}

// Affichage de la notification de passage de niveau
function showLevelUpNotification(newLevel) {
    const notification = document.createElement('div');
    notification.className = 'level-up-notification';
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-level-up-alt"></i>
        </div>
        <div class="notification-content">
            <h3>Niveau ${newLevel} atteint !</h3>
            <p>${config.levelUpMessages[Math.floor(Math.random() * config.levelUpMessages.length)]}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.classList.add('active');
    }, 100);
    
    // Suppression après un délai
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 4000);
    
    // Mise à jour des quêtes débloquées
    updateQuestCards();
}

// Gestion des quêtes
const quests = {
    quest1: {
        id: 'quest1',
        name: 'Premier Contact',
        description: 'Présentez-vous à l\'IA et posez-lui 3 questions différentes sur l\'intelligence artificielle.',
        xpReward: 20,
        minLevel: 1,
        objectives: {
            'quest1-obj1': {
                id: 'quest1-obj1',
                name: 'Présentation personnelle',
                validate: (message) => message.toLowerCase().includes('je m\'appelle') || 
                                       message.toLowerCase().includes('je suis') || 
                                       message.toLowerCase().includes('mon nom') || 
                                       message.toLowerCase().includes('bonjour')
            },
            'quest1-obj2': {
                id: 'quest1-obj2',
                name: 'Poser 3 questions sur l\'IA',
                count: 3,
                validate: (message) => message.toLowerCase().includes('?') && 
                                      (message.toLowerCase().includes('intelligence artificielle') ||
                                       message.toLowerCase().includes('ia'))
            }
        }
    },
    quest2: {
        id: 'quest2',
        name: 'Poète en herbe',
        description: 'Demandez à l\'IA de créer un poème sur un sujet de votre choix, puis modifiez-le en suggérant des changements.',
        xpReward: 25,
        minLevel: 1,
        objectives: {
            'quest2-obj1': {
                id: 'quest2-obj1',
                name: 'Demander un poème',
                validate: (message) => message.toLowerCase().includes('poème') || 
                                       message.toLowerCase().includes('poésie') || 
                                       message.toLowerCase().includes('vers')
            },
            'quest2-obj2': {
                id: 'quest2-obj2',
                name: 'Suggérer des modifications',
                validate: (message, previousMessages) => {
                    // Vérifie si un poème a été généré précédemment
                    const poemGenerated = previousMessages.some(msg => 
                        !msg.isUser && (msg.content.toLowerCase().includes('voici un poème') || 
                                        msg.content.includes('\n\n') || 
                                        msg.content.includes('vers'))
                    );
                    
                    return poemGenerated && (
                        message.toLowerCase().includes('modifi') || 
                        message.toLowerCase().includes('chang') || 
                        message.toLowerCase().includes('améliore') || 
                        message.toLowerCase().includes('ajuste')
                    );
                }
            }
        }
    },
    quest3: {
        id: 'quest3',
        name: 'Apprenti Professeur',
        description: 'Demandez à l\'IA d\'expliquer un concept complexe, puis reformulez l\'explication avec vos propres mots.',
        xpReward: 40,
        minLevel: 2,
        objectives: {
            'quest3-obj1': {
                id: 'quest3-obj1',
                name: 'Demander l\'explication d\'un concept complexe',
                validate: (message) => message.toLowerCase().includes('explique') || 
                                       message.toLowerCase().includes('expliquer') || 
                                       message.toLowerCase().includes('qu\'est-ce')
            },
            'quest3-obj2': {
                id: 'quest3-obj2',
                name: 'Reformuler avec vos propres mots',
                validate: (message, previousMessages) => {
                    const explanation = previousMessages.findIndex(msg => 
                        !msg.isUser && msg.content.length > 200
                    );
                    
                    return explanation !== -1 && (
                        message.toLowerCase().includes('si je comprends bien') || 
                        message.toLowerCase().includes('donc') || 
                        message.toLowerCase().includes('en d\'autres termes') || 
                        message.toLowerCase().includes('si je résume') || 
                        message.toLowerCase().includes('reformul')
                    );
                }
            }
        }
    },
    quest4: {
        id: 'quest4',
        name: 'Maître des prompts',
        description: 'Utilisez l\'atelier de prompt engineering pour créer et tester 3 prompts de différentes complexités.',
        xpReward: 50,
        minLevel: 2,
        objectives: {}
    },
    quest5: {
        id: 'quest5',
        name: 'Débat philosophique',
        description: 'Engagez un débat philosophique avec l\'IA sur la conscience artificielle et les implications éthiques.',
        xpReward: 75,
        minLevel: 3,
        objectives: {}
    },
    quest6: {
        id: 'quest6',
        name: 'Écrivain collaboratif',
        description: 'Créez une histoire complète en collaboration avec l\'IA, en alternant les paragraphes avec elle.',
        xpReward: 100,
        minLevel: 4,
        objectives: {}
    }
};

// Mise à jour de l'affichage des cartes de quêtes
function updateQuestCards() {
    const questCards = document.querySelectorAll('.quest-card');
    
    questCards.forEach(card => {
        const questId = card.dataset.id;
        const quest = quests[questId];
        
        // Vérification si la quête est déjà complétée
        if (userState.completedQuests.includes(questId)) {
            card.dataset.status = 'completed';
            card.querySelector('.quest-status i').className = 'fas fa-check-circle';
            card.querySelector('.quest-button').className = 'quest-button completed';
            card.querySelector('.quest-button').innerText = 'Complété';
            card.querySelector('.quest-button').disabled = true;
        } 
        // Vérification si la quête est active
        else if (userState.activeQuests.includes(questId)) {
            card.dataset.status = 'in-progress';
            card.querySelector('.quest-button').className = 'quest-button in-progress';
            card.querySelector('.quest-button').innerText = 'En cours';
            
            // Mise à jour des objectifs
            if (card.querySelectorAll('.objective').length > 0) {
                const objectives = quest.objectives;
                for (const objId in objectives) {
                    if (userState.questProgress[questId] && userState.questProgress[questId][objId]) {
                        const objElement = card.querySelector(`.objective[data-id="${objId}"]`);
                        if (objElement) {
                            objElement.classList.add('completed');
                            objElement.querySelector('i').className = 'fas fa-check-circle';
                        }
                    }
                }
            }
        } 
        // Vérification si la quête est disponible (niveau requis atteint)
        else if (userState.level >= quest.minLevel) {
            card.dataset.status = 'available';
            card.querySelector('.quest-status i').className = 'fas fa-lock-open';
            card.querySelector('.quest-button').className = 'quest-button start-quest';
            card.querySelector('.quest-button').innerText = 'Commencer';
            card.querySelector('.quest-button').disabled = false;
        } 
        // Quête verrouillée (niveau insuffisant)
        else {
            card.dataset.status = 'locked';
            card.querySelector('.quest-status i').className = 'fas fa-lock';
            card.querySelector('.quest-button').className = 'quest-button locked';
            card.querySelector('.quest-button').innerText = 'Verrouillé';
            card.querySelector('.quest-button').disabled = true;
        }
    });
}

// Démarrage d'une quête
function startQuest(questId) {
    if (!userState.activeQuests.includes(questId) && !userState.completedQuests.includes(questId)) {
        userState.activeQuests.push(questId);
        userState.questProgress[questId] = {};
        
        saveUserState();
        updateQuestCards();
        
        // Changement vers l'onglet de chat
        document.querySelector('.tab-button[data-tab="chat"]').click();
        
        // Ajout d'un message système pour indiquer le démarrage de la quête
        const quest = quests[questId];
        addSystemMessage(`Quête démarrée: "${quest.name}". ${quest.description}`);
    }
}

// Validation des objectifs de quête
function checkQuestObjectives(message, allMessages) {
    const activeQuests = userState.activeQuests;
    let questUpdated = false;
    
    for (const questId of activeQuests) {
        const quest = quests[questId];
        const objectives = quest.objectives;
        
        for (const objId in objectives) {
            const objective = objectives[objId];
            
            // Vérifier si l'objectif est déjà complété
            if (userState.questProgress[questId] && userState.questProgress[questId][objId]) {
                continue;
            }
            
            // Valider l'objectif
            let isValid = false;
            if (objective.count) {
                // Objectif avec compteur
                if (!userState.questProgress[questId]) {
                    userState.questProgress[questId] = {};
                }
                
                if (!userState.questProgress[questId][objId]) {
                    userState.questProgress[questId][objId] = { count: 0 };
                }
                
                if (objective.validate(message, allMessages)) {
                    userState.questProgress[questId][objId].count++;
                    if (userState.questProgress[questId][objId].count >= objective.count) {
                        userState.questProgress[questId][objId] = true;
                        questUpdated = true;
                    }
                }
            } else {
                // Objectif simple
                if (objective.validate(message, allMessages)) {
                    if (!userState.questProgress[questId]) {
                        userState.questProgress[questId] = {};
                    }
                    userState.questProgress[questId][objId] = true;
                    questUpdated = true;
                }
            }
        }
        
        // Vérifier si tous les objectifs sont complétés
        if (userState.questProgress[questId]) {
            const allCompleted = Object.keys(objectives).every(objId => 
                userState.questProgress[questId][objId] === true
            );
            
            if (allCompleted && !userState.completedQuests.includes(questId)) {
                completeQuest(questId);
            }
        }
    }
    
    if (questUpdated) {
        saveUserState();
        updateQuestCards();
    }
}

// Complétion d'une quête
function completeQuest(questId) {
    const index = userState.activeQuests.indexOf(questId);
    if (index !== -1) {
        userState.activeQuests.splice(index, 1);
    }
    
    userState.completedQuests.push(questId);
    saveUserState();
    
    const quest = quests[questId];
    const leveledUp = addXP(quest.xpReward);
    
    // Affichage du popup de récompense
    showRewardPopup(quest, leveledUp);
}

// Affichage du popup de récompense
function showRewardPopup(quest, leveledUp) {
    const popup = document.getElementById('reward-popup');
    const rewardMessage = document.getElementById('reward-message');
    const xpAmount = document.getElementById('xp-amount');
    const progressFill = document.getElementById('popup-progress');
    const levelMessage = document.getElementById('level-message');
    
    // Mise à jour du contenu du popup
    rewardMessage.textContent = `Vous avez terminé la quête "${quest.name}".`;
    xpAmount.textContent = `+${quest.xpReward} XP`;
    
    // Calcul de la progression
    const currentLevelXP = config.xpLevels[userState.level - 1];
    const nextLevelXP = config.xpLevels[userState.level];
    const xpForNextLevel = nextLevelXP - currentLevelXP;
    const xpProgress = userState.xp - currentLevelXP;
    const progressPercentage = Math.min(Math.floor((xpProgress / xpForNextLevel) * 100), 100);
    
    progressFill.style.width = `${progressPercentage}%`;
    levelMessage.textContent = `Niveau ${userState.level} - ${xpProgress}/${xpForNextLevel} XP`;
    
    // Affichage du popup
    popup.classList.add('active');
    setTimeout(() => {
        popup.querySelector('.popup-content').style.opacity = '1';
        popup.querySelector('.popup-content').style.transform = 'translateY(0)';
    }, 100);
    
    // Mise à jour de l'affichage des quêtes
    updateQuestCards();
}

// Initialisation des événements
document.addEventListener('DOMContentLoaded', function() {
    // Chargement de l'état de l'utilisateur
    loadUserState();
    
    // Gestion des onglets
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Désactivation de tous les onglets
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Activation de l'onglet cliqué
            button.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Gestion du bouton d'envoi de message
    const sendButton = document.getElementById('send-button');
    const userInput = document.getElementById('user-input');
    const chatMessages = document.getElementById('chat-messages');
    
    const messages = [];
    
    sendButton.addEventListener('click', async () => {
        const message = userInput.value.trim();
        if (message) {
            // Ajout du message de l'utilisateur
            const userMessage = {
                content: message,
                isUser: true
            };
            messages.push(userMessage);
            
            // Affichage du message
            const messageElement = document.createElement('div');
            messageElement.className = 'message user-message';
            messageElement.textContent = message;
            chatMessages.appendChild(messageElement);
            
            // Vérification des objectifs de quête
            checkQuestObjectives(message, messages);
            
            // Réinitialisation de l'input
            userInput.value = '';
            
            // Affichage du message de chargement
            const loadingElement = document.createElement('div');
            loadingElement.className = 'message ai-message loading';
            loadingElement.textContent = '...';
            chatMessages.appendChild(loadingElement);
            
            // Défilement vers le bas
            chatMessages.scrollTop = chatMessages.scrollHeight;
            
            try {
                // Appel à l'API Mistral AI
                const aiResponse = await callMistralAPI(messages);
                
                // Suppression du message de chargement
                loadingElement.remove();
                
                const aiMessage = {
                    content: aiResponse,
                    isUser: false
                };
                messages.push(aiMessage);
                
                // Affichage de la réponse
                const responseElement = document.createElement('div');
                responseElement.className = 'message ai-message';
                responseElement.textContent = aiResponse;
                chatMessages.appendChild(responseElement);
                
                // Défilement vers le bas
                chatMessages.scrollTop = chatMessages.scrollHeight;
            } catch (error) {
                // Suppression du message de chargement
                loadingElement.remove();
                
                // Affichage du message d'erreur
                const errorElement = document.createElement('div');
                errorElement.className = 'message system-message error';
                errorElement.textContent = "Une erreur s'est produite lors de la communication avec l'API Mistral. Veuillez réessayer plus tard.";
                chatMessages.appendChild(errorElement);
                
                console.error('Erreur API:', error);
                
                // Défilement vers le bas
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
    });
    
    // Gestion de la touche Entrée pour envoyer un message
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendButton.click();
        }
    });
    
    // Gestion des filtres de quêtes
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            
            // Désactivation de tous les filtres
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Activation du filtre cliqué
            button.classList.add('active');
            
            // Filtrage des quêtes
            const questCards = document.querySelectorAll('.quest-card');
            questCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else if (filter === 'completed' && card.dataset.status === 'completed') {
                    card.style.display = 'block';
                } else if (filter === card.dataset.difficulty && card.dataset.status !== 'completed') {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
    
    // Gestion des boutons de quête
    const questButtons = document.querySelectorAll('.quest-button.start-quest');
    questButtons.forEach(button => {
        button.addEventListener('click', () => {
            const questId = button.getAttribute('data-quest');
            startQuest(questId);
        });
    });
    
    // Gestion du bouton de récompense
    const claimRewardButton = document.getElementById('claim-reward');
    claimRewardButton.addEventListener('click', () => {
        const popup = document.getElementById('reward-popup');
        popup.classList.remove('active');
        setTimeout(() => {
            popup.querySelector('.popup-content').style.opacity = '0';
            popup.querySelector('.popup-content').style.transform = 'translateY(20px)';
        }, 100);
    });
    
    // Fonction pour ajouter un message système
    function addSystemMessage(message) {
        const systemMessage = {
            content: message,
            isUser: false,
            isSystem: true
        };
        messages.push(systemMessage);
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message system-message';
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
});

// Fonction pour remplacer par l'API Mistral AI
async function callMistralAPI(messages) {
    try {
        // Préparation des messages pour l'API
        const formattedMessages = messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
        }));
        
        // Ajout d'un message système initial pour définir le comportement et la langue
        const systemMessage = {
            role: 'system',
            content: 'Vous êtes un assistant IA dans une application éducative gamifiée appelée Odyssée IA. Répondez toujours en français de manière claire, précise et amicale. Adaptez votre style pour être accessible et encourageant, en particulier pour les débutants qui apprennent l\'intelligence artificielle. N\'utilisez jamais l\'anglais dans vos réponses.'
        };
        
        const response = await fetch(config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: 'mistral-medium',
                messages: [systemMessage, ...formattedMessages],
                temperature: 0.7,
                max_tokens: 1000
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(`Erreur API: ${data.error?.message || 'Une erreur inconnue s\'est produite'}`);
        }
        
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Erreur lors de l\'appel à l\'API Mistral:', error);
        return "Je suis désolé, je rencontre des difficultés à traiter votre demande actuellement. Veuillez réessayer.";
    }
}