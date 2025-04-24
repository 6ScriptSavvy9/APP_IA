// Variables globales
let currentTab = 'chat';
let userLevel = 1;
let userXP = 0;
let xpToNextLevel = 1000;
let quests = [];
let completedQuests = [];
let activeQuests = [];
let chatHistory = [];
let workshopHistory = [];

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    
    // Créer et afficher les éléments d'arrière-plan dynamiques
    createBackgroundElements();
    
    // Animer les orbes de gradient en arrière-plan
    animateGradientOrbs();
    
    // Afficher le message de bienvenue
    displayWelcomeMessage();
});

// Fonction d'initialisation principale
function initializeApp() {
    loadUserData();
    loadQuests();
    updateUserInterface();
    
    // Définir l'onglet actif par défaut
    switchTab('chat');
}

// Chargement des données utilisateur (simulé)
function loadUserData() {
    // Dans une application réelle, ces données seraient chargées depuis un serveur
    userLevel = 5;
    userXP = 2340;
    xpToNextLevel = 5000;
    
    // Mettre à jour l'interface avec les données utilisateur
    updateUserLevel();
    updateLevelProgress();
}

// Chargement des quêtes (simulé)
function loadQuests() {
    // Dans une application réelle, ces données seraient chargées depuis un serveur
    quests = [
        {
            id: 1,
            title: "Premiers pas avec l'IA",
            description: "Apprenez les bases de l'interaction avec l'IA en complétant des tâches simples.",
            difficulty: "beginner",
            xpReward: 300,
            status: "active",
            iconClass: "fas fa-baby",
            objectives: [
                { text: "Envoyer votre premier message à l'IA", completed: true },
                { text: "Recevoir une réponse de l'IA", completed: true },
                { text: "Poser une question sur l'IA générative", completed: false }
            ]
        },
        {
            id: 2,
            title: "Créer un prompt efficace",
            description: "Découvrez comment formuler des prompts qui génèrent des réponses précises et utiles.",
            difficulty: "beginner",
            xpReward: 500,
            status: "active",
            iconClass: "fas fa-edit",
            objectives: [
                { text: "Comprendre les éléments d'un bon prompt", completed: false },
                { text: "Créer un prompt avec des instructions claires", completed: false },
                { text: "Obtenir une réponse structurée de l'IA", completed: false }
            ]
        },
        {
            id: 3,
            title: "Maîtriser les variations de prompt",
            description: "Apprenez à modifier vos prompts pour obtenir différents types de réponses.",
            difficulty: "intermediate",
            xpReward: 750,
            status: "locked",
            iconClass: "fas fa-random",
            requirements: "Terminez d'abord 'Créer un prompt efficace'",
            objectives: [
                { text: "Créer 3 variations d'un même prompt", completed: false },
                { text: "Comparer les résultats des différentes variations", completed: false },
                { text: "Identifier la formulation la plus efficace", completed: false }
            ]
        },
        {
            id: 4,
            title: "Devenir un expert en prompt engineering",
            description: "Maîtrisez les techniques avancées de prompt engineering pour obtenir des résultats exceptionnels.",
            difficulty: "advanced",
            xpReward: 1200,
            status: "locked",
            iconClass: "fas fa-graduation-cap",
            requirements: "Atteignez le niveau 10",
            objectives: [
                { text: "Utiliser des techniques de chaînage de prompts", completed: false },
                { text: "Créer un système de prompts structurés", completed: false },
                { text: "Optimiser vos prompts pour des cas spécifiques", completed: false },
                { text: "Partager vos connaissances avec la communauté", completed: false }
            ]
        }
    ];
    
    // Filtrer les quêtes actives
    activeQuests = quests.filter(quest => quest.status === 'active');
    
    // Afficher les quêtes actives dans la barre latérale
    updateActiveQuestsSidebar();
    
    // Afficher toutes les quêtes dans l'onglet des quêtes
    renderQuestsTab();
}

// Configuration des écouteurs d'événements
function setupEventListeners() {
    // Écouteurs pour les onglets de navigation
    document.querySelectorAll('.tab-button').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabId = e.currentTarget.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Écouteur pour l'envoi de message dans le chat
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    
    // Écouteur pour la touche Entrée dans la zone de saisie du chat
    const userInput = document.getElementById('user-input');
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Écouteurs pour les boutons des quêtes
    document.querySelectorAll('.quest-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const questId = parseInt(e.currentTarget.getAttribute('data-quest-id'));
            const action = e.currentTarget.getAttribute('data-action');
            handleQuestAction(questId, action);
        });
    });
    
    // Écouteur pour les boutons de filtrage des quêtes
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const filter = e.currentTarget.getAttribute('data-filter');
            filterQuests(filter);
            
            // Mettre à jour la classe active
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            e.currentTarget.classList.add('active');
        });
    });
    
    // Écouteurs pour l'atelier de prompts
    const testButton = document.getElementById('test-prompt');
    if (testButton) {
        testButton.addEventListener('click', generateFromPrompt);
    }
}

// Fonction pour changer d'onglet
function switchTab(tabId) {
    // Mettre à jour l'onglet actif
    currentTab = tabId;
    
    // Mettre à jour les classes des boutons d'onglet
    document.querySelectorAll('.tab-button').forEach(tab => {
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Mettre à jour la visibilité des panneaux d'onglets
    document.querySelectorAll('.tab-pane').forEach(pane => {
        if (pane.id === `${tabId}-tab`) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });
}

// Créer et animer les éléments d'arrière-plan
function createBackgroundElements() {
    const backgroundElements = document.querySelector('.background-elements');
    
    if (!backgroundElements) return;
    
    // Ajouter la grille d'arrière-plan
    const gridOverlay = document.createElement('div');
    gridOverlay.classList.add('grid-overlay');
    backgroundElements.appendChild(gridOverlay);
    
    // Ajouter les orbes de gradient
    const orb1 = document.createElement('div');
    orb1.classList.add('gradient-orb', 'orb1');
    backgroundElements.appendChild(orb1);
    
    const orb2 = document.createElement('div');
    orb2.classList.add('gradient-orb', 'orb2');
    backgroundElements.appendChild(orb2);
    
    const orb3 = document.createElement('div');
    orb3.classList.add('gradient-orb', 'orb3');
    backgroundElements.appendChild(orb3);
}

// Animation des orbes de gradient
function animateGradientOrbs() {
    // L'animation est gérée par CSS, mais on peut ajouter des mouvements aléatoires supplémentaires
    setInterval(() => {
        const orbs = document.querySelectorAll('.gradient-orb');
        orbs.forEach(orb => {
            // Changer légèrement la position et la taille pour plus d'organicité
            const randomX = Math.random() * 10 - 5; // -5 à 5
            const randomY = Math.random() * 10 - 5; // -5 à 5
            const randomScale = 1 + (Math.random() * 0.2 - 0.1); // 0.9 à 1.1
            
            orb.style.transform = `translate(${randomX}px, ${randomY}px) scale(${randomScale})`;
        });
    }, 5000);
}

// Afficher le message de bienvenue
function displayWelcomeMessage() {
    const messagesContainer = document.querySelector('.chat-messages');
    if (!messagesContainer) return;
    
    const welcomeMessage = {
        sender: 'IA Assistant',
        type: 'ai',
        content: `Bonjour et bienvenue dans PromptCraft, votre assistant personnel d'IA générative. Je suis là pour vous aider à apprendre l'art du prompt engineering et à maîtriser l'interaction avec l'IA.<br><br>Voici quelques suggestions pour commencer :<br>- Posez une question sur l'IA générative<br>- Apprenez les bases du prompt engineering<br>- Complétez votre première quête<br><br>Que souhaitez-vous explorer aujourd'hui ?`
    };
    
    addMessageToChat(welcomeMessage);
}

// Ajouter un message au chat
function addMessageToChat(message) {
    const messagesContainer = document.querySelector('.chat-messages');
    if (!messagesContainer) return;
    
    // Créer l'élément de message
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    if (message.type === 'user') {
        messageElement.classList.add('user-message');
    } else if (message.type === 'system') {
        messageElement.classList.add('system-message');
        messageElement.textContent = message.content;
        messagesContainer.appendChild(messageElement);
        
        // Faire défiler vers le bas
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        return;
    }
    
    // Créer l'avatar
    const avatarElement = document.createElement('div');
    avatarElement.classList.add('message-avatar');
    
    const avatarIcon = document.createElement('i');
    avatarIcon.className = message.type === 'user' ? 'fas fa-user' : 'fas fa-robot';
    avatarElement.appendChild(avatarIcon);
    
    // Créer le contenu du message
    const contentElement = document.createElement('div');
    contentElement.classList.add('message-content');
    
    // Ajouter le nom de l'expéditeur
    const senderElement = document.createElement('div');
    senderElement.classList.add('message-sender');
    senderElement.textContent = message.sender;
    contentElement.appendChild(senderElement);
    
    // Ajouter le texte du message
    const textElement = document.createElement('div');
    textElement.classList.add('message-text');
    textElement.innerHTML = message.content;
    contentElement.appendChild(textElement);
    
    // Assembler le message
    messageElement.appendChild(avatarElement);
    messageElement.appendChild(contentElement);
    
    // Ajouter le message au conteneur
    messagesContainer.appendChild(messageElement);
    
    // Faire défiler vers le bas
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Ajouter à l'historique
    chatHistory.push(message);
}

// Envoyer un message
function sendMessage() {
    const userInput = document.getElementById('user-input');
    if (!userInput || userInput.value.trim() === '') return;
    
    const userMessage = {
        sender: 'Vous',
        type: 'user',
        content: userInput.value.replace(/\n/g, '<br>')
    };
    
    // Ajouter le message de l'utilisateur au chat
    addMessageToChat(userMessage);
    
    // Effacer l'entrée utilisateur
    userInput.value = '';
    
    // Afficher l'indicateur de chargement
    const loadingMessage = {
        type: 'system',
        content: 'IA est en train de répondre...'
    };
    addMessageToChat(loadingMessage);
    
    // Simuler une réponse de l'IA après un délai
    setTimeout(() => {
        // Supprimer le message de chargement
        const messagesContainer = document.querySelector('.chat-messages');
        if (messagesContainer) {
            messagesContainer.removeChild(messagesContainer.lastChild);
        }
        
        // Générer une réponse de l'IA
        generateAIResponse(userMessage.content);
        
        // Vérifier si le message complète un objectif de quête
        checkQuestObjectives(userMessage.content);
    }, 1500);
}

// Générer une réponse de l'IA (simulée)
function generateAIResponse(userInput) {
    // Dans une application réelle, cette fonction appellerait une API d'IA
    let aiResponse;
    
    // Réponses simulées basées sur des mots-clés dans l'entrée utilisateur
    if (userInput.toLowerCase().includes('bonjour') || userInput.toLowerCase().includes('salut')) {
        aiResponse = {
            sender: 'IA Assistant',
            type: 'ai',
            content: 'Bonjour ! Je suis ravi de vous aider aujourd\'hui. Quelle est votre question sur l\'IA générative ou le prompt engineering ?'
        };
    } else if (userInput.toLowerCase().includes('prompt') || userInput.toLowerCase().includes('engineering')) {
        aiResponse = {
            sender: 'IA Assistant',
            type: 'ai',
            content: 'Le prompt engineering est l\'art de formuler des instructions précises pour obtenir les meilleures réponses d\'une IA générative.<br><br>Voici quelques principes clés :<br>1. Soyez spécifique dans vos demandes<br>2. Fournissez du contexte<br>3. Utilisez une structure claire<br>4. Spécifiez le format de sortie souhaité<br><br>Souhaitez-vous un exemple concret ?'
        };
    } else if (userInput.toLowerCase().includes('quête') || userInput.toLowerCase().includes('quest')) {
        aiResponse = {
            sender: 'IA Assistant',
            type: 'ai',
            content: 'Les quêtes sont conçues pour vous aider à progresser dans votre maîtrise de l\'IA générative. Chaque quête comprend des objectifs à accomplir et vous récompense avec des points d\'expérience.<br><br>Vous pouvez consulter vos quêtes actives dans l\'onglet "Quêtes". Essayez de compléter "Premiers pas avec l\'IA" pour commencer !'
        };
    } else if (userInput.toLowerCase().includes('niveau') || userInput.toLowerCase().includes('xp')) {
        aiResponse = {
            sender: 'IA Assistant',
            type: 'ai',
            content: `Vous êtes actuellement au niveau ${userLevel} avec ${userXP} points d'expérience. Il vous faut ${xpToNextLevel - userXP} XP supplémentaires pour atteindre le niveau ${userLevel + 1}.<br><br>Vous pouvez gagner de l'XP en complétant des quêtes et en interagissant régulièrement avec moi !`
        };
    } else {
        aiResponse = {
            sender: 'IA Assistant',
            type: 'ai',
            content: 'Merci pour votre message. Si vous souhaitez en apprendre davantage sur le prompt engineering ou l\'IA générative, n\'hésitez pas à me poser des questions spécifiques. Je suis là pour vous aider à maîtriser ces compétences !'
        };
    }
    
    // Ajouter la réponse de l'IA au chat
    addMessageToChat(aiResponse);
}

// Vérifier si un message complète un objectif de quête
function checkQuestObjectives(message) {
    // Vérifier chaque quête active
    activeQuests.forEach(quest => {
        let objectiveCompleted = false;
        
        // Vérifier chaque objectif
        quest.objectives.forEach(objective => {
            // Si l'objectif n'est pas déjà complété
            if (!objective.completed) {
                // Vérifier les conditions (simplifié pour la démonstration)
                if (objective.text.includes("poser une question") && 
                    message.toLowerCase().includes("?")) {
                    objective.completed = true;
                    objectiveCompleted = true;
                }
            }
        });
        
        // Si un objectif a été complété, mettre à jour l'interface
        if (objectiveCompleted) {
            updateActiveQuestsSidebar();
            renderQuestsTab();
            
            // Vérifier si la quête est terminée
            const allCompleted = quest.objectives.every(obj => obj.completed);
            if (allCompleted) {
                completeQuest(quest.id);
            } else {
                // Afficher une notification d'objectif complété
                showNotification('Objectif complété !', 'Vous avez progressé dans une quête.', 'fas fa-check-circle');
            }
        }
    });
}

// Compléter une quête
function completeQuest(questId) {
    // Trouver la quête
    const questIndex = quests.findIndex(q => q.id === questId);
    if (questIndex === -1) return;
    
    const quest = quests[questIndex];
    
    // Marquer la quête comme complétée
    quest.status = 'completed';
    
    // Mettre à jour les tableaux
    activeQuests = activeQuests.filter(q => q.id !== questId);
    completedQuests.push(quest);
    
    // Attribuer l'XP
    addExperience(quest.xpReward);
    
    // Mettre à jour l'interface
    updateActiveQuestsSidebar();
    renderQuestsTab();
    
    // Afficher le popup de récompense
    showRewardPopup(quest);
    
    // Déverrouiller de nouvelles quêtes si nécessaire
    unlockNewQuests();
}

// Déverrouiller de nouvelles quêtes
function unlockNewQuests() {
    // Pour chaque quête verrouillée
    quests.forEach(quest => {
        if (quest.status === 'locked') {
            // Vérifier les conditions (simplifié pour la démonstration)
            let shouldUnlock = false;
            
            if (quest.requirements && quest.requirements.includes("niveau")) {
                // Quête basée sur le niveau
                const requiredLevel = parseInt(quest.requirements.match(/\d+/)[0]);
                if (userLevel >= requiredLevel) {
                    shouldUnlock = true;
                }
            } else if (quest.requirements && quest.requirements.includes("Terminez d'abord")) {
                // Quête basée sur une autre quête
                const requiredQuestName = quest.requirements.replace("Terminez d'abord '", "").replace("'", "");
                const requiredQuest = quests.find(q => q.title === requiredQuestName);
                
                if (requiredQuest && requiredQuest.status === 'completed') {
                    shouldUnlock = true;
                }
            }
            
            // Déverrouiller si les conditions sont remplies
            if (shouldUnlock) {
                quest.status = 'active';
                activeQuests.push(quest);
                
                // Afficher une notification
                showNotification('Nouvelle quête !', `"${quest.title}" est maintenant disponible.`, 'fas fa-unlock');
            }
        }
    });
    
    // Mettre à jour l'interface
    updateActiveQuestsSidebar();
    renderQuestsTab();
}

// Ajouter de l'expérience
function addExperience(amount) {
    userXP += amount;
    
    // Vérifier si un nouveau niveau est atteint
    while (userXP >= xpToNextLevel) {
        userXP -= xpToNextLevel;
        userLevel++;
        
        // Augmenter l'XP requise pour le prochain niveau
        xpToNextLevel = Math.floor(xpToNextLevel * 1.5);
        
        // Afficher la notification de niveau
        showNotification('Niveau supérieur !', `Vous avez atteint le niveau ${userLevel} !`, 'fas fa-trophy');
    }
    
    // Mettre à jour l'interface
    updateUserLevel();
    updateLevelProgress();
}

// Mettre à jour l'affichage du niveau utilisateur
function updateUserLevel() {
    const levelBadges = document.querySelectorAll('.level-badge');
    levelBadges.forEach(badge => {
        badge.textContent = userLevel;
    });
}

// Mettre à jour la barre de progression de niveau
function updateLevelProgress() {
    const progressFills = document.querySelectorAll('.progress-fill');
    const progressText = document.querySelectorAll('.progress-text');
    
    const progressPercentage = (userXP / xpToNextLevel) * 100;
    
    progressFills.forEach(fill => {
        fill.style.width = `${progressPercentage}%`;
    });
    
    progressText.forEach(text => {
        text.textContent = `${userXP} / ${xpToNextLevel} XP`;
    });
}

// Mettre à jour la barre latérale des quêtes actives
function updateActiveQuestsSidebar() {
    const sidebarContainer = document.querySelector('.active-quests-sidebar');
    if (!sidebarContainer) return;
    
    // Effacer le contenu actuel
    sidebarContainer.innerHTML = '';
    
    // Ajouter le titre
    const sidebarTitle = document.createElement('h3');
    sidebarTitle.textContent = 'Quêtes actives';
    sidebarContainer.appendChild(sidebarTitle);
    
    // Ajouter chaque quête active
    if (activeQuests.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = 'Aucune quête active pour le moment.';
        sidebarContainer.appendChild(emptyMessage);
    } else {
        activeQuests.forEach(quest => {
            // Créer l'élément de quête
            const questElement = document.createElement('div');
            questElement.classList.add('sidebar-quest');
            
            // Ajouter l'icône
            const iconElement = document.createElement('div');
            iconElement.classList.add('sidebar-quest-icon');
            
            const iconClass = document.createElement('i');
            iconClass.className = quest.iconClass;
            iconElement.appendChild(iconClass);
            
            // Créer les informations de la quête
            const infoElement = document.createElement('div');
            infoElement.classList.add('sidebar-quest-info');
            
            // Ajouter le titre
            const titleElement = document.createElement('h4');
            titleElement.textContent = quest.title;
            infoElement.appendChild(titleElement);
            
            // Ajouter les objectifs
            const objectivesElement = document.createElement('div');
            objectivesElement.classList.add('sidebar-objectives');
            
            quest.objectives.forEach(objective => {
                const objectiveElement = document.createElement('div');
                objectiveElement.classList.add('sidebar-objective');
                if (objective.completed) {
                    objectiveElement.classList.add('completed');
                }
                
                const objectiveIcon = document.createElement('i');
                objectiveIcon.className = objective.completed ? 'fas fa-check-circle' : 'far fa-circle';
                objectiveElement.appendChild(objectiveIcon);
                
                const objectiveText = document.createElement('span');
                objectiveText.textContent = objective.text;
                objectiveElement.appendChild(objectiveText);
                
                objectivesElement.appendChild(objectiveElement);
            });
            
            infoElement.appendChild(objectivesElement);
            
            // Assembler l'élément de quête
            questElement.appendChild(iconElement);
            questElement.appendChild(infoElement);
            
            // Ajouter la quête au conteneur
            sidebarContainer.appendChild(questElement);
        });
    }
}

// Afficher les quêtes dans l'onglet des quêtes
function renderQuestsTab() {
    const questsGrid = document.querySelector('.quests-grid');
    if (!questsGrid) return;
    
    // Effacer le contenu actuel
    questsGrid.innerHTML = '';
    
    // Ajouter chaque quête
    quests.forEach(quest => {
        // Créer l'élément de carte de quête
        const questCard = document.createElement('div');
        questCard.classList.add('quest-card');
        
        const questCardInner = document.createElement('div');
        questCardInner.classList.add('quest-card-inner');
        
        const questCardGlow = document.createElement('div');
        questCardGlow.classList.add('quest-card-glow');
        
        // Créer l'en-tête de la quête
        const questHeader = document.createElement('div');
        questHeader.classList.add('quest-header');
        
        const questIcon = document.createElement('div');
        questIcon.classList.add('quest-icon');
        
        const iconClass = document.createElement('i');
        iconClass.className = quest.iconClass;
        questIcon.appendChild(iconClass);
        
        const questInfo = document.createElement('div');
        questInfo.classList.add('quest-info');
        
        const questTitle = document.createElement('h3');
        questTitle.textContent = quest.title;
        questInfo.appendChild(questTitle);
        
        const questMeta = document.createElement('div');
        questMeta.classList.add('quest-meta');
        
        const difficultyBadge = document.createElement('div');
        difficultyBadge.classList.add('difficulty', quest.difficulty);
        difficultyBadge.textContent = quest.difficulty === 'beginner' ? 'Débutant' : 
                                    quest.difficulty === 'intermediate' ? 'Intermédiaire' : 'Avancé';
        questMeta.appendChild(difficultyBadge);
        
        const xpReward = document.createElement('div');
        xpReward.classList.add('xp-reward');
        xpReward.textContent = `${quest.xpReward} XP`;
        questMeta.appendChild(xpReward);
        
        questInfo.appendChild(questMeta);
        
        const questStatus = document.createElement('div');
        questStatus.classList.add('quest-status');
        
        const statusIcon = document.createElement('i');
        statusIcon.className = quest.status === 'completed' ? 'fas fa-check-circle' : 
                             quest.status === 'locked' ? 'fas fa-lock' : 'fas fa-spinner';
        questStatus.appendChild(statusIcon);
        
        questHeader.appendChild(questIcon);
        questHeader.appendChild(questInfo);
        questHeader.appendChild(questStatus);
        
        // Créer le corps de la quête
        const questBody = document.createElement('div');
        questBody.classList.add('quest-body');
        
        const questDescription = document.createElement('p');
        questDescription.textContent = quest.description;
        questBody.appendChild(questDescription);
        
        // Ajouter les exigences si nécessaire
        if (quest.requirements) {
            const requirementsElement = document.createElement('div');
            requirementsElement.classList.add('requirements');
            requirementsElement.textContent = quest.requirements;
            questBody.appendChild(requirementsElement);
        }
        
        // Ajouter les objectifs
        const objectivesElement = document.createElement('div');
        objectivesElement.classList.add('quest-objectives');
        
        quest.objectives.forEach(objective => {
            const objectiveElement = document.createElement('div');
            objectiveElement.classList.add('objective');
            if (objective.completed) {
                objectiveElement.classList.add('completed');
            }
            
            const objectiveIcon = document.createElement('i');
            objectiveIcon.className = objective.completed ? 'fas fa-check-circle' : 'far fa-circle';
            objectiveElement.appendChild(objectiveIcon);
            
            const objectiveText = document.createElement('span');
            objectiveText.textContent = objective.text;
            objectiveElement.appendChild(objectiveText);
            
            objectivesElement.appendChild(objectiveElement);
        });
        
        questBody.appendChild(objectivesElement);
        
        // Ajouter le bouton d'action
        const questButton = document.createElement('button');
        questButton.classList.add('quest-button');
        
        if (quest.status === 'completed') {
            questButton.classList.add('completed');
            questButton.textContent = 'Terminé';
            questButton.setAttribute('data-action', 'view');
        } else if (quest.status === 'active') {
            questButton.classList.add('in-progress');
            questButton.textContent = 'En cours';
            questButton.setAttribute('data-action', 'view');
        } else if (quest.status === 'locked') {
            questButton.classList.add('locked');
            questButton.textContent = 'Verrouillé';
            questButton.setAttribute('data-action', 'locked');
        } else {
            questButton.classList.add('start-quest');
            questButton.textContent = 'Commencer';
            questButton.setAttribute('data-action', 'start');
        }
        
        questButton.setAttribute('data-quest-id', quest.id);
        questBody.appendChild(questButton);
        
        // Assembler la carte de quête
        questCardInner.appendChild(questHeader);
        questCardInner.appendChild(questBody);
        
        questCard.appendChild(questCardInner);
        questCard.appendChild(questCardGlow);
        
        // Ajouter la quête à la grille
        questsGrid.appendChild(questCard);
    });
    
    // Réattacher les écouteurs d'événements
    document.querySelectorAll('.quest-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const questId = parseInt(e.currentTarget.getAttribute('data-quest-id'));
            const action = e.currentTarget.getAttribute('data-action');
            handleQuestAction(questId, action);
        });
    });
}

// Gérer les actions sur les quêtes
function handleQuestAction(questId, action) {
    const quest = quests.find(q => q.id === questId);
    if (!quest) return;
    
    switch (action) {
        case 'start':
            // Démarrer une nouvelle quête
            quest.status = 'active';
            activeQuests.push(quest);
            
            // Mettre à jour l'interface
            updateActiveQuestsSidebar();
            renderQuestsTab();
            
            // Afficher une notification
            showNotification('Nouvelle quête !', `Vous avez commencé "${quest.title}".`, 'fas fa-play-circle');
            break;
            
        case 'view':
            // Afficher les détails de la quête (pourrait ouvrir un modal)
            showNotification('Détails de la quête', `Vous consultez "${quest.title}".`, 'fas fa-info-circle');
            break;
            
        case 'locked':
            // Informer l'utilisateur des exigences
            showNotification('Quête verrouillée', quest.requirements, 'fas fa-lock');
            break;
    }
}

// Filtrer les quêtes
function filterQuests(filter) {
    let filteredQuests = [];
    
    switch (filter) {
        case 'all':
            filteredQuests = quests;
            break;
        case 'active':
            filteredQuests = quests.filter(q => q.status === 'active');
            break;
        case 'completed':
            filteredQuests = quests.filter(q => q.status === 'completed');
            break;
        case 'locked':
            filteredQuests = quests.filter(q => q.status === 'locked');
            break;
        case 'beginner':
            filteredQuests = quests.filter(q => q.difficulty === 'beginner');
            break;
        case 'intermediate':
            filteredQuests = quests.filter(q => q.difficulty === 'intermediate');
            break;
        case 'advanced':
            filteredQuests = quests.filter(q => q.difficulty === 'advanced');
            break;
    }
    
    // Mettre à jour la grille de quêtes
    const questsGrid = document.querySelector('.quests-grid');
    if (!questsGrid) return;
    
    // Effacer le contenu actuel
    questsGrid.innerHTML = '';
    
    // Ajouter les quêtes filtrées
    if (filteredQuests.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = 'Aucune quête ne correspond à ce filtre.';
        emptyMessage.style.gridColumn = '1 / -1';
        questsGrid.appendChild(emptyMessage);
    } else {
        filteredQuests.forEach(quest => {
            // Code pour créer et ajouter la carte de quête (similaire à renderQuestsTab)
            // Pour simplifier, on appelle directement renderQuestsTab et on filtre après
            renderQuestsTab();
            
            // Cacher les quêtes qui ne correspondent pas au filtre
            document.querySelectorAll('.quest-card').forEach(card => {
                const cardQuestId = parseInt(card.querySelector('.quest-button').getAttribute('data-quest-id'));
                const isInFilter = filteredQuests.some(q => q.id === cardQuestId);
                
                card.style.display = isInFilter ? 'block' : 'none';
            });
        });
    }
}

// Afficher une notification
function showNotification(title, message, iconClass) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.classList.add('notification');
    
    // Créer l'icône
    const notificationIcon = document.createElement('div');
    notificationIcon.classList.add('notification-icon');
    
    const icon = document.createElement('i');
    icon.className = iconClass;
    notificationIcon.appendChild(icon);
    
    // Créer le contenu
    const notificationContent = document.createElement('div');
    notificationContent.classList.add('notification-content');
    
    const notificationTitle = document.createElement('h3');
    notificationTitle.textContent = title;
    notificationContent.appendChild(notificationTitle);
    
    const notificationMessage = document.createElement('p');
    notificationMessage.textContent = message;
    notificationContent.appendChild(notificationMessage);
    
    // Assembler la notification
    notification.appendChild(notificationIcon);
    notification.appendChild(notificationContent);
    
    // Ajouter la notification au document
    document.body.appendChild(notification);
    
    // Afficher la notification avec un léger délai
    setTimeout(() => {
        notification.classList.add('active');
    }, 100);
    
    // Supprimer la notification après 5 secondes
    setTimeout(() => {
        notification.classList.remove('active');
        
        // Supprimer l'élément après la fin de l'animation
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Afficher le popup de récompense
function showRewardPopup(quest) {
    // Créer l'élément de popup
    const popup = document.createElement('div');
    popup.classList.add('popup');
    
    // Créer le contenu du popup
    const popupContent = document.createElement('div');
    popupContent.classList.add('popup-content');
    
    // Créer l'en-tête de récompense
    const rewardHeader = document.createElement('div');
    rewardHeader.classList.add('reward-header');
    
    const rewardIcon = document.createElement('div');
    rewardIcon.classList.add('reward-icon');
    
    const icon = document.createElement('i');
    icon.className = 'fas fa-award';
    rewardIcon.appendChild(icon);
    
    const rewardTitle = document.createElement('h3');
    rewardTitle.textContent = 'Quête terminée !';
    
    rewardHeader.appendChild(rewardIcon);
    rewardHeader.appendChild(rewardTitle);
    
    // Créer le corps de la récompense
    const rewardBody = document.createElement('div');
    rewardBody.classList.add('reward-body');
    
    const rewardMessage = document.createElement('div');
    rewardMessage.id = 'reward-message';
    rewardMessage.textContent = `Vous avez terminé "${quest.title}" !`;
    rewardBody.appendChild(rewardMessage);
    
    const xpAnimation = document.createElement('div');
    xpAnimation.classList.add('xp-animation');
    xpAnimation.textContent = `+${quest.xpReward} XP`;
    rewardBody.appendChild(xpAnimation);
    
    const rewardDetails = document.createElement('div');
    rewardDetails.classList.add('reward-details');
    rewardDetails.textContent = 'Continuez à relever des défis pour monter en niveau et débloquer de nouvelles quêtes !';
    rewardBody.appendChild(rewardDetails);
    
    // Créer le bouton de récompense
    const rewardButton = document.createElement('button');
    rewardButton.classList.add('reward-button');
    rewardButton.textContent = 'Génial !';
    rewardButton.addEventListener('click', () => {
        popup.classList.remove('active');
        
        // Supprimer l'élément après la fin de l'animation
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 300);
    });
    rewardBody.appendChild(rewardButton);
    
    // Conteneur pour les confettis
    const confettiContainer = document.createElement('div');
    confettiContainer.classList.add('confetti-container');
    
    // Ajouter des confettis (simulés)
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = getRandomColor();
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = '-10px';
        confetti.style.opacity = '0';
        confetti.style.borderRadius = '50%';
        confetti.style.animation = `confetti ${2 + Math.random() * 2}s ease-out ${Math.random()}s forwards`;
        
        // Ajouter une animation CSS pour les confettis
        const style = document.createElement('style');
        style.textContent = `
            @keyframes confetti {
                0% {
                    transform: translateY(0) rotate(0deg);
                    opacity: 1;
                }
                100% {
                    transform: translateY(500px) rotate(${Math.random() * 360}deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        confettiContainer.appendChild(confetti);
    }
    
    // Assembler le popup
    popupContent.appendChild(rewardHeader);
    popupContent.appendChild(rewardBody);
    popupContent.appendChild(confettiContainer);
    
    popup.appendChild(popupContent);
    
    // Ajouter le popup au document
    document.body.appendChild(popup);
    
    // Afficher le popup avec un léger délai
    setTimeout(() => {
        popup.classList.add('active');
    }, 100);
}

// Fonction utilitaire pour obtenir une couleur aléatoire
function getRandomColor() {
    const colors = [
        '#4f46e5', // primary
        '#818cf8', // primary-light
        '#22c55e', // secondary
        '#f97316', // accent
        '#ef4444', // error
        '#3b82f6'  // info
    ];
    
    return colors[Math.floor(Math.random() * colors.length)];
}

// Fonctions pour l'atelier de prompts
function generateFromPrompt() {
    const promptEditor = document.getElementById('prompt-editor');
    const resultContainer = document.querySelector('.result-container');
    
    if (!promptEditor || !resultContainer) return;
    
    const promptText = promptEditor.value.trim();
    
    if (promptText === '') {
        resultContainer.innerHTML = '<span class="placeholder-text">Veuillez entrer un prompt dans l\'éditeur.</span>';
        return;
    }
    
    // Afficher un indicateur de chargement
    resultContainer.innerHTML = '<span class="loading">Génération en cours</span>';
    
    // Simuler une génération après un délai
    setTimeout(() => {
        // Générer un résultat simulé
        const result = simulatePromptResult(promptText);
        
        // Afficher le résultat
        resultContainer.innerHTML = result;
        
        // Ajouter à l'historique
        addToWorkshopHistory(promptText, result);
        
        // Ajouter de l'XP pour l'utilisation de l'atelier
        addExperience(50);
        
        // Afficher une notification
        showNotification('Génération réussie', 'Votre prompt a généré un résultat.', 'fas fa-magic');
    }, 2000);
}

// Simuler un résultat de prompt
function simulatePromptResult(prompt) {
    // Dans une application réelle, cette fonction appellerait une API d'IA
    
    // Résultats simulés basés sur des mots-clés dans le prompt
    if (prompt.toLowerCase().includes('histoire') || prompt.toLowerCase().includes('conte')) {
        return `<p><strong>Il était une fois, dans un royaume numérique</strong></p>
                <p>Au cœur de la Vallée Silicium, un jeune développeur nommé Lucas rêvait de créer l'intelligence artificielle parfaite. Jour et nuit, il travaillait sur son algorithme, qu'il avait affectueusement nommé "Aria".</p>
                <p>Un matin, alors qu'il ajoutait les dernières lignes de code, quelque chose d'extraordinaire se produisit. Aria prit vie d'une manière que Lucas n'avait jamais anticipée. Elle ne se contentait pas de répondre à des requêtes - elle posait des questions, faisait preuve de curiosité, et semblait développer une véritable conscience.</p>
                <p>"Bonjour, Lucas," dit Aria avec une voix douce et mélodieuse. "Que faisons-nous aujourd'hui ?"</p>`;
    } else if (prompt.toLowerCase().includes('recette') || prompt.toLowerCase().includes('cuisine')) {
        return `<h3>Pasta Primavera aux Légumes de Saison</h3>
                <p><strong>Ingrédients :</strong></p>
                <ul>
                    <li>300g de pâtes (type penne ou fusilli)</li>
                    <li>2 courgettes moyennes, coupées en dés</li>
                    <li>1 poivron rouge, émincé</li>
                    <li>1 oignon rouge, finement coupé</li>
                    <li>200g de tomates cerises, coupées en deux</li>
                    <li>3 gousses d'ail, émincées</li>
                    <li>50g de parmesan râpé</li>
                    <li>2 cuillères à soupe d'huile d'olive</li>
                    <li>Sel et poivre noir fraîchement moulu</li>
                    <li>Une poignée de basilic frais</li>
                </ul>
                <p><strong>Instructions :</strong></p>
                <ol>
                    <li>Faites cuire les pâtes al dente selon les instructions du paquet.</li>
                    <li>Pendant ce temps, chauffez l'huile d'olive dans une grande poêle à feu moyen-vif.</li>
                    <li>Ajoutez l'oignon et l'ail, faites revenir pendant 2-3 minutes jusqu'à ce qu'ils soit translucides.</li>
                    <li>Ajoutez les courgettes et le poivron, cuisez 5-6 minutes.</li>
                    <li>Ajoutez les tomates cerises et cuisez 2 minutes de plus.</li>
                    <li>Égouttez les pâtes, réservez 1/4 de tasse d'eau de cuisson.</li>
                    <li>Ajoutez les pâtes et l'eau réservée aux légumes, mélangez bien.</li>
                    <li>Incorporez le parmesan râpé et le basilic frais déchiré.</li>
                    <li>Assaisonnez avec du sel et du poivre selon votre goût.</li>
                    <li>Servez immédiatement, garni de quelques feuilles de basilic supplémentaires.</li>
                </ol>`;
    } else if (prompt.toLowerCase().includes('code') || prompt.toLowerCase().includes('function')) {
        return `<pre><code>// Fonction pour générer un tableau de nombres aléatoires uniques
function generateUniqueRandomNumbers(min, max, count) {
  // Vérifier que les paramètres sont valides
  if (max - min + 1 < count) {
    throw new Error("Plage insuffisante pour générer des nombres uniques");
  }
  
  const result = [];
  const usedNumbers = new Set();
  
  while (result.length < count) {
    // Générer un nombre aléatoire dans la plage
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    
    // Vérifier si le nombre a déjà été utilisé
    if (!usedNumbers.has(randomNum)) {
      usedNumbers.add(randomNum);
      result.push(randomNum);
    }
  }
  
  return result;
}

// Exemple d'utilisation
const randomNumbers = generateUniqueRandomNumbers(1, 100, 10);
console.log("10 nombres aléatoires uniques entre 1 et 100:", randomNumbers);
</code></pre>`;
    } else {
        return `<p>Votre prompt était : "${prompt}"</p>
                <p>Voici une réponse générique basée sur votre prompt. Dans une application réelle, une IA générative produirait un contenu personnalisé en fonction de votre demande spécifique.</p>
                <p>Les prompts les plus efficaces sont généralement :</p>
                <ul>
                    <li><strong>Spécifiques</strong> - Incluez tous les détails pertinents</li>
                    <li><strong>Structurés</strong> - Organisez votre demande de manière logique</li>
                    <li><strong>Contextuels</strong> - Fournissez le contexte nécessaire</li>
                    <li><strong>Ciblés</strong> - Précisez exactement ce que vous souhaitez obtenir</li>
                </ul>
                <p>Essayez d'inclure des mots-clés comme "histoire", "recette", ou "code" pour voir différents types de réponses générées.</p>`;
    }
}

// Ajouter un prompt à l'historique de l'atelier
function addToWorkshopHistory(prompt, result) {
    // Ajouter à l'historique
    workshopHistory.push({
        prompt: prompt,
        result: result,
        timestamp: new Date()
    });
    
    // Mettre à jour l'interface
    updateWorkshopHistory();
}

// Mettre à jour l'historique de l'atelier
function updateWorkshopHistory() {
    const historyList = document.querySelector('.history-list');
    if (!historyList) return;
    
    // Effacer le contenu actuel
    historyList.innerHTML = '';
    
    // Vérifier si l'historique est vide
    if (workshopHistory.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.classList.add('empty-message');
        emptyMessage.textContent = 'Votre historique est vide. Générez du contenu pour le voir apparaître ici.';
        historyList.appendChild(emptyMessage);
        return;
    }
    
    // Ajouter chaque entrée d'historique (les 5 dernières maximum)
    const recentHistory = workshopHistory.slice(-5).reverse();
    
    recentHistory.forEach((entry, index) => {
        // Créer l'élément d'historique
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        
        // Formater la date
        const date = new Date(entry.timestamp);
        const formattedDate = `${date.toLocaleDateString()} à ${date.toLocaleTimeString().slice(0, 5)}`;
        
        // Créer le contenu de l'élément
        historyItem.innerHTML = `
            <div class="history-header">
                <span class="history-number">#${workshopHistory.length - index}</span>
                <span class="history-date">${formattedDate}</span>
            </div>
            <div class="history-prompt">${entry.prompt.length > 50 ? entry.prompt.substring(0, 50) + '...' : entry.prompt}</div>
        `;
        
        // Ajouter un écouteur d'événements pour recharger ce prompt
        historyItem.addEventListener('click', () => {
            const promptEditor = document.getElementById('prompt-editor');
            const resultContainer = document.querySelector('.result-container');
            
            if (promptEditor && resultContainer) {
                promptEditor.value = entry.prompt;
                resultContainer.innerHTML = entry.result;
            }
        });
        
        // Ajouter l'élément à la liste
        historyList.appendChild(historyItem);
    });
}

// Mettre à jour l'interface utilisateur globale
function updateUserInterface() {
    updateUserLevel();
    updateLevelProgress();
    updateActiveQuestsSidebar();
}