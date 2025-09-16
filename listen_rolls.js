const { Client, GatewayIntentBits } = require("discord.js")
const { processMessage } = require("./message_router.js")
const { processCritaoMessage, processCritaoInteraction } = require("./actions/critao.js")

require("dotenv").config()

const bot = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
})

bot.once("ready", () => {
    console.log(`Conectou como ${bot.user.username} - ${bot.user.id}`)
    console.log(`Escutando mensagens...`)
})

bot.on("messageCreate", (message) => {
    // Ignora mensagens do próprio bot
    if (message.author.id === bot.user.id) return

    // Só interpreta mensagens do canal "dados"
    if (!message.channel.name.includes("dados")) return

    // Obter nome do usuário (nickname se existir, senão username)
    const playerName = message.member?.nickname || message.author.username

    // Verificar se é um comando CRITAO
    const critaoResponse = processCritaoMessage(message.content, playerName)
    if (critaoResponse) {
        message.reply(critaoResponse)
        return
    }

    // Enviar mensagem para o router e processar rolagens de dados
    const resultado = processMessage(message.content, playerName)

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
