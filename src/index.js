require('dotenv').config();
const {
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  Partials,
} = require('discord.js');
const { EMOJIS, getEmojiKey, makePollDescription, makeResultDescription } = require('./poll-utils');
const { loadPolls, savePolls } = require('./store');

if (!process.env.DISCORD_TOKEN) {
  console.error('DISCORD_TOKEN tanımlı değil. .env.example dosyasını .env olarak kopyalayın.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User],
});

let polls = loadPolls();
const timers = new Map();

function persistPolls() {
  savePolls(polls);
}

async function hydrateReaction(reaction) {
  if (reaction.partial) await reaction.fetch();
  if (reaction.message.partial) await reaction.message.fetch();
}

async function removeUserReaction(reaction, userId) {
  try {
    await reaction.users.remove(userId);
  } catch (error) {
    console.warn(`Reaksiyon kaldırılamadı (${userId}):`, error.message);
  }
}

async function endPoll(messageId) {
  const poll = polls.find((item) => item.messageId === messageId);
  if (!poll) return;

  timers.delete(messageId);

  try {
    const channel = await client.channels.fetch(poll.channelId);
    const message = await channel.messages.fetch(messageId);
    const eligibleVotes = new Map();

    for (let index = 0; index < poll.options.length; index += 1) {
      const reaction = message.reactions.resolve(EMOJIS[index]);
      if (!reaction) continue;

      const users = await reaction.users.fetch();
      for (const user of users.values()) {
        if (user.bot || eligibleVotes.has(user.id)) continue;
        try {
          const member = await message.guild.members.fetch(user.id);
          if (member.roles.cache.has(poll.roleId)) eligibleVotes.set(user.id, index);
        } catch {
          // Sunucudan ayrılmış kullanıcıların oyları sayılmaz.
        }
      }
    }

    const counts = poll.options.map(() => 0);
    for (const optionIndex of eligibleVotes.values()) counts[optionIndex] += 1;

    const embed = EmbedBuilder.from(message.embeds[0])
      .setColor(0x57f287)
      .setTitle(`📊 ${poll.question}`)
      .setDescription(makeResultDescription(poll.options, counts, poll.roleId))
      .setFooter({ text: 'Anket sona erdi' });

    await message.edit({ embeds: [embed] });
    await message.reactions.removeAll().catch(() => null);
  } catch (error) {
    console.error(`Anket sonlandırılamadı (${messageId}):`, error);
  } finally {
    polls = polls.filter((item) => item.messageId !== messageId);
    persistPolls();
  }
}

function schedulePoll(poll) {
  const remaining = poll.endsAt - Date.now();
  if (remaining <= 0) {
    void endPoll(poll.messageId);
    return;
  }

  // setTimeout üst sınırını aşan anketleri parça parça yeniden planla.
  const delay = Math.min(remaining, 2_147_000_000);
  timers.set(poll.messageId, setTimeout(() => schedulePoll(poll), delay));
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`${readyClient.user.tag} olarak giriş yapıldı.`);
  for (const poll of [...polls]) schedulePoll(poll);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() || interaction.commandName !== 'anket') return;

  await interaction.deferReply({ ephemeral: true });

  const role = interaction.options.getRole('rol', true);
  if (role.id === interaction.guild.id || role.managed) {
    await interaction.editReply('`@everyone` veya entegrasyon tarafından yönetilen roller kullanılamaz.');
    return;
  }

  const question = interaction.options.getString('soru', true);
  const options = [1, 2, 3, 4, 5]
    .map((number) => interaction.options.getString(`secenek_${number}`))
    .filter(Boolean);
  const durationMinutes = interaction.options.getInteger('sure') ?? 60;
  const endsAt = Date.now() + durationMinutes * 60_000;

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle(`📊 ${question}`)
    .setDescription(makePollDescription(options, role.id, endsAt))
    .setFooter({ text: `Anketi açan: ${interaction.user.tag}` })
    .setTimestamp();

  try {
    const message = await interaction.channel.send({ embeds: [embed] });
    for (let index = 0; index < options.length; index += 1) await message.react(EMOJIS[index]);

    const poll = {
      messageId: message.id,
      channelId: message.channel.id,
      guildId: interaction.guild.id,
      roleId: role.id,
      question,
      options,
      endsAt,
    };
    polls.push(poll);
    persistPolls();
    schedulePoll(poll);
    await interaction.editReply(`Anket oluşturuldu: ${message.url}`);
  } catch (error) {
    console.error('Anket oluşturulamadı:', error);
    await interaction.editReply('Anket oluşturulamadı. Botun mesaj gönderme ve reaksiyon ekleme izinlerini kontrol edin.');
  }
});

client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (user.bot) return;

  try {
    await hydrateReaction(reaction);
    const poll = polls.find((item) => item.messageId === reaction.message.id);
    if (!poll) return;

    const emoji = getEmojiKey(reaction);
    const allowedEmojis = EMOJIS.slice(0, poll.options.length);
    if (!allowedEmojis.includes(emoji)) {
      await removeUserReaction(reaction, user.id);
      return;
    }

    const member = await reaction.message.guild.members.fetch(user.id);
    if (!member.roles.cache.has(poll.roleId)) {
      await removeUserReaction(reaction, user.id);
      try {
        await user.send(`**${reaction.message.guild.name}** sunucusundaki ankette oy kullanmak için gerekli role sahip değilsin.`);
      } catch {
        // Kullanıcının özel mesajları kapalı olabilir.
      }
      return;
    }

    for (const otherReaction of reaction.message.reactions.cache.values()) {
      if (getEmojiKey(otherReaction) !== emoji && allowedEmojis.includes(getEmojiKey(otherReaction))) {
        await removeUserReaction(otherReaction, user.id);
      }
    }
  } catch (error) {
    console.error('Reaksiyon işlenemedi:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);
