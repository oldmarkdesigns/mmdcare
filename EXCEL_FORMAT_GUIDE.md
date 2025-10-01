# Excel File Format Guide för Hjärtdata

Denna guide beskriver hur Excel-filer bör struktureras för att systemet ska kunna extrahera hjärtdata automatiskt.

## Filformat som stöds

- `.xlsx` (Excel 2007+)
- `.xls` (äldre Excel-format)

## Datapunkter som systemet identifierar

Systemet letar efter följande hjärtrelaterade mätvärden:

### 1. Hjärtfrekvens (Heart Rate)
- **Nyckelord:** `hjärtfrekvens`, `heart rate`, `puls`, `pulse`, `hr`
- **Värde:** 0-300 bpm
- **Exempel:**
  ```
  Hjärtfrekvens | 72
  ```

### 2. Systoliskt blodtryck (Systolic Blood Pressure)
- **Nyckelord:** `systolisk`, `systolic`, `sys`
- **Värde:** 0-300 mmHg
- **Exempel:**
  ```
  Systoliskt | 120
  ```

### 3. Diastoliskt blodtryck (Diastolic Blood Pressure)
- **Nyckelord:** `diastolisk`, `diastolic`, `dia`
- **Värde:** 0-200 mmHg
- **Exempel:**
  ```
  Diastoliskt | 80
  ```

### 4. Kolesterol (LDL)
- **Nyckelord:** `kolesterol`, `cholesterol`, `ldl`
- **Värde:** 0-20 mmol/L
- **Exempel:**
  ```
  Kolesterol LDL | 2.8
  ```

## Excel-filstruktur

### Enkel struktur (rekommenderas)

```
| Mätning          | Värde |
|------------------|-------|
| Hjärtfrekvens    | 72    |
| Systoliskt       | 120   |
| Diastoliskt      | 80    |
| Kolesterol LDL   | 2.8   |
```

### Tidsseriedata (för grafer)

För att visa data över tid, använd följande struktur:

```
| Tid   | Hjärtfrekvens |
|-------|---------------|
| 00:00 | 65            |
| 04:00 | 72            |
| 08:00 | 78            |
| 12:00 | 85            |
| 16:00 | 82            |
| 20:00 | 70            |
```

### Komplett exempel

En Excel-fil kan innehålla båda typer av data:

**Ark 1: Aktuella värden**
```
| Mätning          | Värde | Enhet   |
|------------------|-------|---------|
| Hjärtfrekvens    | 72    | bpm     |
| Systoliskt       | 120   | mmHg    |
| Diastoliskt      | 80    | mmHg    |
| Kolesterol LDL   | 2.8   | mmol/L  |
```

**Ark 2: Hjärtfrekvens över tid**
```
| Tid   | Värde |
|-------|-------|
| 00:00 | 65    |
| 04:00 | 72    |
| 08:00 | 78    |
| 12:00 | 85    |
| 16:00 | 82    |
| 20:00 | 70    |
```

## Fallback-beteende

Om systemet inte kan hitta specifika värden i Excel-filen:
- Värdekortet visar: `-`
- Enheten ersätts med: `Ingen data finns`
- Grafer använder mock-data som fallback

## Testfil

En exempel Excel-fil finns i projektet: `public/Assets/Provsvar.xlsx`

Du kan använda denna som mall för att skapa dina egna hälsodatafiler.

## Uppladdning

1. Öppna MMDCare plattformen
2. Scanna QR-koden med din mobil
3. Välj din Excel-fil (.xlsx eller .xls)
4. Ladda upp filen
5. Navigera till Hjärta-sidan för att se dina data

## Felsökning

**Problem:** Data visas inte på Hjärta-sidan
- **Lösning:** Kontrollera att kolumnnamnen innehåller de svenska eller engelska nyckelorden listade ovan
- **Lösning:** Se till att värdena är numeriska och inom rimliga gränser

**Problem:** "Ingen data finns" visas för alla värden
- **Lösning:** Kontrollera Excel-filstrukturen mot exemplen ovan
- **Lösning:** Se till att data finns i det första arket i Excel-filen

**Problem:** Excel-filen laddas inte upp
- **Lösning:** Kontrollera att filstorleken är under 100 MB
- **Lösning:** Se till att filen har tillägget .xlsx eller .xls

