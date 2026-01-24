const terminal = document.getElementById("terminal");
const input = document.getElementById("cmd");

function print(text, className = "") {
  const line = document.createElement("div");
  line.textContent = text;
  line.className = className;
  terminal.appendChild(line);
  terminal.scrollTop = terminal.scrollHeight;
}

print("Bienvenue dans version.sh");
print("Tapez : help");

input.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const cmd = input.value.trim();
    print(`$ ${cmd}`);
    handleCommand(cmd);
    input.value = "";
  }
});

let commits = [];
let staging = [];

window.handleCommand = function(cmd) {
  const [command, ...args] = cmd.split(" ");

  switch (command) {
    case "help":
      print("Commandes disponibles :");
      print(" add <file>");
      print(" commit <message>");
      print(" log");
      print(" status");
      break;

    case "add":
      if (!args[0]) return print("Erreur : fichier manquant");
      staging.push(args[0]);
      print(`Ajouté à l’index : ${args[0]}`);
      break;

    case "commit":
      if (staging.length === 0) return print("Rien à commit");
      const msg = args.join(" ") || "commit";
      commits.push({
        msg,
        files: [...staging],
        date: new Date().toLocaleString()
      });
      staging = [];
      print(`[commit ${commits.length}] ${msg}`);
      break;

    case "log":
      if (commits.length === 0) return print("Aucun commit");
      commits.slice().reverse().forEach((c, i) => {
        print(`commit ${commits.length - i}`);
        print(`Date: ${c.date}`);
        print(`    ${c.msg}`);
      });
      break;

    case "status":
      print("Fichiers indexés :");
      staging.forEach(f => print(`  ${f}`));
      break;

    default:
      print(`Commande inconnue : ${command}`);
  }
}
