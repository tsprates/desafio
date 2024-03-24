import cors from 'cors';
import express from 'express';
import * as fs from 'fs';
import multer from 'multer';
import * as utils from './utils.js';

const app = express();
const port = 8000;
const upload = multer({ dest: 'uploads/' });
const database = './database.txt';

app.use(cors());

app.get('/', (req, res) => {
    res.json({ message: 'success' })
});

app.post('/upload', upload.single('file'), async (req, res) => {
    const { path, destination, originalname, mimetype } = req.file;
    const filePath = `${destination}/${originalname}`

    fs.rename(path, filePath, (err) => {
        if (err) throw err;
    });

    let data = null;
    if (mimetype === 'text/csv') {
        data = await utils.csvToJson(filePath);
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        data = await utils.xlsxToJson(filePath);
    }

    if (data === null) {
        return res.status(400).json({ message: 'filetype not supported' });
    }

    fs.writeFile(database, JSON.stringify(data), (err) => {
        if (err) throw err;
        res.json({ message: 'successfully uploaded' });
    });
});

const getGroupedData = async () => {
    try {
        if (!fs.existsSync(database)) {
            throw new Error('database not found');
        }
        const data = fs.readFileSync(database);
        return utils.groupData(JSON.parse(data.toString()));
    } catch (error) {
        throw new Error(`Error: ${error.message}`);
    }
};

app.get('/churn-rate', async (req, res) => {
    try {
        const groupedData = await getGroupedData();
        const response = Object.keys(groupedData).reduce((acc, key) => {
            acc[key] = +((groupedData[key].cancelados / groupedData[key].ativos) * 100.0).toFixed(2);
            return acc;
        }, {});
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/monthly-recurring-revenue', async (req, res) => {
    try {
        const groupedData = await getGroupedData();
        const response = Object.keys(groupedData).reduce((acc, key) => {
            acc[key] = +groupedData[key].valor_acumulado.toFixed(2);
            return acc;
        }, {});
        res.json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.listen(port, () => console.log(`Running on port ${port}`));