const fs = require('fs');
const content = fs.readFileSync('f:/stitch_ayla_media_women_s_photography/ayla-media-website/src/app/admin/AdminDashboardClient.tsx', 'utf8');
let stack = [];
let line = 1;
let col = 1;
for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '{') stack.push({line, col});
    if (char === '}') {
        if (stack.length === 0) {
            console.log(`Extra } at ${line}:${col}`);
        } else {
            stack.pop();
        }
    }
    if (char === '\n') {
        line++;
        col = 1;
    } else {
        col++;
    }
}
if (stack.length > 0) {
    console.log(`Unclosed { at:`);
    stack.forEach(s => console.log(`${s.line}:${s.col}`));
} else {
    console.log("Braces are balanced.");
}
