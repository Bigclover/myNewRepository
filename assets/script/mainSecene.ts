import { _decorator, Component, instantiate, JsonAsset, Label, Layout, Node, Prefab, Slider, sp, Sprite, tween, Vec3,  } from 'cc';
import { monster } from './monster';
import { hero } from './hero';
import { mAndvObj, skillType } from './gameConfing';

// import AssetsManger from '../assetsManager/AssetsManger';
const { ccclass, property } = _decorator;

@ccclass('mainSecene')
export class mainSecene extends Component {
    @property(Layout)
    monsterLayout:Layout = null;

    @property({type:Prefab})
    monsterPrefab:Prefab = null;

    @property(Node)
    heroNode:Node = null;

    @property({type:Prefab})
    heroPrefab:Prefab = null;

    @property(JsonAsset)
    monsterConfig:JsonAsset = null

    private _monstersArray:monster[]=[];
    private _myHero:hero = null;
    private _monsterJson:object = null;
    private heroRound:number = 0;
    private monsterRound:number = 0;
    private _curSelectMonster:number = 0;
    private _monPositionArr:Vec3[]=[];
    
    protected onLoad(): void {
        this._monsterJson = this.monsterConfig.json;
    }

    start() {
        this.createMyHero();
        this.createMonsters(2);
        
        this.scheduleOnce(()=>{
            this.getClosestMonsterSelected();
            this.heroRoundStart();
        },0.5)
    }

    getMonsterRound():number{
        return this.monsterRound;
    }

    heroMoveFinish(){
        //通知所有monster 更新距离
        this._monstersArray.forEach((_mon)=>{
            _mon.showDistance();
        })
    }

    refreshMonsterLayout(){
        // this.monsterLayout.enabled = true;
        //按照stand重新排序_monstersArray并更新到monsterLayout上
        this._monPositionArr = [];
        this._monstersArray.sort(this.compareStM("stand"));
        this._monstersArray.forEach((_mon)=>{
            let _index = this._monstersArray.indexOf(_mon);
            _mon.node.setSiblingIndex(_index);
        })
        this.monsterLayout.updateLayout();
        this._monstersArray.forEach((_monster)=>{
            _monster.setStartPosition();
            this._monPositionArr.push( _monster.getCurPosition());
        })
     }

    monsterMoveFinished(){
        if (this._monstersArray.length > 1) {
            this._monstersArray.sort(this.compareStM("stand"));
            this._monstersArray.forEach((_mon)=>{
                let _index = this._monstersArray.indexOf(_mon);
                if (_mon.getCurPosition() != this._monPositionArr[_index]) {
                    _mon.monsterToPosition(this._monPositionArr[_index]);
                }
            })
        }
    }

    getClosestMonsterSelected(){
        let mid = this.getClosestMonster();
        this.setSelectedMonster(mid)
    }

    getClosestMonster():number{
        this._monstersArray.sort(this.compareStM("stand"));
        return this._monstersArray[0].getMonsterID();
    }

    getMonsterStand(monsterID:number):number{
        let monsterStand:number;
        this._monstersArray.forEach((_mon)=>{
            if (_mon.getMonsterID() == monsterID) {
                monsterStand =  _mon.getStand();
                return;
            }
        })
        return monsterStand;
    }

    getHeroStand():number{
        return this._myHero.getStand();
    } 

    createMonsters(num:number){
        for (let i = 0; i < num; i++) {
            this.createOneMonster(i,this._monsterJson[i]);//创建测试monster
        }
        this.refreshMonsterLayout();
    }

    createMyHero(){
        let myHero = instantiate(this.heroPrefab)
        let myHeroCom:hero = myHero.getComponent(hero);
        myHeroCom.init(this);
        this.heroNode.addChild(myHero);
        this._myHero = myHeroCom;
    }

    setSelectedMonster(num:number){
        this._curSelectMonster = num;
        this.setSelectedTag(num);

        this.updatePoisonExecuteNum(num);
    }

    updatePoisonExecuteNum(mID:number){
        this._monstersArray.forEach((_mon)=>{
            if(_mon.getMonsterID()==mID){
                let layer = 0;
                let poison = _mon.getStateEffByType(skillType.POISON)
                if (poison) {
                    layer = poison.getStateNum();
                }
                this._myHero.updatePoisonCardNum(layer);
            }
        })
    }

    getSelectedMonster(){
        return this._curSelectMonster;
    }

    setSelectedTag(num:number){
        this._monstersArray.forEach((_mon)=>{
            if (_mon.getMonsterID()==num) {
                _mon.setSelectTag(true)
            } else {
                _mon.setSelectTag(false)
            }
        })
    }

    whenHeroDie(){
        console.log('Game Over!!!!!');
    }

    whenMonsterDie(_mon:monster){
        this.removeItemFormArray<monster>(_mon,this._monstersArray);
        _mon.node.destroy();
        if (this._monstersArray.length > 0) {
            let mID = this._monstersArray[0].getMonsterID();
            this.setSelectedMonster(mID);
            this.refreshMonsterLayout();
        }
    }

    monsterActFinished(){
        this.scheduleOnce(()=>{
            this.heroRoundStart();
        },1);
    }

    heroRoundStart(){
        this.heroRound++;
        this._myHero.roundStart(this.heroRound);
        if (this._monstersArray.length > 0) {
            this._monstersArray.forEach((_mon)=>{
                _mon.showComingSkill();
            })
        } 
    }

     monsRound(index:number,monsterID:number) {
        return new Promise<void>((resolve)=> {
            setTimeout(()=>{
                this._monstersArray.forEach((_monster)=>{
                    if (_monster.getMonsterID() == monsterID) {
                        _monster.roundStart();
                    }
                })
                resolve()
            },(index+1)*1000)
        })
    }

    async monsterRoundStart(){
        this.monsterRound++;
        let speedArray:mAndvObj[]=[];
        this._monstersArray.forEach((_mon)=>{
            let _mandv:mAndvObj={
                monId:_mon.getMonsterID(),
                value:_mon.getSpeed()
            }
            speedArray.push(_mandv);
        })
        speedArray.sort(this.compareMtS("value"));
        //按照monster的 speed值由大到小的顺序 依次执行monster动作
        let mrArray=[]
        for (let i = 0; i < speedArray.length; i++) {
            mrArray.push(this.monsRound(i,speedArray[i].monId));
        }
        for await (let monsRound of mrArray) {}
        this.monsterActFinished();
    }

    compareMtS(property){//按照数组每个元素对象的某一个属性值的大小降序排序
        return function(obj1,obj2){
            let value1 = obj1[property];
            let value2 = obj2[property];
            return value2-value1;
        }
    }

    compareStM(property){
        return function(obj1,obj2){
            let value1 = obj1[property];
            let value2 = obj2[property];
            return value1-value2;
        }
    }

    // doMonsterAtk(){
    //     //后期要排队执行每一个monster的攻击
    //     this._monstersArray.forEach(_monster => {
    //         _monster.monsterAI();
    //     });
    // }

    createOneMonster(id:number,monsterInfo:object){
        let monsterIns = instantiate(this.monsterPrefab);
        let monsterCom:monster = monsterIns.getComponent(monster);
        monsterCom.init(id,<any>monsterInfo,this);
        this._monstersArray.push(monsterCom);
        this.monsterLayout.node.addChild(monsterIns);
    }

    update(deltaTime: number) {
        
    }

    removeItemFormArray<T>(item:T,arr:T[]){
        let index = arr.indexOf(item);
        if (index > -1) {
            arr.splice(index,1);
        }
    }














 ///////////////////////////////////////////////////////////////   
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

    // async setSkeletonByData(aniSke:sp.Skeleton){
    //     aniSke.skeletonData = await AssetsManger.instance.loadSpineData("spine/d5_LTZJ_feiji2",'resources');
    //     this.playSpine(aniSke,'d5_LTZJ_feiji2_fei',true);
    // }

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

    // async setSpFun(){
    //     this.squareNode.getComponent(Sprite).spriteFrame = await AssetsManger.instance.loadImg('taiyang/spriteFrame','myAssetBudle');
    // }

    baseinfo(){
        // 2Dnode属性修改test
        // this.squareNode.active = false;//隐藏节点
        // this.squareNode.setPosition(100,50,0);
        // this.squareNode.setRotationFromEuler(new Vec3(0,0,45));
        // this.squareNode.setScale(new Vec3(2,1,1));
        // this.squareNode.layer = Layers.Enum.UI_2D;
        // this.squareNode.setSiblingIndex(1);//zIndex
        // this.squareNode.getComponent(UITransform).setAnchorPoint(0.5,0.5)
        // this.squareNode.getComponent(UITransform).setContentSize(new Size(80,40));
        // this.squareNode.getComponent(Sprite).color = color(255,255,255,100);
        // this.squareNode.getComponent(Sprite).color.fromHEX("0587FF");

        
        // this.node.on(Node.EventType.TOUCH_START, this.onTouchBegin, this);
        // input.on(Input.EventType.TOUCH_START, this.onTouchBegin, this);

        //Tween test
        // let myTween = tween(this.squareNode)
        // .tag(1)
        // .to(2,{position:new Vec3(this.squareNode.position.x,this.squareNode.position.y+100,this.squareNode.position.z)})
        // .by(2,{position:new Vec3(100,0,0)}, { easing: 'backIn'})
        // .by(1,{scale:new Vec3(1,0,0)})
        // .to(1,{rotation:Quat.fromEuler(new Quat(), 0, 0, 45)})
        // .set({ position: new Vec3(0, 100, 0) })//瞬时动作or属性设置
        // .delay(1)
        // .removeSelf()
        // .parallel(// 同时执行两个 Tween
        //     tween().to(2, { scale: new Vec3(1, 2, 3) }),
        //     tween().to(2, { position: new Vec3(3, 0, 3) })
        // )
        // .call(()=>{
        //     console.log('my tween done...')
        // })
        // .start()

        //Tween stop
        // myTween.stop();
        // Tween.stopAll()
        // Tween.stopAllByTag(1);

        //3.x spriteFrame 导入
        // const url = 'img/toy1/spriteFrame';
        // resources.load(url, SpriteFrame, (err: any, spriteFrame) => {
        // this.squareNode.getComponent(Sprite).spriteFrame = spriteFrame;
        // });

        // 加载 texture
        // resources.load("img/toy1/texture", Texture2D, (err: any, texture: Texture2D) => {
        //     const spriteFrame = new SpriteFrame();
        //     spriteFrame.texture = texture;
        //     this.squareNode.getComponent(Sprite).spriteFrame = spriteFrame;
        // });

        //加载图集
        // resources.load("test_assets/sheep", SpriteAtlas, (err, atlas) => {
        //     const frame = atlas.getSpriteFrame('sheep_down_0');
        //     sprite.spriteFrame = frame;
        // });

        //存放在服务器上的资源只能加载到图像源资源 ImageAsset
        // const url = 'test_assets/test_atlas/content';
        // resources.load(url, ImageAsset, (err: any, imageAsset) => {
        // const sprite = this.getComponent(Sprite);
        // sprite.spriteFrame = SpriteFrame.createWithImage(imageAsset);
        // });

        // 加载 Prefab
        // resources.load("test_assets/prefab", Prefab, (err, prefab) => {
        //     const newNode = instantiate(prefab);
        //     this.node.addChild(newNode);
        // });

        // 加载 AnimationClip
        // resources.load("test_assets/anim", AnimationClip, (err, clip) => {s
        //     this.node.getComponent(Animation).addClip(clip, "anim");
        // });

        //加载Scene
        // director.loadScene("MyScene",()=>{
        //     //场景加载后的回调
        // });
        //director.preloadScene()//预加载场景
        // bundle.loadScene('MyScene', function (err, scene) {
        //     director.runScene(scene);
        // });

        // let interval = 5;// 以秒为单位的时间间隔
        // let repeat = 3;// 重复次数
        // let delay = 10;// 开始延时
        // let callback = this.schedule(function() {
        // 这里的 this 指向 component
        // }, interval, repeat, delay);//上面的计时器将在 10 秒后开始计时，每 5 秒执行一次回调，重复 3 + 1 次
        // this.unschedule(callback);//取消这个计时器
    }
    
    async spineTestFun(){
        //spine挂点
        // let _scoketName = "root/bone2/tigo_43__Layer_67/bone/qiang/qiang2/qiang4/qiang3";
        // let scoket = new sp.SpineSocket(_scoketName,this.attachNode);
        // this.t2!.sockets.push(scoket);
        // this.t2!.sockets = this.t2!.sockets;

        //spine顶点效果
        // this._jitterEffect = new sp.VertexEffectDelegate();
        //  // 设置好抖动参数。
        //  this._jitterEffect.initJitter(10, 10);
        //  // 调用 Skeleton 组件的 setVertexEffectDelegate 方法设置效果。
        //  this.t2!.setVertexEffectDelegate(this._jitterEffect!);
        
        // await this.playSpine(this.t2,"tigo_xie_baqiangkaiqiang",false);
        // console.log('spine anim done')
    }
}

