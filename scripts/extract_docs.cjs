const path = require('path');
const fs = require('fs');

async function extract() {
    try {
        const mammoth = require('mammoth');
        const dir = path.join(process.cwd(), 'hack steps');
        const files = ['ComplianceVault_BuildGuide.docx', 'ComplianceVault_FinalBible.docx', 'ComplianceVault_TeamGuide.docx'];
        
        let out = '# Research Documentation\n\n';
        
        for (const file of files) {
            out += `## ${file}\n\n`;
            const filepath = path.join(dir, file);
            if (fs.existsSync(filepath)) {
                const result = await mammoth.extractRawText({path: filepath});
                out += result.value + '\n\n---\n\n';
            } else {
                out += `_File not found._\n\n---\n\n`;
            }
        }
        
        // Output as an artifact instead of in the folder so it is clean
        fs.writeFileSync(path.join(dir, 'extracted_research.md'), out);
        console.log('Extraction complete');
    } catch(e) {
        console.error('Error:', e);
    }
}

extract();
