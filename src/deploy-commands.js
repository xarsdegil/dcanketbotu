require('dotenv').config();
const { REST, Routes } = require('discord.js');
const commands = require('./commands');

const required = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`Eksik ortam değişkenleri: ${missing.join(', ')}`);
  process.exit(1);
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    { body: commands },
  );
  console.log('/anket komutu sunucuya yüklendi.');
})().catch((error) => {
  console.error('Komut yüklenemedi:', error);
  process.exitCode = 1;
});
