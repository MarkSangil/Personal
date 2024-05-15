const https = require('https');
const fs = require('fs');

const API_KEY = 'e717a921-bfb2-4c02-a16b-16c8f1fbe71f';
const BASE_URL = 'https://content.guardianapis.com/';

async function fetchAPI(endpoint) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${endpoint}&api-key=${API_KEY}`;
        https.get(url, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error('HTTP status code ' + res.statusCode));
            }
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => { resolve(JSON.parse(data)); });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

function processDataToCSV(data) {
    const articles = data.response.results;
    let csvLines = ['"Title","URL"'];
    articles.forEach(article => {
        const csvLine = `"${article.webTitle.replace(/"/g, '""')}","${article.webUrl}"`;
        csvLines.push(csvLine);
    });
    return csvLines.join('\n');
}

function saveToCSV(filename, csvContent) {
    fs.writeFile(filename, csvContent, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
        } else {
            console.log('File has been saved:', filename);
        }
    });
}

async function main() {
    try {
        const debatesData = await fetchAPI('search?q=debate&tag=politics/politics&from-date=2014-01-01');
        const tagsData = await fetchAPI('tags?q=apple&section=technology&show-references=all');
        const sectionsData = await fetchAPI('sections?q=business');

        const debatesCSV = processDataToCSV(debatesData);
        const tagsCSV = processDataToCSV(tagsData);
        const sectionsCSV = processDataToCSV(sectionsData);

        saveToCSV('debates.csv', debatesCSV);
        saveToCSV('tags.csv', tagsCSV);
        saveToCSV('sections.csv', sectionsCSV);
    } catch (error) {
        console.error('Error during API request or file operations:', error);
    }
}

main();
