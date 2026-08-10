# Discord Rol Bazlı Reaksiyon Anket Botu

Belirlenen Discord rolüne sahip üyelerin emoji reaksiyonlarıyla oy verebildiği anket botu. Kullanıcı başına tek oy kabul eder, yetkisiz reaksiyonları kaldırır ve süre bitince sonuçları aynı mesajda gösterir.

## Kurulum

1. [Discord Developer Portal](https://discord.com/developers/applications) üzerinden bir uygulama ve bot oluşturun.
2. Bot ayarlarında **Server Members Intent** seçeneğini etkinleştirin.
3. Botu sunucuya `bot` ve `applications.commands` kapsamlarıyla ekleyin. Şu izinleri verin:
   - View Channels
   - Send Messages
   - Embed Links
   - Read Message History
   - Add Reactions
   - Manage Messages
4. Bağımlılıkları kurun:

   ```powershell
   npm install
   ```

5. `.env.example` dosyasını `.env` adıyla kopyalayıp değerleri doldurun:

   ```powershell
   Copy-Item .env.example .env
   ```

6. Slash komutunu sunucuya yükleyin ve botu başlatın:

   ```powershell
   npm run deploy
   npm start
   ```

## Kullanım

`/anket` komutunu çalıştırıp soruyu, oy kullanabilecek rolü, 2-5 seçeneği ve süreyi girin. Komutu yalnızca **Sunucuyu Yönet** iznine sahip üyeler görebilir.

Örnek:

```text
/anket soru:Etkinlik hangi gün olsun? rol:@Oyuncu secenek_1:Cuma secenek_2:Cumartesi sure:120
```

Bot yeniden başlarsa devam eden anketler `data/polls.json` üzerinden yeniden zamanlanır. Sonuç aşamasında üyelik ve rol uygunluğu tekrar kontrol edilir.
