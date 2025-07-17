const { Client, GatewayIntentBits } = require("discord.js")
const { listServers } = require("./actions/listServers.js")
const { listChannels } = require("./actions/listChannels.js")
const { listMessages } = require("./actions/listMessages.js")

require("dotenv").config({ quiet: true })

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
})

client.once("ready", async (readyClient) => {
    const args = process.argv.slice(2) // Remove 'node' e 'channel_reader.js'

    try {
        if (args.length === 0) {
            // Lista servidores
            const servers = listServers(readyClient)
            servers.forEach((server) => {
                console.log(`${server.name} ${server.id}`)
            })
        } else if (args.length === 1) {
            // Lista canais do servidor
            const serverId = args[0]
            const result = listChannels(readyClient, serverId)

            if (result.success) {
                result.channels.forEach((channel) => {
                    console.log(channel.name)
                })
            } else {
                console.error(result.error)
            }
        } else if (args.length === 2) {
            // Lista últimas 1000 mensagens
            const serverId = args[0]
            const channelName = args[1]
            const result = await listMessages(readyClient, serverId, channelName, 1000)

            if (result.success) {
                result.messages.forEach((message) => {
                    const timestamp = message.timestamp.toISOString()
                    const author = message.author.username
                    const content = message.content || "[No text content]"
                    console.log(`${timestamp} ${author}: ${content}`)
                })
            } else {
                console.error(result.error)
            }
        } else if (args.length === 3) {
            // Lista últimas N mensagens
            const serverId = args[0]
            const channelName = args[1]
            const messageCount = parseInt(args[2])

            if (isNaN(messageCount) || messageCount <= 0) {
                console.error("Error: Third argument must be a positive number")
                process.exit(1)
            }

            const result = await listMessages(readyClient, serverId, channelName, messageCount)

            if (result.success) {
                result.messages.forEach((message) => {
                    const timestamp = message.timestamp.toISOString()
                    const author = message.author.username
                    const content = message.content || "[No text content]"
                    console.log(`${timestamp} ${author}: ${content}`)
                })
            } else {
                console.error(result.error)
            }
        } else {
            console.error("Error: Too many arguments")
            console.error("Usage:")
            console.error("  node channel_reader.js                           - List servers")
            console.error("  node channel_reader.js <server_id>               - List channels")
            console.error("  node channel_reader.js <server_id> <channel>     - List last 1000 messages")
            console.error("  node channel_reader.js <server_id> <channel> <N> - List last N messages")
            process.exit(1)
        }
    } catch (error) {
        console.error(`Error: ${error.message}`)
        process.exit(1)
    }

    process.exit(0)
})

client.login(process.env.DISCORD_BOT_TOKEN)
