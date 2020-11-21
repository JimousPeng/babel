const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const options = require("./webpack.config.js");
const mkdirp = require("mkdirp");

let modules = [];
let info = parse(options.entry);
modules.push(info)
// console.log(info);
for(let i = 0; i<modules.length; i++) {
    let item = modules[i];
    // console.log(111111111, item, 22222222)
    const { dependencies } = item;
    if(dependencies) {
        for(let j in dependencies) {
            // console.log(dependencies,'dependencies',  j,  'j', dependencies[j])
            modules.push(parse(dependencies[j]))
        }
    }
}

let obj = {};
modules.forEach((item) => {
    obj[item.entryPath] = {
        dependencies: item.dependencies,
        code: item.code
    }
})
// console.log('00000000', modules,'0000000000')
// file(obj)
/*
 * babel： 解析-转化-生成
 * 解析： parse
 * 转换： transform
 * 遍历： traverse
 * 生成
 */
function parse(entryPath) {
    // 从入口文件路径中读取文件内容
    const codeText = fs.readFileSync(entryPath, "utf-8");
    // console.log(codeText, "11111111");
    // 生成ast抽象语法树
    const ast = parser.parse(codeText, {
        sourceType: "module",
        sourceFilename: true
    });
    console.log(ast, '-----------------')
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
        ImportDeclaration({ node }) {
            // console.log(node.source.value, path.dirname(entryPath));
            // path.sep: 添加平台特定分隔符
            const newPahtName = "." + path.sep + path.join(path.dirname(entryPath), node.source.value);
            // console.log(newPahtName,'--')
            dependencies[node.source.value] = newPahtName;
        },
    });
    // console.log(dependencies);
    const { code } = babel.transformFromAst(ast, null,  {
        presets: ["@babel/preset-env"] 
    });
    // console.log("---", code);
    return {
        entryPath,
        code,
        dependencies
    }

}
function file (code) {
    //创建自运行函数，处理require,module,exports
    //生成main.js => dist/main.js
    const filePath = path.join(options.output.path, options.output.fileName)
    const newCode = JSON.stringify(code);
    // console.log(filePath, newCode); //输出路径 C:\Users\AmandaKitten\workspace\vscodeProject\webpack-self\dist\main.js
    const bundle = `(function (graph) {
        function require(module) {
            function reRequire (relativePath) {
                return require ( graph[module].dependencies[relativePath])
            }
            var exports = {};
            (function (require, exports, code) {
                eval (code)
            })(reRequire, exports, graph[module].code)
            return exports
        }
        require('${options.entry}')
    })(${newCode})`;
    // mkdirp(filePath, function() {
    // })
    fs.writeFileSync(filePath, bundle, "utf-8")
}