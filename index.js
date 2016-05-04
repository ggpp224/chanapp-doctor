/**
 * Created by guopeng on 16/4/17.
 */
'use strict';

var spawn = require('cross-spawn');
var chalk = require('chalk');
var inquirer = require('inquirer');

var child_process = require('child_process')

function check(cb, silent) {
    var cnpm = spawn.sync('cnpm');
    if(cnpm.error){
        console.log(chalk.yellow('✗  您还没有安装用户获取畅捷通私有npm模块的客户端(cnpm)'));
        console.log(chalk.green('在终端中执行如下命令来安装和设置cnpm: '));
        console.log(chalk.dim('$ npm install -g cnpm --registry=http://registry.npm.taobao.org'))
        console.log(chalk.dim('$ cnpm set registry http://172.18.22.198:7001'))
        inquirer.prompt([
            {
                type:'confirm',
                name:'cnpm',
                message:'是否自动安装设置?'
            }
        ]).then((answers) => {
            if(answers.cnpm){
            spawn.sync('npm',['install', '-g', 'cnpm', '--registry=http://registry.npm.taobao.org'], { stdio: 'inherit' });
            spawn.sync('cnpm',['set', 'registry', 'http://172.18.22.198:7001'], { stdio: 'inherit' });
            cb();
        }
    });
    }else{

        var result = child_process.spawnSync('cnpm',['config', 'get', 'registry'],{encoding:'utf8'});
        if(result.stdout && !/172.18.22.198:7001/.test(result.stdout)){
            if(!silent){
                console.log(chalk.green('✗  已安装cnpm的客户端.'));
            }
            console.log(chalk.yellow('✗  你的cnpm的客户端镜像源不是指向chanjet镜像, 可能无法获取某些私有模块.'));
            inquirer.prompt([
                {
                    type:'confirm',
                    name:'chanjetRegistry',
                    message:'是否将cnpm的镜像源设置为chanjet镜像(http://172.18.22.198:7001/)?'
                }
            ]).then((answers) => {
                if(answers.chanjetRegistry){
                spawn.sync('cnpm',['set', 'registry', 'http://172.18.22.198:7001'], { stdio: 'inherit' });
                cb();
            }
        });
        }else{
            if(!silent){
                console.log(chalk.green('✗  已安装cnpm的客户端.'));
                console.log(chalk.green('✗  cnpm的客户端镜像源已指向http://172.18.22.198:7001.'));
            }
            cb();
        }

    }

    return cnpm;

}





module.exports = check;