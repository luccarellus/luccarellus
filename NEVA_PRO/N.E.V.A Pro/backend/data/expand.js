const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'questions-data.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const data = JSON.parse(rawData);

const disciplines = ['ciencias-humanas', 'ciencias-natureza', 'linguagens', 'matematica'];

for (const year in data) {
  if (data[year].questions) {
    let newQuestions = [];
    let currentQuestions = data[year].questions;
    
    let maxId = Math.max(...currentQuestions.map(q => q.index), 1000);

    for (const disp of disciplines) {
      let dispQuestions = currentQuestions.filter(q => q.discipline === disp);
      let dispLen = dispQuestions.length;
      
      if (dispLen > 0 && dispLen < 20) {
        let needed = 20 - dispLen;
        for (let i = 0; i < needed; i++) {
          let clone = JSON.parse(JSON.stringify(dispQuestions[i % dispLen]));
          maxId++;
          clone.index = maxId;
          clone.context = `[Questão Ampliada ${i+1}] ` + clone.context;
          dispQuestions.push(clone);
        }
      }
      newQuestions = newQuestions.concat(dispQuestions);
    }
    
    data[year].questions = newQuestions;
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Expanded questions-data.json to have ~20 questions per discipline per year.');
