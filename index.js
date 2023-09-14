const fs = require('fs');
const path = require('path');
const compressing = require('compressing');
const asar = require('asar');

// 检查命令行参数是否提供了要处理的文件路径
if (process.argv.length !== 3) {
  console.error('请提供要处理的文件路径作为命令行参数！');
  process.exit(1);
}

// 获取要处理的文件路径
const filePath = process.argv[2];

// 检查文件是否存在
if (!fs.existsSync(filePath)) {
  console.error(`文件 '${filePath}' 不存在！`);
  process.exit(1);
}

// 获取文件名和后缀名
const fileName = path.basename(filePath);
const fileExt = path.extname(fileName);

// 检查文件后缀是否为.upx
if (fileExt !== '.upx') {
  console.error('文件必须具有.upx扩展名！');
  process.exit(1);
}

// 解压.gz文件
async function upxExtract(upxPath) {
  try {
    const folderPath = upxPath.replace('.upx', '');
    await compressing.gzip.uncompress(upxPath, folderPath + '.asar');
    console.log('已解压.gz文件');

    // 使用asar库解压.asar文件
    await asar.extractAll(folderPath + '.asar', folderPath);
    console.log('已解压.asar文件');

    // 将plugin.json更名为package.json
    const pluginJsonPath = path.join(folderPath, 'plugin.json');
    const packageJsonPath = path.join(folderPath, 'package.json');

    fs.renameSync(pluginJsonPath, packageJsonPath);
    console.log('已将plugin.json更名为package.json');

    // 覆盖package.json的name字段
    const packageJsonContent = await fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    packageJson.name = packageJson.pluginName;

    // 将修改后的package.json保存回文件
    await fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson));

    console.log('已将pluginName字段覆盖name字段');
  } catch (error) {
    console.error('处理文件时出错:', error);
  }
}

upxExtract(filePath);