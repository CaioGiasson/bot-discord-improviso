const { Client, GatewayIntentBits } = require("discord.js")
const { processRoll } = require("./actions/roll.js")

require("dotenv").config()

const bot = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
})

bot.once("ready", () => {
    console.log(`Conectou como ${bot.user.username} - ${bot.user.id}`)
    console.log(`Servidores conectados:`)

    bot.guilds.cache.forEach((guild) => {
        console.log(`- ${guild.name} (ID: ${guild.id})`)
    })

    console.log(`Total de servidores: ${bot.guilds.cache.size}`)
})

bot.on("messageCreate", (message) => {
    if (message.author.id === bot.user.id) return

    var comando = message.content

    if (comando.match(/[0-9]+d[0-9]+/g) != null) {
        if (comando[0] == `!` || comando[0] == `/`) comando = comando.substring(1)
        else return

        const name = message.member?.nickname || message.author.username
        const resultado = processRoll(comando, name)

        message.channel.send(resultado)
    }
})

bot.login(process.env.DISCORD_BOT_TOKEN)
