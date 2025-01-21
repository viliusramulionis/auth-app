import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import users from '../model/users.js';
import bcrypt from 'bcrypt';

const router = Router();

// Visų vartotojų sąrašas (su integruotu rūšiavimu)
router.get('/users', auth, async (req, res) => {
    try {
        const sortData = {}

        if(req.query.sort)
            sortData.firstName = req.query.sort === 'asc' ? 'asc' : 'desc'; 

        res.json(await users.find().sort(sortData));
    } catch {
        res.status(500).json('Įvyko serverio klaida');
    }
});

// Vartotojų rūšiavimas (Sorting)
// Ascending - Didėjančia tvarka
// Descending - Mažėjančia tvarka

router.get('/users/:sort', auth, async (req, res) => {
    // Duomenų validacija
    const type = req.params.sort === 'desc' ? 'desc' : 'asc';

    try {
        res.json(await users.find().sort({ firstName: type }));
    } catch(e) {
        res.status(500).json('Įvyko serverio klaida');
    }
});

router.post('/login', async (req, res) => {
    if(!req.body.email || !req.body.password)
        return res.status(500).json('Negauti prisijungimo duomenys');

    const data = await users.findOne({ email: req.body.email });

    if(!data) 
        return res.status(401).json('Neteisingi prisijungimo duomenys');
    
    if(!await bcrypt.compare(req.body.password, data.password)) 
        return res.status(401).json('Neteisingi prisijungimo duomenys');
    
    req.session.user = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
    };

    res.json(req.session.user);
});

router.post('/register', async (req, res) => {
    try {
        req.body.password = await bcrypt.hash(req.body.password, 10);
        await users.create(req.body);

        res.json('Vartotojas sėkmingai užregistruotas');
    } catch(e) {
        console.log(e);
        res.status(500).json('Įvyko serverio klaida');
    }
});

router.get('/check-auth', auth, (req, res) => {
    res.json(req.session.user);
});

router.get('/logout', auth, (req, res) => {
    // Sesijos duomenų ištrynimas
    req.session.destroy();

    res.json("Sėkmingai atsijungėte");
});

export default router;