const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'assets');
const destDir = path.join(__dirname, 'dist', 'assets');

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

console.log('Copying static assets from', srcDir, 'to', destDir);

fs.readdir(srcDir, (err, files) => {
    if (err) {
        console.error('Error reading assets directory:', err);
        process.exit(1);
    }

    files.forEach(file => {
        const srcFile = path.join(srcDir, file);
        const destFile = path.join(destDir, file);

        fs.stat(srcFile, (err, stat) => {
            if (err) {
                console.error('Error stating file:', srcFile, err);
                return;
            }

            if (stat.isFile()) {
                fs.copyFile(srcFile, destFile, err => {
                    if (err) {
                        console.error('Error copying file:', srcFile, 'to', destFile, err);
                    } else {
                        console.log('Copied:', file);
                    }
                });
            }
        });
    });
});
