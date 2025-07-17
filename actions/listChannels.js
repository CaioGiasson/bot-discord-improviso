const { ChannelType } = require("discord.js")

function listChannels(client, serverId) {
    const guild = client.guilds.cache.get(serverId)

    if (!guild) {
        return {
            success: false,
            error: `Server with ID ${serverId} not found`
        }
    }

    const textChannels = guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText)

    const channels = []
    textChannels.forEach((channel) => {
        channels.push({
            name: channel.name,
            id: channel.id
        })
    })

    return {
        success: true,
        channels: channels,
        serverInfo: {
            name: guild.name,
            id: guild.id
        }
    }
}

module.exports = { listChannels }
