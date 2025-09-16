const fs = require("fs")
const path = require("path")

// Load critical failures table
const criticalFailures = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "baseData", "criticalFailures.json"), "utf8"))

// Function to roll a die
const rollDice = function (sides) {
    return Math.floor(Math.random() * sides) + 1
}

// Function to format dice roll result
const formatDiceRoll = function (result) {
    return `${result}`
}

// Function to perform critical failure roll
const rollFalhaCritica = function (playerName) {
    // Roll 1d100
    const roll = rollDice(100)

    // Get the critical failure effect from the table
    // The array is 0-indexed but we want 1-100, so we use roll-1 for index
    // But index 0 is empty, so we use roll directly (1-100 maps to indices 1-100)
    let effect = ""

    try {
        // The JSON array has index 0 as empty string, so roll value maps directly to array index
        effect = criticalFailures[roll] || "Efeito não encontrado."
    } catch (error) {
        effect = "Erro ao buscar efeito da falha crítica."
    }

    // Format the result message
    let result = `**${playerName} - Rolagem de falha crítica**\n`
    result += `1d100 = ${formatDiceRoll(roll)}\n`
    result += `\`${effect}\``

    return result
}

// Main message processing function
const processFalhaCriticaMessage = function (messageText, playerName) {
    // Check if the message is "falha critica" or variations (case insensitive)
    const normalizedMessage = messageText.toLowerCase().trim()

    if (normalizedMessage === "falha critica" || normalizedMessage === "falha crítica" || normalizedMessage === "falhacritica") {
        const result = rollFalhaCritica(playerName)
        return {
            content: result,
            components: [] // No interactive components needed
        }
    }

    return null
}

module.exports = {
    processFalhaCriticaMessage
}
