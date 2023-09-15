const fs = require('fs');
const path = require('path');

// 检查命令行参数是否提供了要处理的文件路径
if (process.argv.length !== 3) {
  console.error('请提供要处理的文件路径作为命令行参数！');
  process.exit(1);
}

// 获取要处理的文件路径
const filePath = process.argv[2];

async function convertPluginToRubick(folderPath) {
  try {
    // 将plugin.json更名为package.json
    const pluginJsonPath = path.join(folderPath, 'plugin.json');
    const packageJsonPath = path.join(folderPath, 'package.json');

    fs.renameSync(pluginJsonPath, packageJsonPath);
    console.log('已将plugin.json更名为package.json');

    // 覆盖package.json的name字段
    const packageJsonContent = await fs.promises.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    packageJson.name = packageJson.pluginName;

    // 设置插件类型为 ui 类型
    packageJson.pluginType = "ui";

    // 去除不支持的关键字
    packageJson.features = packageJson.features.filter(data => data.cmds.every(e => typeof e !== 'object'));

    // 将修改后的package.json保存回文件
    await fs.promises.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');

    console.log('已将pluginName字段覆盖name字段');
  } catch (error) {
    console.error('转换插件时出错:', error);
  }
}

// 执行转换操作
convertPluginToRubick(filePath);
