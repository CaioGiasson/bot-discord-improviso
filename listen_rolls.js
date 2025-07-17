const { Client, GatewayIntentBits } = require("discord.js")
const { processMessage } = require("./message_router.js")

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

    // Enviar mensagem para o router e processar
    const resultado = processMessage(message.content, playerName)

    // Se houver resultado válido, responder como reply
    if (resultado) {
        message.reply(resultado)
    }
})

bot.login(process.env.DISCORD_BOT_TOKEN)
