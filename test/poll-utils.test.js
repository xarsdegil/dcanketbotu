const test = require('node:test');
const assert = require('node:assert/strict');
const { makePollDescription, makeResultDescription } = require('../src/poll-utils');

test('anket açıklamasında seçenekler, rol ve bitiş zamanı bulunur', () => {
  const description = makePollDescription(['Evet', 'Hayır'], '123', 1_700_000_000_000);
  assert.match(description, /1️⃣  Evet/);
  assert.match(description, /2️⃣  Hayır/);
  assert.match(description, /<@&123>/);
  assert.match(description, /<t:1700000000:R>/);
});

test('sonuç yüzdelerini ve toplamı hesaplar', () => {
  const description = makeResultDescription(['A', 'B'], [3, 1], '456');
  assert.match(description, /3 oy \(%75\)/);
  assert.match(description, /1 oy \(%25\)/);
  assert.match(description, /Toplam geçerli oy:\*\* 4/);
});

test('oy yokken yüzde sıfırdır', () => {
  const description = makeResultDescription(['A', 'B'], [0, 0], '456');
  assert.equal((description.match(/%0/g) || []).length, 2);
});
