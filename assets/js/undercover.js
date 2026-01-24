const terminal = document.getElementById("terminal-undercover");
const runGameBtn = document.getElementById("runGameBtn");
const showCodeBtn = document.getElementById("showCodeBtn");
const codeBlock = document.getElementById("undercoverCode");

// Simulation simple du jeu
const simulationLines = [
  "Bienvenue dans le jeu Undercover !",
  "Nombre de joueurs : 4",
  "Distribution des rôles...",
  "Joueur 1 : Innocent",
  "Joueur 2 : Undercover",
  "Joueur 3 : Innocent",
  "Joueur 4 : Mr. White",
  "--- Tour 1 ---",
  "Joueur 1 donne un indice : fruit rouge",
  "Joueur 2 donne un indice : fruit",
  "Joueur 3 donne un indice : pomme",
  "Joueur 4 donne un indice : ???",
  "--- Vote ---",
  "Joueur 2 est éliminé",
  "Les innocents ont gagné !",
];

// Affichage du code Python
const uversionShCode = `import random
from colorama import Fore, Style
import os

def print_color(message, color=Fore.WHITE):
    print(color + message + Style.RESET_ALL)

def safe_input(prompt, options):
    while True:
        value = input(prompt).strip()
        if value in options:
            return value
        print(f"Entrée invalide. Choisissez parmi : {', '.join(options)}.")

def distribute_roles(num_players):
    roles = ["Innocent"] * (num_players - 2) + ["Undercover", "Mr. White"]
    random.shuffle(roles)
    return roles

def give_words(roles):
    word_pairs = [
        ("pomme", "poire"), ("chien", "chat"), ("plage", "mer"), ("montagne", "colline"), ("table", "chaise"),
        ("ordinateur", "clavier"), ("voiture", "vélo"), ("maison", "appartement"), ("arbre", "bush"),
        ("souris", "clavier"), ("chocolat", "sucre"), ("rose", "lilas"), ("bouteille", "verre"), ("ville", "village"),
        ("école", "université"), ("chat", "chien"), ("lune", "soleil"), ("étoile", "planète"), ("océan", "mer"),
        ("merveille", "mystère"), ("ballon", "foot"), ("café", "thé"), ("voiture", "camion"), ("voix", "chanson"),
        ("abeille", "papillon"), ("ciel", "terre"), ("chaise", "canapé"), ("lit", "matelas"), ("légume", "fruit"),
        ("noir", "blanc"), ("chaud", "froid"), ("mer", "montagne"), ("désert", "plage"), ("hiver", "été"),
        ("chaton", "chiot"), ("cheval", "âne"), ("salade", "pâtes"), ("aéroport", "station"), ("avion", "train"),
        ("serpent", "lézard"), ("pied", "main"), ("maison", "grange"), ("forêt", "savanes"), ("plage", "sable"),
        ("supermarché", "marché"), ("bijou", "montre"), ("télévision", "radio"), ("film", "série"),
        ("cinéma", "théâtre"), ("lac", "rivières"), ("fleur", "plante"), ("gâteau", "biscuit"),
        ("cheminée", "radiateur"), ("camping", "hôtel"), ("électricité", "gaz"), ("chapeau", "casquette"),
        ("thermomètre", "baromètre"), ("piscine", "jacuzzi"), ("ordinateur", "tablette"), ("smartphone", "téléphone"),
        ("table", "banc"), ("banque", "bourse"), ("route", "autoroute"), ("porte", "fenêtre"), ("pied", "cheville"),
        ("moteur", "vitesse"), ("bicyclettes", "scooter"), ("escalier", "ascenseur"), ("gâteau", "brioche"),
        ("carte", "plan"), ("géographie", "histoire"), ("poisson", "crevette"), ("oiseaux", "papillon"),
        ("feuille", "papier"), ("livre", "revue"), ("stylo", "crayon"), ("création", "invention"),
        ("poids", "mesure"), ("harmonie", "désaccord"), ("saison", "mois"), ("vache", "mouton"),
        ("bouc", "chèvre"), ("guitare", "piano"), ("harpe", "violon"), ("chanson", "poème"),
        ("parfum", "savon"), ("café", "chocolat"), ("merveille", "fantaisie"), ("clé", "serrure"),
        ("ceinture", "vêtement"), ("sac", "valise"), ("vêtements", "accessoires"), ("grille", "porte"),
        ("musique", "danse"), ("disque", "vinyle"), ("magazine", "journal"), ("compteur", "mètre"),
        ("ciel", "nuages"), ("drapeau", "bannière"), ("légende", "mythe"), ("peinture", "sculpture"),
        ("atelier", "galerie"), ("vélo", "monocycle"), ("bicyclette", "scooter"), ("taxi", "bus"),
        ("jardin", "terrains"), ("rond", "carré"), ("triangulaire", "rectangulaire"), ("balade", "marche")
    ]
    
    innocent_word, undercover_word = random.choice(word_pairs)

    words = []
    for role in roles:
        if role == "Innocent":
            words.append(innocent_word)
        elif role == "Undercover":
            words.append(undercover_word)
        else:
            words.append("???")
    return words

def validate_clue(clue, forbidden_word):
    if forbidden_word.lower() in clue.lower():
        print(f"Indice invalide ! Vous ne pouvez pas utiliser votre mot : {forbidden_word}")
        return False
    return True

def clear_screen():
    """Nettoie l'écran pour garantir la confidentialité des mots."""
    os.system('cls' if os.name == 'nt' else 'clear')

def display_votes(votes):
    print("\n--- Résultats du vote ---")
    for player, vote_count in sorted(votes.items()):
        print(f"{player} : {vote_count} vote(s)")

def end_game(roles, player_names, eliminated):
    print("\n--- Fin du jeu ---")
    print("Rôles des joueurs :")
    for i, role in enumerate(roles, start=1):
        status = "éliminé" if player_names[i-1] in eliminated else "en jeu"
        print(f"{player_names[i-1]} : {role} ({status})")

def play_game():
    print_color("Bienvenue dans le jeu Undercover !", Fore.GREEN)
    num_players = int(input("Entrez le nombre de joueurs (minimum 4) : "))
    while num_players < 4:
        num_players = int(input("Nombre insuffisant. Entrez au moins 4 joueurs : "))

    roles = distribute_roles(num_players)
    player_names = [input(f"Nom du joueur {i+1} : ").strip() for i in range(num_players)]
    words = give_words(roles)

    print_color("\n--- Distribution des mots ---", Fore.CYAN)
    for i, player in enumerate(player_names):
        input(f"{player}, appuyez sur Entrée pour voir votre mot...")
        clear_screen()
        print_color(f"Votre mot est : {words[i]}", Fore.YELLOW)
        input("Appuyez sur Entrée pour continuer...")
        clear_screen()

    eliminated = set()
    while True:
        print_color("\n--- Tour de jeu ---", Fore.YELLOW)
        remaining_players = [name for name in player_names if name not in eliminated]
        random.shuffle(remaining_players)  # Mélange de l'ordre des joueurs

        for player in remaining_players:
            clue = input(f"{player}, donnez un indice sur votre mot : ").strip()
            player_word = words[player_names.index(player)]
            while not validate_clue(clue, player_word):
                clue = input("Indice invalide. Réessayez : ").strip()

        votes = {}
        print_color("\n--- Vote ---", Fore.MAGENTA)
        for voter in remaining_players:
            options = [p for p in remaining_players if p != voter]
            vote = safe_input(f"{voter}, votez pour éliminer un joueur ({', '.join(options)}) : ", options)
            votes[vote] = votes.get(vote, 0) + 1

        display_votes(votes)
        voted_out = max(votes, key=votes.get)
        print_color(f"\n{voted_out} est éliminé.", Fore.RED)
        eliminated.add(voted_out)

        remaining_roles = [roles[player_names.index(name)] for name in remaining_players if name not in eliminated]
        if "Undercover" not in remaining_roles:
            print_color("Les innocents ont gagné !", Fore.GREEN)
            break
        elif len(remaining_roles) == 2:
            print_color("Les Undercover ont gagné !", Fore.RED)
            break

    end_game(roles, player_names, eliminated)

# Lancer le jeu
play_game()`;

function runSimulation() {
    terminal.innerHTML = ""; // réinitialise le terminal
    let i = 0;
    const interval = setInterval(() => {
        if (i < simulationLines.length) {
            terminal.innerHTML += simulationLines[i] + "<br>";
            terminal.scrollTop = terminal.scrollHeight; // scroll automatique
            i++;
        } else {
            clearInterval(interval);
        }
    }, 500); // affiche une ligne toutes les 500ms
}

// Bouton pour lancer la simulation
runGameBtn.addEventListener("click", () => {
    runSimulation();
});

// Bouton pour afficher le code
showCodeBtn.addEventListener("click", () => {
    codeBlock.style.display = "block";
    codeBlock.textContent = uversionShCode;
    codeBlock.scrollTop = 0; // remonter en haut
});