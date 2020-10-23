const fs = require('fs');
const path = require('path');
const babel = require('@babel/core');
const parser = require('@babel/parser');
const traverse = require("@babel/traverse").default;
const options = require('./webpack.config.js')

parse(options.entry)

/*
* babel： 解析-转化-生成
* 解析： parse
* 转换： transform
* 生成
*/
function parse(entryPath) {
    // 从入口文件路径中读取文件内容
    const code = fs.readFileSync(entryPath, 'utf-8');
    // 生成ast抽象语法树
    const ast = parser.parse(code, {
        sourceType: 'module'
    });
    const dependencies = {}; // 存一下依赖路径
    // console.log(ast.program.body, '打印ast')
    /**
     * traverse: 遍历ast
     * params: ast, options
     * ast: ast抽象语法树
     * options: Object, 可以直接指向语法树中node对象的type
     */
    traverse(ast, {
        // enter(path) {
        //     console.log(path, '11111111')
        // }
        ImportDeclaration({node}) {
            console.log(node.source.value, path.dirname(entryPath));
            // path.sep: 添加平台特定分隔符
            const newPahtName = "."+ path.sep + path.join(path.dirname(entryPath), node.source.value)
            // console.log(newPahtName,'--')
            dependencies[node.source.value] = newPahtName
        }
    });
    console.log(dependencies);
    const code = transformFromAstSync(ast)
}