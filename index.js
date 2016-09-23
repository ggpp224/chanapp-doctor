/**
 * Created by guopeng on 16/4/17.
 */
'use strict';

var spawn = require('cross-spawn');
var chalk = require('chalk');
var inquirer = require('inquirer');
var child_process = require('child_process');

function sudo(cmd) {
    if(process.platform !== 'win32'){
        return 'sudo '+cmd;
    }
    return cmd;
}

/**
 *
 * @param cb 检查符合条件回调
 */
function check(cb) {
    if(!cb){cb=function(){}}
    console.log('\n\n\n');

    // 检查node版本是否符合要求
    var nodeVersion = process.version;
    var majorVersion = parseInt(nodeVersion.charAt(1));
    if(majorVersion < 4){
        console.log(chalk.yellow('✗      node版本'+nodeVersion+'过低，请安装成熟稳定版本 4.x.x'));
    }else if(majorVersion > 5){
        console.log(chalk.red('✗      node版本'+nodeVersion+'过新， 项目部分依赖包存在不兼容问题，请安装成熟稳定版本 4.x.x'));
    }else{
        console.log(chalk.green('✔      node: '+nodeVersion+'.'))
    }

    var npmVersion = child_process.spawnSync('npm',['-v'],{encoding:'utf8'}).stdout.replace('\n','');
    var majorNpmVersion = npmVersion.charAt(0);
    if(parseInt(majorNpmVersion)<3){
        console.log(chalk.red('✗      npm版本过低，建议升级至npm 3以上'));
        console.log(chalk.dim('       更新到最新版本npm， 请使用如下命令：'))
        console.log(chalk.magenta('       npm install -g npm@3.10.4'));
    }else{
        console.log(chalk.green('✔      npm: v'+npmVersion+'.'))
    }

    // 检查cnpm
    var cnpm = spawn.sync('cnpm');
    if(cnpm.error){
        // 未安装 cnpm
        console.log(chalk.yellow('✗      您还没有安装用户获取畅捷通私有npm模块的客户端(cnpm)'));
        console.log(chalk.dim('在终端中执行如下命令来安装和设置cnpm: '));

        console.log('\n 你可以选择手动安装')
        console.log(chalk.magenta('$ npm install -g cnpm --registry=http://registry.npm.taobao.org'))
        console.log(chalk.magenta('$ cnpm set registry http://172.18.2.109:7001'))

        console.log('\n也可以选择自动安装：')
        inquirer.prompt([
            {
                type:'confirm',
                name:'cnpm',
                message:'是否自动安装设置?'
            }
        ]).then((answers) => {
            // 安装设置cnpm
            if(answers.cnpm){
                child_process.execSync(sudo('npm install -g cnpm --registry=http://registry.npm.taobao.org'), {stdio: 'inherit'});
                spawn.sync('cnpm',['set', 'registry', 'http://172.18.2.109:7001'], { stdio: 'inherit' });
            }

            cb();
    });
    }else{

        // 已安装cnpm
        var result = child_process.spawnSync('cnpm',['config', 'get', 'registry'],{encoding:'utf8'});
        if(result.stdout && !/172.18.2.109:7001/.test(result.stdout)){
            console.log(chalk.green('✔      已安装cnpm的客户端.'));
            console.log(chalk.yellow('✗      你的cnpm的客户端镜像源不是指向chanjet镜像, 可能无法获取某些私有模块.'));
            inquirer.prompt([
                {
                    type:'confirm',
                    name:'chanjetRegistry',
                    message:'是否将cnpm的镜像源设置为chanjet镜像(http://172.18.2.109:7001/)?'
                }
            ]).then((answers) => {
                if(answers.chanjetRegistry){
                spawn.sync('cnpm',['set', 'registry', 'http://172.18.2.109:7001'], { stdio: 'inherit' });
                cb();
            }
        });
        }else{
                console.log(chalk.green('✔      已安装cnpm的客户端.'));
                console.log(chalk.green('✔      cnpm的客户端镜像源已指向http://172.18.2.109:7001.'));
                cb();
        }

    }

    console.log('\n\n\n');

}





module.exports = check;