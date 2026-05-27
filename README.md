# Neon Shadows - Istruzioni di Deploy su GitHub Pages

Questo repository è configurato per compilare ed servire l'applicazione investigativa cyber-noir **Neon Shadows** su GitHub Pages sotto l'URL `/new-neon/`.

## Come effettuare il Deploy locale su GitHub Pages

Segui questa sequenza ordinata di comandi nella tua console locale per generare i file pronti e inviarli al tuo server di hosting:

1. **Installa tutte le dipendenze di progetto**:
   ```bash
   npm install
   ```

2. **Compila il sito web statico** (genera la cartella `dist/` pronta all'uso):
   ```bash
   npm run build
   ```

3. **Aggiungi la cartella `dist/` al tracciamento di Git**:
   ```bash
   git add dist/
   ```

4. **Esegui il commit dei file compilati**:
   ```bash
   git commit -m "Build for deployment"
   ```

5. **Invia i file al tuo repository GitHub**:
   ```bash
   git push
   ```

---

*Configurazione tecnica applicata:*
- **Base URL** impostato a `/new-neon/` nel file `vite.config.ts`.
- **Script di deploy** `"deploy": "npm run build"` aggiunto nel `package.json`.
- **Abilitazione di commit** della directory `dist/` sbloccante nel file `.gitignore`.
