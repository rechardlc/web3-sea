const fs = require('fs');
const path = require('path');

/**
 * 递归复制目录
 */
function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    // 创建目标目录
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    // 递归复制子目录和文件
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    // 复制文件
    fs.copyFileSync(src, dest);
  }
}

/**
 * 将 artifacts 目录复制到 src 目录
 */
function copyArtifacts() {
  const sourceDir = path.join(__dirname, '..', 'artifacts');
  const targetDir = path.join(__dirname, '..', 'src', 'artifacts');

  // 检查源目录是否存在
  if (!fs.existsSync(sourceDir)) {
    console.error('❌ 源目录不存在:', sourceDir);
    console.error('💡 请先运行 npm run compile 编译合约');
    process.exit(1);
  }

  // 如果目标目录已存在，先删除
  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.log('🗑️  已删除旧的目标目录:', targetDir);
  }

  // 递归复制整个 artifacts 目录
  copyRecursive(sourceDir, targetDir);
  console.log(`\n✨ 完成！已将 artifacts 目录复制到 ${targetDir}`);
}

// 执行复制
copyArtifacts();

