# Lightweight

Lightweight, kuvvet antrenmanı (strength training) yapan kullanıcılar için
geliştirilmiş bir mobil analitik uygulamasıdır. Kullanıcılar antrenmanlarını
loglar; uygulama bu geçmişi ilerleme (progression) analitiklerine, kişisel
rekorlara (PR) ve kuvvet eğrilerine dönüştürür.

## Ne işe yarar?

- **Antrenman takibi:** Set, tekrar ve ağırlık bazında antrenman loglama.
  Aktif antrenman her set girişinde otomatik olarak kaydedilir, ayrı bir
  "kaydet" butonuna gerek yoktur.
- **İlerleme analitiği:** Geçmiş antrenman verisinden hesaplanan tahmini 1RM
  (Epley formülü), kuvvet eğrileri ve zaman içindeki ilerleme grafikleri.
- **Kişisel rekorlar (PR):** Egzersiz bazında en iyi performansların otomatik
  tespiti ve gösterimi.
- **Rutinler:** Kullanıcının kendi antrenman rutinlerini oluşturup
  düzenleyebilmesi (yalnızca cihazda saklanır, buluta senkronize edilmez).
- **Geçmiş (History):** Tamamlanmış antrenman oturumlarının listesi ve
  detayları; tamamlanmış oturumlar değiştirilemez, silme işlemi diğer
  cihazlara "tombstone" kaydıyla yayılır.
- **Profil ve senkronizasyon:** E-posta/şifre, Google ve Apple ile giriş;
  kullanıcı verileri cihazda öncelikli (local-first) tutulur ve Firestore'a
  arka planda senkronize edilir. Çevrimdışı yapılan işlemler bir kuyruğa
  alınıp bağlantı geldiğinde gönderilir.

## Nasıl çalışır? (Mimari özet)

- **React Native (Expo)** ile geliştirilmiş, yönetilen (managed) bir mobil
  uygulama.
- **Zustand + MMKV:** Tüm state yönetimi Zustand ile yapılır, kullanıcıya ait
  veriler cihazda MMKV ile hızlı bir şekilde saklanır; Firestore yalnızca
  senkronize edilen bir yansımadır (mirror).
- **Firebase Auth + Firestore:** Kimlik doğrulama ve bulut senkronizasyonu
  için kullanılır.
- **Katmanlı mimari:** Saf iş kuralları (`domain`), özellik bazlı klasörler
  (`features`), paylaşılan UI bileşenleri (`components`), platforma özel
  altyapı (`infrastructure`) ve tasarım token'ları (`theme`) net bir şekilde
  ayrılmıştır. Bağımlılıklar yalnızca yukarıdan aşağıya akar.
- **Elle inşa edilmiş tasarım sistemi:** Üçüncü parti UI kütüphaneleri
  kullanılmaz; tüm arayüz, sıkı bir tasarım sistemine (renkler, spacing,
  tipografi token'ları) bağlı kalınarak sıfırdan inşa edilir.

## Teknoloji yığını

- Expo (managed workflow) + TypeScript (strict mode)
- Zustand (state) + react-native-mmkv (yerel depolama)
- Firebase Auth + Firestore (kimlik doğrulama ve senkronizasyon)
- React Navigation (native-stack + bottom-tabs)
- react-native-svg (özel ikonlar)

## Geliştirme

```bash
npm install
npm start          # Expo dev server
npm run ios        # iOS'ta çalıştır
npm run android    # Android'de çalıştır

npm test           # Testler
npm run typecheck  # TypeScript kontrolü
npm run lint       # Lint kontrolü
```

> Uygulama henüz yayınlanmadı; geliştirme aşamasındadır.

Mimari ve kod kuralları hakkında detaylı bilgi için `AGENTS.md`, tasarım
sistemi detayları için `DESIGN.md` dosyalarına bakınız.
