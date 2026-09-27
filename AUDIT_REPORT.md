# Denetim ve Düzeltme Raporu

**Tarih:** 27 Eylül 2026
**Dal:** `audit-fixes` (`main` @ `b435b5f` üzerinden)
**Kapsam:** `src/` altındaki uygulama kodu (`src/_legacy/` hariç), yapılandırma, gizli dosyalar ve dokümanlar.

Her madde ayrı bir commit. Her commit kendi başına derleniyor ve testlerini geçiyor.

## Özet

| # | Madde | Commit | Testler |
|---|-------|--------|---------|
| 1 | 0 tekrarlı set, bitirilen antrenmanı kaybettiriyordu | `e864f91` | 387 |
| 2 | Hesaplar arası veri sızıntısı | `056dcbf` | 398 |
| 3 | Çevrimdışı kuyruk antrenmanları siliyordu | `e7841a0` | 408 |
| 4 | Firestore kuralları ve gizli dosyalar | `6de12e2` | 408 |
| 5 | Haftalar UTC'ye göre hesaplanıyordu | `885311d` | 415 |
| 6 | Silmeler cihazlar arasında yayılmıyordu | `694e1e7` | 428 |
| 7 | Dokümanlar kodla uyuşmuyordu | `4cb41cb` | 428 |
| 8 | Proje kuralı ihlalleri | `65cad19` | 432 |
| 9 | Kullanılmayan altyapı, eksik araçlar | `9523c1a` | 433 |

Başlangıç: 65 suite, 376 test. Son durum: 69 suite, 433 test; `typecheck` ve `lint` temiz.

---

## 1. 0 tekrarlı set antrenmanı kaybettiriyordu

**Sorun:** Tamamlanmış ama 0 tekrarlı bir set çalışma seti sayılıyordu ve e1RM hesabı bu sette hata fırlatıyordu. `finish()` aktif antrenmanı temizledikten sonra PR hesapladığı için hata, seansın tamamen kaybolmasına yol açıyordu.

**Düzeltme:**
- `isWorkingSet` en az 1 tekrar istiyor.
- Tekrar hücresi yalnızca 1 veya daha büyük tam sayı kabul ediyor; ağırlık 0 olabilir.
- `finish()`, PR hesabı hata verse bile seansı kaydediyor.

**Dosyalar:** `src/domain/rules/e1rm.ts`, `useSetTableDraft.ts`, `useWorkoutActions.ts`

## 2. Hesaplar arası veri sızıntısı

**Sorun:** Çıkış yapıp başka bir hesapla giriş yapınca yeni hesap öncekinin geçmişini, rutinlerini ve yarım antrenmanını görüyor, bunları kendi buluta da yazabiliyordu.

**Düzeltme:**
- Geçmiş, rutinler, aktif antrenman ve tercihler MMKV'de `<anahtar>:<uid>` altında tutuluyor. `userScope.ts` oturum değişince, ekran yeniden çizilmeden önce store'ları o hesaba geçiriyor.
- Çıkışta hiçbir şey silinmiyor, çünkü rutinler ve yarım antrenman yalnızca cihazda duruyor.
- Hesap değiştikten sonra dönen bir bulut okuması yeni hesabın verisine yazılmıyor.

**Dosyalar:** `src/infrastructure/storage/persistScope.ts`, `src/app/providers/userScope.ts`, `useCloudSync.ts`

## 3. Çevrimdışı kuyruk antrenmanları siliyordu

**Sorun:** 5 kez gönderilemeyen kayıt kuyruktan siliniyordu. Başka bir hesaba ait kayıt kuyruğu tıkıyordu. Aynı anda iki flush çalışıp aynı kaydı iki kez gönderebiliyordu.

**Düzeltme:**
- **Silme yerine park etme:** Başarısız kayıt `failed` olarak kuyrukta kalıyor. Arkasındakileri bekletmiyor ama aynı dokümanın sonraki işlemleri onun arkasında bekliyor. Her girişte yeniden deneniyor.
- **Hesap kapsamı:** Kayıtlar sahibinin uid'sini taşıyor ve yalnızca o hesap oturumdayken gönderiliyor.
- **Tek flush:** Aynı anda başlatılan flush'lar tek bir çalışmayı paylaşıyor.

**Dosyalar:** `src/infrastructure/network/offlineQueue.ts`, `src/app/providers/cloudSync.ts`

## 4. Firestore kuralları ve gizli dosyalar

**Sorun:** Repoda Firestore güvenlik kuralı yoktu. `.env` dosyası `.gitignore`'da değildi.

**Düzeltme:**
- **`firestore.rules`:** Varsayılan her şey kapalı. Kullanıcı yalnızca kendi `users/{uid}` dokümanını ve antrenmanlarını okuyup yazabiliyor; her yazma şemaya göre doğrulanıyor.
- **Kural testleri:** `npm run test:rules` emülatöre karşı çalışıyor.
- **`.gitignore`:** `.env` ve `.env.*` artık yok sayılıyor. `.env.example` eklendi.
- **Seed betiği:** Admin anahtarını `GOOGLE_APPLICATION_CREDENTIALS` değişkenindeki yoldan okuyabiliyor.

**Açık:** Kural testleri Java 21 gerektiriyor ve **henüz çalıştırılmadı**. Kurallar Firebase'e **yüklenmedi**.

## 5. Haftalar UTC'ye göre hesaplanıyordu

**Sorun:** Türkiye'de (UTC+3) Pazartesi 00:00–03:00 arasındaki antrenman önceki haftaya düşüyordu. Ayrıca haftalar sabit 7×24 saat eklenerek ilerletiliyordu; yaz saati geçişlerinde bu yanlış sonuç verir.

**Düzeltme:**
- `startOfWeek` yerel gece yarısını döndürüyor.
- Yeni `addWeeks` ve `weeksBetween` fonksiyonları takvim haftalarıyla çalışıyor.
- Testler, UTC dışında olan ve yaz saati uygulayan `America/New_York` saat diliminde çalışıyor.

**Dosyalar:** `src/domain/rules/volume.ts`, `streak.ts`, `sessionSummary.ts`, `progressData.ts`, `exerciseDetail.ts`

## 6. Silmeler cihazlar arasında yayılmıyordu

**Sorun:** Bir cihazda silinen seans diğer cihazlarda kalıyordu. Buluta hiç ulaşmamış seanslar da hiç yüklenmiyordu.

**Düzeltme:**
- Silme, dokümanı antrenman verisi içermeyen bir silinme kaydıyla (`{ id, startedAt, deletedAt }`) değiştiriyor.
- `reconcileSessions`:
  - Silinen seansları iki taraftan da düşürüyor.
  - Yalnızca bulutta olanları ekliyor.
  - Yalnızca cihazda olanları yükleme kuyruğuna alıyor.
- Okuma başarısızsa uzlaştırma yapılmıyor. Kuyruktaki bekleyen silme ve kayıtlar hesaba katılıyor.

**Dosyalar:** `workoutDocument.ts`, `firestoreWorkouts.ts`, `historyMerge.ts`, `useCloudSync.ts`, `firestore.rules`

## 7. Dokümanlar kodla uyuşmuyordu

**Düzeltme:**
- **`AGENTS.md`:**
  - Sürümler düzeltildi: React Navigation 7, Expo SDK 54.
  - Olmayan dizinlere yapılan başvurular kaldırıldı, proje durumu güncellendi.
  - Bozuk kod örnekleri onarıldı.
  - Senkron modeli belgelendi.
- **Feature dokümanları:** Yanlış bileşen adları, dosya yerleri ve oturum bilgileri düzeltildi.
- **`CLAUDE.md`:** Elle yapılmış bir kopyaydı; artık yalnızca `@AGENTS.md` satırını içeriyor.
- **Silinen kullanılmayan kod:** `src/services/firebase/` altında `config.ts` dışındaki dosyalar, `useAuthState.ts`, eski `src/DESIGN.md`.

## 8. Proje kuralı ihlalleri

**Düzeltme:**
- **Importlar:**
  - Feature'lar birbirini yalnızca barrel (`index.ts`) üzerinden import ediyor; 28 derin import düzeltildi.
  - `routines ↔ onboarding` döngüsü kırıldı.
  - Intro bayrakları store'u `src/app`'ten onboarding'e taşındı.
  - `src/__tests__/architecture.test.ts` bu kuralları denetliyor.
- **Spacing ve renk:** Sabit değerler token'a çevrildi (`fineSpacing`, `emptyStatePadding`, `colors.backdrop`); görünüm değişmedi.
- **Ekranlar:** 200 satır JSX sınırını aşan iki ekran bölündü: ProgressScreen ve RoutineEditorScreen.
- **`config.ts`:** `@ts-ignore` yerine açıklamalı `@ts-expect-error` kullanılıyor.

## 9. Kullanılmayan altyapı ve eksik araçlar

**Düzeltme:**
- **TanStack Query:** Hiç sorgu yoktu; paket ve provider kaldırıldı.
- **HTTP katmanı:** API client, kuyruğun HTTP yolu ve token saklama kaldırıldı; `expo-secure-store` ve `date-fns` de gitti.
- **Araçlar:** `npm run typecheck` ve `npm run lint` (`eslint-config-expo`) eklendi.
- **Lint'in bulduğu hata:** Home ekranı senkron, hesap değişimi ve silme sonrasında güncellenmiyordu. `useHomeSummary` artık history store'una abone.

---

## Açık kalanlar

1. **Kural testleri:** Java 21 kurup `npm run test:rules` çalıştırın; yeşil olmadan kuralları yüklemeyin.
2. **Kuralları yükleme:** `npx firebase deploy --only firestore:rules --project lightweight-3bc46`. Yüklenmeden 6. maddedeki silmeler Firestore tarafından reddedilir.
3. **Dev client:** `expo-secure-store` kaldırıldığı için yeni bir dev client build'i gerekiyor.
4. **SDK yamaları:** `npx expo install --check` 5 paketin SDK 54 yama sürümlerinin gerisinde olduğunu söylüyor. Bu durum bu çalışmadan önce de vardı.
5. **Cihaz testi:** Değişiklikler Jest'te doğrulandı, cihazda denenmedi. Önerilen senaryolar:
   - İki hesapla giriş ve çıkış yapmak.
   - Uçak modunda antrenman bitirip bağlantıyı açmak.
   - İki cihazda seans silmek.
6. **Karar bekleyenler:**
   - PR rozeti spec'te 3 saniyede kayboluyor, kodda kalıcı.
   - Progress ve Exercise Detail ekranları kullanıcının hafta başlangıcı tercihini kullanmıyor.
