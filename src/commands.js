const {
  PermissionFlagsBits,
  SlashCommandBuilder,
} = require('discord.js');

const pollCommand = new SlashCommandBuilder()
  .setName('anket')
  .setDescription('Belirli bir rolün oy verebildiği reaksiyonlu anket açar.')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .addStringOption((option) =>
    option
      .setName('soru')
      .setDescription('Anket sorusu')
      .setRequired(true)
      .setMaxLength(200),
  )
  .addRoleOption((option) =>
    option
      .setName('rol')
      .setDescription('Oy kullanmasına izin verilen rol')
      .setRequired(true),
  )
  .addStringOption((option) =>
    option
      .setName('secenek_1')
      .setDescription('Birinci seçenek')
      .setRequired(true)
      .setMaxLength(100),
  )
  .addStringOption((option) =>
    option
      .setName('secenek_2')
      .setDescription('İkinci seçenek')
      .setRequired(true)
      .setMaxLength(100),
  )
  .addStringOption((option) =>
    option.setName('secenek_3').setDescription('Üçüncü seçenek').setMaxLength(100),
  )
  .addStringOption((option) =>
    option.setName('secenek_4').setDescription('Dördüncü seçenek').setMaxLength(100),
  )
  .addStringOption((option) =>
    option.setName('secenek_5').setDescription('Beşinci seçenek').setMaxLength(100),
  )
  .addIntegerOption((option) =>
    option
      .setName('sure')
      .setDescription('Anket süresi (dakika, varsayılan: 60)')
      .setMinValue(1)
      .setMaxValue(10080),
  );

module.exports = [pollCommand.toJSON()];
