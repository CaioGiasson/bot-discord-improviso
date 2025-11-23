const { PrismaClient } = require("../generated/prisma")

class PlayerRepository {
    constructor() {
        this.prisma = new PrismaClient()
    }

    /**
     * Synchronizes player data - finds existing player or creates new one
     * @param {Object} playerData - Player information
     * @param {string} playerData.tenant - The tenant (DISCORD, TELEGRAM, etc.)
     * @param {string} playerData.playerName - Player's display name
     * @param {string} playerData.playerId - Player's ID in the specific tenant
     * @returns {Promise<Object>} Prisma Player object
     */
    async sync(playerData) {
        const { tenant, playerName, playerId } = playerData

        // Build the unique identifier based on tenant
        const uniqueField = this._getTenantIdField(tenant)
        const whereClause = {
            tenant: tenant,
            [uniqueField]: playerId
        }

        console.log({ playerData, whereClause })

        try {
            // Try to find existing player
            let player = await this.prisma.player.findFirst({
                where: whereClause
            })

            if (player) {
                // Update player name if it has changed
                if (player.playerName !== playerName) {
                    player = await this.prisma.player.update({
                        where: { id: player.id },
                        data: { playerName }
                    })
                }
                return player
            }

            // Create new player if not found
            const createData = {
                tenant: tenant,
                playerName: playerName,
                [uniqueField]: playerId
            }

            player = await this.prisma.player.create({
                data: createData
            })

            return player
        } catch (error) {
            console.log(error.message)
        }
    }

    /**
     * Gets the appropriate ID field based on tenant
     * @param {string} tenant - The tenant type
     * @returns {string} The field name for the tenant ID
     * @private
     */
    _getTenantIdField(tenant) {
        switch (tenant) {
            case "DISCORD":
                return "discordId"
            case "TELEGRAM":
                return "telegramId"
            case "WHATSAPP":
                return "whatsappId"
            default:
                throw new Error(`Unsupported tenant: ${tenant}`)
        }
    }

    /**
     * Closes the Prisma connection
     */
    async disconnect() {
        await this.prisma.$disconnect()
    }
}

module.exports = PlayerRepository
