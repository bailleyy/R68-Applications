require("dotenv").config();
const { Client, GatewayIntentBits, Events, Collection, Partials, MessageFlags } = require("discord.js");

const DiscordClient = new Client({
    fetchAllMembers: true,
    intents: [Object.keys(GatewayIntentBits)],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const RequiredRole = "1310366112407355425";

DiscordClient.login(process.env.BOT_TOKEN);
DiscordClient.once("ready", () => {
    console.log(`[STARTUP]: Discord Client successfully logged in as ${DiscordClient.user.username}`)
})

DiscordClient.on("messageCreate", async (Message) => {
    try {
        if (!Message.author?.bot && Message.inGuild() && Message.content.startsWith("?dm ")) {
            const Member = Message.guild.members.cache.get(Message.author.id);
            if (!Member?.roles.cache.has(RequiredRole)) throw new Error("You have insufficient permissions.");

            const Args = Message.content.slice(4).trim().split(" ");
            const TargetRaw = Args.shift();
            const MessageContent = Args.join(" ");
            if (!TargetRaw || !MessageContent) throw new Error("Invalid arguments provied.");

            let TargetId;
            const MentionMatch = TargetRaw.match(/^<@!?(\d+)>$/);
            if (MentionMatch) {
                TargetId = MentionMatch[1];
            } else if (!isNaN(TargetRaw)) {
                TargetId = TargetRaw;
            } else {
                return;
            }

            const RealTarget = await Message.guild.members.fetch(TargetId).catch(() => null);
            if (!RealTarget) throw new Error("Member not found.");

            await RealTarget.send(MessageContent).catch(() => null);
            await Message.reply({ content: "Sent DM!", flags: [MessageFlags.Ephemeral] })
        }
    } catch (Error) {
        console.error("Failed while running DM logic:", Error);
        Message.reply({ content: `Failed to send DM: ${Error.message}`, flags: [MessageFlags.Ephemeral] }).catch(() => null)
    }
});
