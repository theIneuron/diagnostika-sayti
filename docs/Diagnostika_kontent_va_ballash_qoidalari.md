# Diagnostika sayti — Kontent va ballash qoidalari
*(implementatsiyadan mustaqil — Jotform'ga ham, Next.js'ga ham bir xil tatbiq etiladi)*

Manba: `Sultonova_TZ_Sayt_Diagnostika` + dissertatsiya qo'lyozmasining **ПРИЛОЖЕНИЕ 1** bo'limi.

---

## 1. АНКЕТА (Инструмент 1)

**Блок I. Общие сведения** — 3 maydon:
- Вуз — dropdown, 4 variant: `Узбекский государственный университет мировых языков (УзГУМЯ)`, `Ташкентский государственный педагогический университет имени Низами (ТГПУ им. Низами)`, `Чирчикский государственный педагогический университет`, `Нукусский государственный педагогический институт`
- Курс — dropdown: `3 курс`, `4 курс`, `магистратура`
- Направление подготовки — matn
- (+ ixtiyoriy: Email/Telegram)
- (+ majburiy checkbox): «Я согласен на обработку данных в обезличенном виде для научных целей»

**Блок II. Самооценка** — Likert 1–5 matritsa, 6 utterance:
1. Я умею размещать материалы в LMS (Moodle/Google Classroom)
2. Я умею создавать тесты в LMS
3. Я умею создавать интерактивные задания (Kahoot, Quizlet, Wordwall)
4. Я умею пользоваться ChatGPT/другими ИИ для учебных задач
5. Я умею оценивать письменные работы с помощью цифровых инструментов
6. Я могу самостоятельно спроектировать цифровой урок «с нуля»

**Блок III. Частота использования** — 3×4 matritsa (`Каждый день`/`Несколько раз в неделю`/`Редко`/`Никогда`): LMS, Интерактивные платформы, ИИ-инструменты.

**Блок IV. Затруднения** — checkbox (bir nechtasi tanlanadi):
`Создание собственных интерактивных заданий`, `Применение ИИ для подготовки уроков`, `Оценивание работ учащихся в цифровой форме`, `Технические проблемы (интернет, устройства)`, `Не хватает практических занятий по этой теме`

**Блок V. Открытый вопрос** — long text, **limit 1000 belgi**:
«Что, на ваш взгляд, помогло бы вам увереннее использовать цифровые технологии в будущей работе учителя?»

---

## 2. ТЕСТ (Инструмент 2)

### Часть А — 20 ball, 15 savol × 1,33 ball, avtomatik

| № | Savol | To'g'ri javob |
|---|---|---|
| 1 | Что такое LMS-платформа? | Система управления обучением |
| 2 | Какая платформа — открытый исходный код? | Moodle |
| 3 | Функция Moodle для взаимного оценивания студентов? | Мастерская (Workshop) |
| 4 | Google Classroom интегрирован с экосистемой: | Google |
| 5 | Формат импорта банка вопросов в Moodle? | GIFT/XML |
| 6 | ИИ означает: | Искусственный интеллект |
| 7 | Генеративная языковая модель: | ChatGPT |
| 8 | «Промпт» — это: | Текстовый запрос пользователя к ИИ |
| 9 | «Галлюцинация» нейросети — это: | Уверенная генерация недостоверной информации |
| 10 | Викторины в реальном времени с рейтингом: | Kahoot |
| 11 | Quizlet специализируется на: | Электронных карточках с адаптивным повторением |
| 12 | Blended learning — это: | Сочетание очных занятий и онлайн-компонента |
| 13 | Основная функция Grammarly AI: | Проверка грамматики и стиля текста |
| 14 | Образовательная аналитика в LMS: | Отслеживание прогресса и активности студентов |
| 15 | Верное утверждение об академической честности при ИИ: | Использование ИИ следует декларировать, сохраняя авторскую ответственность |

Har savolda 4 variant (1 to'g'ri + 3 noto'g'ri); to'liq variant matnlari kerak bo'lsa — oldingi `Bosqich1_Anketa_Test_qurish_qadamlari.md` faylida bor.

**Ball logikasi:** to'g'ri javob = +1,33; noto'g'ri = 0; 15 ta yig'indisi = Часть А ball (0–20). Respondentga ko'rsatilmaydi.

### Часть Б — 30 ball, qo'lda baholanadi

V1 uchun **hammaga Keys №1** (TZ 3.4-tavsiyasi):
> **Кейс 1.** Студент Алишер не выполняет задания в Google Classroom уже вторую неделю. Какие цифровые инструменты вы используете, чтобы это выяснить и помочь ему?

Javob: long text, **limit 500 so'z**. Ball: admin tomonidan 0–30 oralig'ida qo'yiladi.

Zaxira keyslar (keyingi to'lqin uchun, tasodifiy tanlov bankida):
- **Кейс 2.** ChatGPT bilan to'liq yozilgan insho — pedagogik harakatlar?
- **Кейс 3.** «Падежные окончания» mavzusi — Kahoot/Quizlet/Wordwall'dan birini tanlab asoslang.
- **Кейс 4.** Internet uzilishi tufayli tengsizlikni oldini olish.
- **Кейс 5.** DeepL Write orqali «yaxshilangan», lekin uslubni yo'qotgan insho — fikr-mulohaza qanday bo'ladi?

**Baholash mezoni:** obyektivlik/asoslanganlik, metodik savodxonlik, o'quvchining individual xususiyatlarini hisobga olish.

### Часть В — 50 ball, qo'lda baholanadi

Respondent: fayl (≤10 MB) yoki havola + izoh (long text, **limit 300 so'z**). Ball: admin 0–50.

**Admin uchun baholash namunalari** (respondentga ko'rsatilmaydi):
- *Намуна 1 (Moodle test):* «Падежные окончания» — 5 ta tanlov savoli + 1 bo'sh joy to'ldirish, 2 urinish, darhol fikr-mulohaza.
- *Намуна 2 (Quizlet kartochka):* «Профессии» — 10 ta «so'z–tarjima–misol» kartasi.
- *Намуна 3 (ChatGPT topshiriq):* promptни + ИИ javobini + talabaning qaysi qismni qabul qilgani/o'zgartirgani haqidagi izohini taqdim etish.

---

## 3. Yakuniy ball va daraja

```
Итог = Часть А + Часть Б + Часть В   (0–100, ikkinchisi va uchinchisi qo'lda kiritilgandan keyin hisoblanadi)

Даража:
  80–100 → Высокий
  50–79  → Средний
  0–49   → Низкий
```

Ball/daraja respondentga **hech qachon ko'rsatilmaydi** (raqobat effektini oldini olish uchun, TZ 3.1).

---

## 4. Norma-funksional talablar (qisqacha, TZ 4-bo'lim)

- Bir vaqtda **50 ta** respondent, to'lqin uchun **≤300** ta jami.
- Interfeys tili: **kamida rus** (o'zbek — keyinroq, ixtiyoriy).
- **Mobil-moslashuvchan** dizayn (ko'pchilik telefondan to'ldiradi).
- **HTTPS** majburiy.
- Ma'lumotlarni shaxsiy aloqa (email/Telegram) va javoblardan **alohida** saqlash, faqat admin kira oladi.
- Kunlik avtomatik backup.
- Har javob darhol saqlanishi kerak (to'liq topshirishni kutmasdan).

## 5. Admin funksiyalari (qisqacha, TZ 3-bo'lim)

- Vuz/kurs/to'lqin bo'yicha filtr.
- Б va В qismlarga qo'lda ball qo'yish, saqlagandan keyin avtomatik qayta hisoblash.
- Excel/CSV export (barcha maydonlar, bitta qatorda har respondent).
- Dashboard: % daraja bo'yicha, Blok II har utterance o'rtacha ball, Blok IV % qiyinchilik bo'yicha.
- Vuzlar ro'yxatini va savollar bankini dasturchisiz tahrirlash.
- To'lqinlarni boshqarish (yangi to'lqin = yangi sanalar, eski ma'lumot yo'qolmaydi).
- 100/285 javob to'planganda admin'ga email.
