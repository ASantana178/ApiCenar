const fs = require('fs');
const path = require('path');

function publicUploadPath(subdir, filename) {
  return `/uploads/${subdir}/${filename}`;
}

function absoluteFromPublic(publicPath) {
  if (!publicPath) return null;
  const cleaned = String(publicPath).replace(/^\//, '');
  return path.join(process.cwd(), cleaned);
}

function deletePublicFile(publicPath) {
  const abs = absoluteFromPublic(publicPath);
  if (!abs) return;
  try {
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch (err) {
    console.error('[files] delete failed:', abs, err.message);
  }
}

module.exports = {
  publicUploadPath,
  absoluteFromPublic,
  deletePublicFile,
};
