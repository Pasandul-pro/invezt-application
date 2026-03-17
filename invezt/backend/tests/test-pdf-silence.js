import pdfParse from 'pdf-parse-new';
import fs from 'fs';
import path from 'path';

async function testPdfSilence() {
    console.log('Testing PDF parsing silence...');
    
    // Path to a sample PDF in node_modules
    const pdfPath = 'd:/invezt-application/invezt/backend/node_modules/pdf-parse-new/test/data/01-valid.pdf';
    
    if (!fs.existsSync(pdfPath)) {
        console.error('Sample PDF not found at:', pdfPath);
        return;
    }
    
    const buffer = fs.readFileSync(pdfPath);
    
    console.log('--- START PARSE (Should be silent) ---');
    try {
        const data = await pdfParse(buffer, { verbosityLevel: 0 });
        console.log('Successfully extracted', data.text.length, 'characters.');
    } catch (error) {
        console.error('Parsing failed:', error);
    }
    console.log('--- END PARSE ---');
}

testPdfSilence();
