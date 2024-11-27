const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "src/mockData");
const destination = path.join(__dirname, "build", "mockData");

function copyFolderSync(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  const files = fs.readdirSync(source);

  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destPath = path.join(destination, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      copyFolderSync(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

copyFolderSync(source, destination);
console.log(`Copied ${source} to ${destination}`);
