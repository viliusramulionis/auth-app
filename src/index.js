import path from 'node:path';
import express from 'express';
import mongoose from 'mongoose';
import users from './controller/users.js';
import session from 'express-session';

const app = express();

try {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('Prisijungimas sėkmingas');
} catch(e) {
  console.log('Nepavyko prisijungti', e);
}
// Nurodymas, jog priimsi slapuko duomenis per proxy
app.set('trust proxy', 1) 
// Sesijos konfiguracija:
app.use(session({
  secret: process.env.SESSION_KEYWORD, // Slapta unikali frazė
  resave: false, // Leidžiame slapuko perrašymą
  saveUninitialized: true, // Išduodame sausainėlį nepriskyrus jokių reikšmių
  cookie: { secure: false } // Secure nurodo ar kreipsimės per HTTPS protokolą
}));

// Development phase - Kuomet gaminame aplikaciją
// Production phase - Kuomet aplikacija yra talpinama viešai

app.use(express.json());

app.use('/api', users);

// Assets direktorijos priėjimo nustatymas
app.use('/assets', express.static('./src/view/assets'));

// Visu elementu priejimas is views direktorijos
// app.use(express.static('./src/view'));

// React Build'o prijungimas:
app.get('/', (req, res) => {
  // sendFile metodas skirtas išsiųsti pasirinktą failą iš serverio vartotojui
  // path.resolve metodas kuris konvertuoja relityvu kelia i absoliutu
  res.sendFile(path.resolve('./src/view/index.html'));
});

// http - 80 portas
// https - 443 portas

app.listen(process.env.PORT);

// MVC :
// Model
// View
// Controller

// Web Hostingas (Shared Hosting) - Apribotos galimybės ką galima atlikti. Dažnai nebus galimybės turėti instaliuotą NodeJS
// VPS (Virtual Private Server) - Turite visas galimybes valdyti visą sistemą, bet kada viską ištrinti. Operacinės sistemos pasirinkimas. Serverio Valdymas per terminalą
// Dedikuotas serveris - Fiziškai Jums dedikuota mašina kurią galite pilnai valdyti

