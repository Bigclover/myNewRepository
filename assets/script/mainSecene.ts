import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('mainSecene')
export class mainSecene extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }

    testGit(){
        //远程git库
        //生成 SSH Key
        //ssh-keygen -t rsa -C "youremail@example.com"
        //直接克隆远程库：git clone git@github.com:...
        //or关联本地库和远程库
        //git remote add origin git@github.com:
        //git push -u origin master 第一次推送master分支时加上-u,Git不但会把本地master分支内容推送到远程新的master分支
        //还会把本地master分支和远程master分支关联起来在以后的推送或者拉取时就可以简化命令
        //git remot -v 查看远程库
        //git remot rm origin 删除远程库
    }
}

