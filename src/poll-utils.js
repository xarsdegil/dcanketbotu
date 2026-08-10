const EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];

function getEmojiKey(reaction) {
  return reaction.emoji.id || reaction.emoji.name;
}

function makePollDescription(options, roleId, endsAt) {
  const choices = options.map((option, index) => `${EMOJIS[index]}  ${option}`).join('\n\n');
  return `${choices}\n\n**Oy verebilen rol:** <@&${roleId}>\n**Bitiş:** <t:${Math.floor(endsAt / 1000)}:R>\n\nYalnızca bir seçeneğe oy verebilirsin.`;
}

function makeResultDescription(options, counts, roleId) {
  const total = counts.reduce((sum, count) => sum + count, 0);
  const rows = options.map((option, index) => {
    const percent = total === 0 ? 0 : Math.round((counts[index] / total) * 100);
    return `${EMOJIS[index]}  **${option}** — ${counts[index]} oy (%${percent})`;
  });
  return `${rows.join('\n\n')}\n\n**Oy verebilen rol:** <@&${roleId}>\n**Toplam geçerli oy:** ${total}`;
}

module.exports = { EMOJIS, getEmojiKey, makePollDescription, makeResultDescription };
