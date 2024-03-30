import { _decorator, Component, Node, sp,  } from 'cc';
import AssetsManger from '../assetsManager/AssetsManger';
const { ccclass, property } = _decorator;

@ccclass('mainSecene')
export class mainSecene extends Component {
    age=20;
    start() {
   
    }


    
    testFun2(){
        let funObj = this.fun2();
        let n1 =funObj.next();
        console.log("stateID ="+n1.value+" isDone ="+n1.done);
        let n2 =funObj.next();
        console.log("stateID ="+n2.value+" isDone ="+n2.done);
        let n3 =funObj.next();
        console.log("stateID ="+n3.value+" isDone ="+n3.done);
    }
    //Generator 函数
    *fun2(){
        console.log("one");
        yield 1;
        console.log("two");
        yield 2; 
        console.log("three");
        return 3;//return 方法返回给定值，并结束遍历 Generator 函数。不提供参数时，返回 undefined
    }

    fun1(){
        //字符串中加入变量or方法
        let cid = 0;
        let res = `res/images/arrow${cid}`;
        // let string2= `Game start,${this.f()}`; 
        Math.trunc(12.3)//12 返回数字整数部分
        
        //map会return一个新array ，forech不会
        let tarr:number[]=[1,2,3,4,5,6];
        let tarr1 =tarr.map((value,index)=>{
             return value*2;
        })

        //将参数中所有值作为元素形成数组。
        Array.of(1, 2, 3, 4);
        //将类数组对象或可迭代对象转化为数组
        Array.from([1, 2]);
        Array.from([1, 2, 3], (n) => n * 2);

        //一个类数组对象必须含有length属性，key必须是数值或者可转换为数值的字符
        let arr = Array.from({
            0: '1',
            1: '2',
            2: 3,
            length: 3
          });

        //遍历key and value
        for(let key of ['a', 'b'].keys()){}
        for(let value of ['a', 'b'].values()){}
        
        //经过验证扩展运算符第一层是深拷贝，大于一层时为浅拷贝
        let arr1 = [1,2,3]
        let arr2 = [...arr1];
        arr2[0]= 4;
        console.log(arr1[0]);//1

        let a1 = [{ foo: 1 }];
        let a2 = [{ bar: 2 }];
        let a4 = [...a1, ...a2];
        a4[0][0]=5;
        console.log("a1 0 =",a1[0][0]);//5

        //继承中 调用父类方法, super 作为对象，调用普通方法时指向父类的原型对象，调用静态方法时指向父类。

        //在一个文件或模块中export、import 可以有多个，export default 仅有一个
        //通过 export 方式导出，在导入时要加{ }，export default 则不需要
        //export default 向外暴露的成员，可以使用任意变量来接收
    }

    update(deltaTime: number) {
        
    }

    async setSkeletonByData(aniSke:sp.Skeleton){
        aniSke.skeletonData = await AssetsManger.instance.loadSpineData("spine/d5_LTZJ_feiji2",'resources');
        this.playSpine(aniSke,'d5_LTZJ_feiji2_fei',true);
    }

    playSpine(spNode:sp.Skeleton, spName:string, loop:boolean) {
        spNode.clearTracks();
        spNode.setToSetupPose();
        let le = spNode.setAnimation(0, spName, loop);
        if (!loop) {
            return new Promise<void>((resolve, reject) => {
                spNode.setTrackCompleteListener(le, () => {
                    resolve();
                })
            });
        }
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
        //常用命令 git init - 初始化仓库，git add . - 添加文件到暂存区，git commit - 将暂存区内容添加到仓库中
        //git reset回退版本 git log 查看历史提交记录
        //分支相关 git branch 列出你在本地的分支，git branch branchName 创建一个分支 ，git checkout 分支切换,
        //git merge branchName 将指定分支合并到当前分支 git branch -d branchName 删除分支
        //版本回退 进入相应分支 根据git log --oneline --graph 显示的每次提交的ID，用git reset --hard ID 回退到对应的提交状态
    }
}

