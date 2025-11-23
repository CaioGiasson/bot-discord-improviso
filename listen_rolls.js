const { Client, GatewayIntentBits } = require("discord.js")
const { processMessage } = require("./message_router.js")
const { processCritaoMessage, processCritaoInteraction } = require("./actions/critao.js")
const { processFalhaCriticaMessage } = require("./actions/falha_critica.js")

require("dotenv").config()

const bot = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
})

bot.once("ready", () => {
    console.log(`Conectou como ${bot.user.username} - ${bot.user.id}`)
    console.log(`Escutando mensagens...`)
})

bot.on("messageCreate", async (message) => {
    // Ignora mensagens do próprio bot
    if (message.author.id === bot.user.id) return

    // Só interpreta mensagens do canal "dados"
    if (!message.channel.name.includes("dados") && !message.channel.name.includes("arena")) return

    // Obter nome do usuário (nickname se existir, senão username)
    const playerName = message.member?.nickname || message.author.username
    const playerId = message.author.id // Discord user ID

    // Verificar se é um comando CRITAO
    const critaoResponse = processCritaoMessage(message.content, playerName)
    if (critaoResponse) {
        message.reply(critaoResponse)
        return
    }

    // Verificar se é um comando FALHA CRÍTICA
    const falhaCriticaResponse = processFalhaCriticaMessage(message.content, playerName)
    if (falhaCriticaResponse) {
        message.reply(falhaCriticaResponse)
        return
    }

    // Enviar mensagem para o router e processar rolagens de dados
    const resultado = await processMessage(message.content, playerName, playerId)

    // Se houver resultado válido, responder como reply
    if (resultado) {
        message.reply(resultado)
    }
})

// Handle button interactions
bot.on("interactionCreate", async (interaction) => {
    if (!interaction.isButton()) return

    // Only handle interactions in "dados" channels
    if (!interaction.channel.name.includes("dados")) return

    // Check if it's a CRITAO interaction
    if (interaction.customId.startsWith("critao_")) {
        const critaoResponse = processCritaoInteraction(interaction)
        if (critaoResponse) {
            await interaction.update(critaoResponse)
            return
        }
    }

    // If no handler found, acknowledge the interaction
    if (!interaction.replied && !interaction.deferred) {
        await interaction.deferUpdate()
    }
})

bot.login(process.env.DISCORD_BOT_TOKEN)
