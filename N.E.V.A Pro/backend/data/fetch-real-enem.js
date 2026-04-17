const fs = require('fs');
const path = require('path');
const https = require('https');

const dataPath = path.join(__dirname, 'questions-data.json');

const yearsToFetch = [2023, 2022, 2021];
const targetDisciplines = ['ciencias-humanas', 'ciencias-natureza', 'linguagens', 'matematica'];
const TARGET_COUNT = 20;

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(JSON.parse(data));
                    } else {
                        reject(new Error(`Status ${res.statusCode}: ${data}`));
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function rebuildData() {
    console.log('Iniciando fetch da API enem.dev...');
    let finalData = {}; // We will reconstruct questions-data.json

    try {
        // Fetch exams mapping
        console.log('Fetching exams list...');
        const examsList = await fetchJson('https://api.enem.dev/v1/exams');
        
        for (const year of yearsToFetch) {
            finalData[year] = {
                exams: examsList.filter(e => e.year === year),
                questions: []
            };

            console.log(`Fetch questions for ${year}...`);
            let allQuestions = [];
            for (let offset = 0; offset < 200; offset += 50) {
                const url = `https://api.enem.dev/v1/exams/${year}/questions?limit=50&offset=${offset}`;
                try {
                    const response = await fetchJson(url);
                    if (response && response.questions) {
                        allQuestions = allQuestions.concat(response.questions);
                    }
                } catch(e) {
                    console.log('Fim das questoes em offset', offset);
                    break;
                }
            }
            
            if (allQuestions.length > 0) {
                for (const disp of targetDisciplines) {
                    const dispQs = allQuestions.filter(q => q.discipline === disp);
                    // Shuffle the questions so they are random as requested
                    dispQs.sort(() => 0.5 - Math.random());
                    
                    const selected = dispQs.slice(0, TARGET_COUNT);
                    
                    // Add to final data
                    selected.forEach(sq => {
                        finalData[year].questions.push(sq);
                    });
                    
                    console.log(`  - ${disp}: ${selected.length} questões.`);
                }
            }
        }

        fs.writeFileSync(dataPath, JSON.stringify(finalData, null, 2), 'utf8');
        console.log('Sucesso! questions-data.json atualizado com os dados reais.');
        
    } catch (err) {
        console.error('Erro na reconstrução:', err);
    }
}

rebuildData();
