const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js")
const fs = require("fs")
const path = require("path")

// Load critical hit tables
const criticalTables = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "baseData", "criticalTables.json"), "utf8"))

// Function to roll a die
const rollDice = function (sides) {
    return Math.floor(Math.random() * sides) + 1
}

// Function to format dice roll result
const formatDiceRoll = function (result, modifier = 0) {
    if (modifier === 0) {
        return `(${result})`
    } else {
        const sign = modifier > 0 ? "+" : ""
        const total = result + modifier
        return `(${result})${sign}${modifier} = ${total}`
    }
}

// Function to get location from 1d10 roll
const getLocationFromRoll = function (roll) {
    switch (roll) {
        case 1:
            return "Perna Direita"
        case 2:
            return "Perna Esquerda"
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
            return "Tronco"
        case 8:
            return "Braço Direito"
        case 9:
            return "Braço Esquerdo"
        case 10:
            return "Cabeça"
        default:
            return "Tronco" // fallback
    }
}

// Function to create damage type selection buttons
const createDamageTypeButtons = function () {
    const row1 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("critao_energia").setLabel("Energia").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("critao_corte").setLabel("Corte").setStyle(ButtonStyle.Primary)
    )

    const row2 = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("critao_perfuracao").setLabel("Perfuração").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("critao_esmagamento").setLabel("Esmagamento").setStyle(ButtonStyle.Primary)
    )

    return [row1, row2]
}

// Function to create severity modifier buttons
const createSeverityButtons = function (damageType) {
    const modifiers = [
        { label: "-2", value: 0 },
        { label: "-1", value: 1 },
        { label: "0", value: 2 },
        { label: "+1", value: 3 },
        { label: "+2", value: 4 },
        { label: "+3", value: 5 },
        { label: "+4", value: 6 },
        { label: "+5", value: 7 },
        { label: "+6", value: 8 }
    ]

    const rows = []
    for (let i = 0; i < 3; i++) {
        const row = new ActionRowBuilder()
        for (let j = 0; j < 3; j++) {
            const index = i * 3 + j
            if (index < modifiers.length) {
                const mod = modifiers[index]
                row.addComponents(
                    new ButtonBuilder().setCustomId(`critao_${damageType}_${mod.value}`).setLabel(mod.label).setStyle(ButtonStyle.Primary)
                )
            }
        }
        rows.push(row)
    }

    return rows
}

// Function to perform critical hit roll
const rollCritao = function (damageType, modifierIndex, playerName) {
    // Roll for location (1d10)
    const locationRoll = rollDice(10)
    const location = getLocationFromRoll(locationRoll)

    // Calculate actual modifier from index (0-8 maps to -2 to +6)
    const actualModifier = modifierIndex - 2

    // Roll for severity (1d10 + modifier)
    const severityRoll = rollDice(10)
    const severityTotal = severityRoll + actualModifier

    // Ensure severity is within bounds (1-16)
    const severityIndex = Math.max(1, Math.min(16, severityTotal))

    // Get the critical hit effect from the table
    const damageTypeKey = damageType.charAt(0).toUpperCase() + damageType.slice(1)
    let effect = ""

    try {
        effect = criticalTables[damageTypeKey][location][severityIndex] || "Efeito não encontrado."
    } catch (error) {
        effect = "Erro ao buscar efeito do crítico."
    }

    // Format the result message with damage type
    const damageTypeDisplay = damageTypeKey === "Perfuracao" ? "Perfuração" : damageTypeKey
    let result = `**${playerName} - Rolagem de acerto crítico de ${damageTypeDisplay}**\n`
    result += `Local: 1d10 = ${formatDiceRoll(locationRoll)} = \`${location}\`\n`

    if (actualModifier === 0) {
        result += `Gravidade: 1d10 = ${formatDiceRoll(severityRoll)} = ${severityTotal}\n`
    } else {
        const modifierSign = actualModifier > 0 ? "+" : ""
        result += `Gravidade: 1d10${modifierSign}${actualModifier} = ${formatDiceRoll(severityRoll, actualModifier)}\n`
    }

    result += `\`${effect}\``

    return result
}

// Main message processing function
const processCritaoMessage = function (messageText, playerName) {
    // Check if the message is "critao" (case insensitive)
    if (messageText.toLowerCase() === "critao") {
        return {
            content: "Qual o tipo de dano?",
            components: createDamageTypeButtons()
        }
    }
    return null
}

// Button interaction processing function
const processCritaoInteraction = function (interaction) {
    const customId = interaction.customId
    const playerName = interaction.member?.nickname || interaction.user.username

    // Check if it's a damage type selection
    if (customId.startsWith("critao_") && !customId.match(/_\d+$/)) {
        const damageType = customId.replace("critao_", "")

        // Validate damage type
        if (["energia", "corte", "perfuracao", "esmagamento"].includes(damageType)) {
            return {
                content: "Qual o modificador de gravidade?",
                components: createSeverityButtons(damageType)
            }
        }
    }

    // Check if it's a severity modifier selection
    const severityMatch = customId.match(/^critao_(\w+)_(\d+)$/)
    if (severityMatch) {
        const damageType = severityMatch[1]
        const modifierIndex = parseInt(severityMatch[2])

        // Validate inputs
        if (["energia", "corte", "perfuracao", "esmagamento"].includes(damageType) && modifierIndex >= 0 && modifierIndex <= 8) {
            const result = rollCritao(damageType, modifierIndex, playerName)
            return {
                content: result,
                components: [] // Remove buttons after final result
            }
        }
    }

    return null
}

module.exports = {
    processCritaoMessage,
    processCritaoInteraction
}
