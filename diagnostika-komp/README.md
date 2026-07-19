# Diagnostika Sayti — Foydalanuvchi Qo'llanmasi

Rus tili o'qituvchilarining raqamli kompetentligini o'lchash uchun mo'ljallangan tadqiqot platformasi.  
4 ta universitet, 3–4-kurs va magistratura talabalari (To'lqin 1 va To'lqin 2).

---

## Tezkor havola

| Sahifa | URL |
|--------|-----|
| Anketa (To'lqin 1) | `/anketa` |
| Anketa (To'lqin 2) | `/anketa?wave=2` |
| Admin panel | `/admin` |
| Admin kirish | `/admin/login` |

---

## Admin panelga kirish

1. `/admin/login` ga o'ting
2. Parol: Vercel muhit o'zgaruvchisida `ADMIN_PASSWORD` qiymati
3. Kirganingizdan so'ng barcha admin sahifalari ochiladi

> **Eslatma:** Admin parolini hech kimga bermang. Parolni o'zgartirish uchun Vercel → Settings → Environment Variables → `ADMIN_PASSWORD`.

---

## Asosiy funksiyalar

### 1. Dashboard — `/admin`

Sahifani ochganingizda ko'rasiz:
- Jami respondentlar soni (To'lqin 1 / To'lqin 2)
- Baholangan / Baholanmagan soni
- O'rtacha ball
- Universitetlar bo'yicha jadval
- So'nggi 6 ta respondent

### 2. Respondentlar ro'yxati — `/admin/respondents`

**Filtrlar:**
- To'lqin bo'yicha (1 yoki 2)
- Kurs bo'yicha (3-kurs, 4-kurs, magistratura)
- Vuz bo'yicha (qidirish)
- Faqat baholanmaganlar

**Saralash:** istalgan ustun sarlavhasiga bosing (↑↓)

**Eksport tugmalari (yuqori o'ng):**
- `Baholash varaqasi` — Part B va C uchun Excel (2 ekspert ustuni bilan)
- `Excel` — barcha ma'lumotlar
- `CSV` — barcha ma'lumotlar

### 3. Respondentni baholash — `/admin/respondents/[id]`

1. Ro'yxatdan respondentga bosing
2. Sahifada Part B (keys tahlili) va Part C (amaliy topshiriq) javoblarini ko'ring
3. **"Baho qo'yish"** bo'limida:
   - **Part B bali** — 0 dan 30 gacha
   - **Part C bali** — 0 dan 50 gacha
4. **"Saqlash"** tugmasini bosing
5. Umumiy ball avtomatik hisoblanadi: `A + B + C = Jami (max 100)`

**Darajalar:**
- **Yuqori:** 80–100 ball
- **O'rta:** 50–79 ball
- **Past:** 0–49 ball

**← / →** tugmalari bilan oldingi/keyingi respondentga o'tish mumkin.

### 4. Statistika — `/admin/stats`

Dissertatsiya uchun barcha statistik ko'rsatkichlar:
- Tavsifiy statistika (N, Min, Max, M, SD, Median) — Part A/B/C/Jami
- Cronbach's alpha (Likert shkala ishonchliligi)
- Pearson korrelyatsiyasi (o'z-o'zini baholash vs test natijasi)
- Darajalar taqsimoti
- Universitetlar solishtirmasi
- Kurslar solishtirmasi
- Likert o'rtachalari
- Blok III (vositalar chastotasi)

**Excel tugmasi** — barcha statistikani 8 varaqli Excel faylga yuklab olish (dissertatsiya jadvallari uchun tayyor).

### 5. Diagrammalar — `/admin/charts`

Vizual ko'rsatkichlar:
1. **Part A o'rtachasi** — universitetlar kesimida
2. **Likert savollari** — 6 ta savolning o'rtachasi (rangli)
3. **Universitetlar bo'yicha jami ball** — baholangandan keyin
4. **Darajalar taqsimoti** — universitetlar kesimida
5. **Korrelyatsiya** — Likert vs test natijasi
6. **Qismlar bo'yicha ball** — A/B/C universitetlar kesimida
7. **Kurslar bo'yicha ball**

> To'lqin filtri — yuqori o'ngda. 1 yoki 2 tanlang.

### 6. To'lqin tahlili — `/admin/compare`

To'lqin 1 va To'lqin 2 natijalarini solishtirishga mo'ljallangan:
- Jami / O'rtacha / Darajalar — diff ustuni bilan
- Likert savollari solishtirmasi
- Part A savollar qiyinligi solishtirmasi

### 7. Ochiq javoblar — `/admin/open-answers`

Part C (ochiq savol) javoblarini ko'rish:
- So'z soni
- Filtrlar: to'lqin, kurs, vuz, bo'sh javoblarni ko'rsatish/yashirish
- Har bir javobdan respondentga o'tish mumkin

---

## Respondentlar uchun havola

| To'lqin | Havola |
|---------|--------|
| To'lqin 1 | `https://SIZNING-DOMAIN.vercel.app/anketa` |
| To'lqin 2 | `https://SIZNING-DOMAIN.vercel.app/anketa?wave=2` |

Havolalarni `/admin/respondents` sahifasida ham ko'rish mumkin (ko'k qutichada).

---

## Baholash jarayoni (tavsiya etilgan tartib)

```
1. Respondentlar /anketa ni to'ldirishadi → /test ga o'tishadi
2. /test da Part A (15 savol) va Part B/C topshiriladi
3. Admin /admin/respondents?unscored=1 ga o'tadi
4. Har bir baholanmagan respondentni ochib Part B va C balini qo'yadi
5. /admin/charts va /admin/stats da natijalar ko'rinadi
```

---

## Excel eksport turlari

| Eksport | Qayerdan | Mazmun |
|---------|----------|--------|
| Barcha ma'lumotlar | `/admin/respondents` → Excel | Hamma ustunlar |
| Baholash varaqasi | `/admin/respondents` → Baholash varaqasi | B/C javoblari + 2 ekspert ustuni |
| Statistika | `/admin/stats` → Excel | 8 varaq, dissertatsiya uchun |
| CSV | `/admin/respondents` → CSV | Sodda format |

---

## Texnik sozlash (bir martalik)

### Vercel muhit o'zgaruvchilari

Vercel → Settings → Environment Variables da quyidagilar bo'lishi kerak:

| O'zgaruvchi | Tavsif |
|------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase loyiha URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public kalit |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role kalit (baholash uchun) |
| `ADMIN_PASSWORD` | Admin panelga kirish paroli |
| `NEXT_PUBLIC_SITE_URL` | Sayt URL (masalan: `https://diagnostika.vercel.app`) |

### Supabase SQL migratsiyalari

Birinchi marta o'rnatishda yoki yangilashda Supabase → SQL Editor da ishga tushiring:

**1-migratsiya (asosiy):** `docs/migration_respondents.sql`

**2-migratsiya (muhim — yangi ustunlar va SELECT policy):** `docs/migration_v2_fix.sql`

> Ikkisini ham ishga tushiring. `IF NOT EXISTS` ishlatilgan — mavjud ma'lumotlarga zarar yetmaydi.

---

## Tez-tez uchraydigan muammolar

| Muammo | Sabab | Yechim |
|--------|-------|--------|
| Diagrammalar bo'sh | SELECT policy yo'q | `migration_v2_fix.sql` ni ishga tushiring |
| Baholash saqlanmaydi | `SUPABASE_SERVICE_ROLE_KEY` yo'q | Vercel da qo'shing → Redeploy |
| Admin login ishlamaydi | `ADMIN_PASSWORD` yo'q | Vercel da qo'shing → Redeploy |
| Statistika bo'sh | Hali hech kim baholanmagan | Avval respondentlarni baholang |

---

## Loyiha tarkibi (texniklar uchun)

```
src/
├── app/
│   ├── anketa/           # Respondent uchun anketa formasi
│   ├── test/             # Part A/B/C test sahifasi
│   ├── admin/            # Admin panel (barcha boshqaruv)
│   │   ├── page.tsx      # Dashboard
│   │   ├── respondents/  # Ro'yxat, detail, export
│   │   ├── charts/       # Diagrammalar
│   │   ├── stats/        # Statistika
│   │   ├── compare/      # To'lqin tahlili
│   │   └── open-answers/ # Ochiq javoblar
│   └── actions/          # Server actions (scoring, test submit)
├── components/
│   ├── anketa/           # Anketa komponentlari
│   └── admin/            # Admin UI komponentlari
├── types/                # Ma'lumot turlari
└── middleware.ts         # Admin autentifikatsiya
docs/
├── migration_respondents.sql   # 1-migratsiya
└── migration_v2_fix.sql        # 2-migratsiya (muhim)
```

---

*Texnik yordam uchun: GitHub Issues yoki loyiha muallifi bilan bog'laning.*
