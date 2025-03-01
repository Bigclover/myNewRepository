/**
 * spine 动画播放
 */

import { Texture2D, Vec2, sp, v2 } from "cc";

// import TimerSystem from "../../kit/timer/TimerSystem";

export interface AnimationConfig {
    name: string;      // 动画名称
    loop?: boolean;     // 是否循环
    duration?: number;  // 循环的话，播放时间
    func?: () => void;
}

export class SpineUtils {

    /**
     * 播放一个动作
     * @param sp spine 组件
     * @param info 播放参数
     */
    // public static playSpineAsync(sp: sp.Skeleton, info: AnimationConfig): Promise<boolean> {
    //     return new Promise((resolve, reject) => {
    //         if (info.loop) {
    //             sp.setAnimation(0, info.name, true);
    //             TimerSystem.instance.doOnce(info.duration * 1000 || 0, () => {
    //                 if (cc.isValid(sp.node)) {
    //                     resolve(true)
    //                 } else {
    //                     cc.warn(`sp.node  is valid false! animation name ${info.name}`);
    //                     resolve(false)
    //                 }
    //             }, null, null, false);
    //         } else {
    //             let te = sp.setAnimation(0, info.name, false);
    //             if (!te) {
    //                 resolve(true);
    //                 return;
    //             };
    //              sp.setCompleteListener((_entry)=>{
    //                 resolve(true);
    //              })
    //         }

    //     })
    // }

    /**
     * 根据配置播放动画
     * @param sp spine 组件
     * @param config AnimationConfig[]
     */
    // public static async playSpineAniByConfig(sp: sp.Skeleton, config: AnimationConfig[]) {
    //     for (let index = 0; index < config.length; index++) {
    //         const info = config[index];
    //         info.func && info.func();
    //         await SpineUtils.playSpineAsync(sp, info);
    //     }

    // }

    
    public static setAnimationState(spinComp: sp.Skeleton,animationName:string|number=0 ,stateType:'start'|'play'|'end',startTime=0){
          let curAnim=this.getAnimationByName(spinComp,animationName)
          if(!curAnim) return
          // spinComp.paused = false;
          spinComp.setAnimation(0,curAnim.name,false)

        return new Promise((resolve) => {
          
            switch(stateType){
                case 'start':{
                   // spinComp.paused = true;
                   spinComp.getCurrent(0).timeScale=0
                   resolve(curAnim.name)
                   break
                }
                case 'play':{
                    // 不用做处理
                    spinComp.setCompleteListener(() => {
                        resolve(curAnim.name)
                     })
                     spinComp.getCurrent(0).animationStart=startTime
                   break
                }
                case 'end':{
                   spinComp.getCurrent(0).timeScale=0
                   spinComp.getCurrent(0).animationStart=this.getDuration(spinComp,animationName)
                   resolve(curAnim.name)
                   break
                }
            }
        })
    }

    public static getDuration( spinComp: sp.Skeleton, animationName?: string | number): number {
        let curAnim=this.getAnimationByName(spinComp ,animationName)
        if(curAnim){
          return curAnim.duration
        }else{
          return 0
        }
    }


   private static  getAnimationByName( spinComp: sp.Skeleton,name:String|number){
       const animations: any[] =spinComp["_skeleton"].data.animations
       if (typeof name === "number") {
         // 如果animation为动画索引，则直接返回索引指向动画时间
         return animations[name];
       }
       // 如果animation是动画name，则遍历查找指定动画时间
       for (let i = 0; i < animations.length; i++) {
         const curAnim= animations[i];
         if (curAnim.name === name) {
           return curAnim;
         }
       }
       console.warn('--传入动画名称非法--',name)
       return false
     }


    /**
     * 播放spine
     * @param spinCmpt 组件
     * @param animName 动画名称
     * @param loop 是否循环
     * @param finishCb 第一个动画完成回调
     * @param finishCount 第一个动画播放次数
     * @param nextName 下一个动画名称
     * @param nextLoop 循环
     */
    public static playSpine(spinCmpt: sp.Skeleton, animName: string|number, loop: boolean = false, finishCb?: () => void, finishCount: number = 1, nextName?: string|number, nextLoop?: boolean): void {
        if (!spinCmpt) {
            console.warn(`playSpine:${animName}, sp.Skeleton null`);
            return;
        }
        
        let curAnim=this.getAnimationByName(spinCmpt,animName)
        if(!curAnim){
            console.warn(`动画名:${animName} 不存在`)
            return
        }
        animName=curAnim.name

        if(typeof nextName ==='number' ){
            // 这里不处理可能数据错误的原因是希望通知直接报错来让开发 在测试过程中直接发现问题
            nextName=  spinCmpt["_skeleton"].data.animations[nextName].name
        }

        spinCmpt.node.active = true;
      
        spinCmpt.setCompleteListener(null);

        if (finishCb) {
            let count = 0;
            spinCmpt.setCompleteListener(() => {
                if (spinCmpt.animation == animName) {
                    count++
                    if (count >= finishCount) {
                        spinCmpt.setCompleteListener(null);
                        finishCb();
                        if (nextName && nextName != "") {
                            spinCmpt.setAnimation(0, <string>nextName, nextLoop);
                        }
                      
                    }
                }
            })
            spinCmpt.setAnimation(0, <string>animName, loop);
            return;
        }
        spinCmpt.setAnimation(0, <string>animName, loop);
        if (nextName && nextName != "") {
            spinCmpt.addAnimation(0, <string>nextName, nextLoop);
        }
    }

    /**
     *  动画融合播放
     * @param spineCom          龙骨组件
     * @param animNameOrIndex   动画名字或者其下标
     * @param loop              是否循环
     * @param mix               融合时间
     * @param finishCount       循环播放多少次后停止
     * @returns 
     */

    public static playSpineMix(spineCom:sp.Skeleton,animNameOrIndex:string|number,loop: boolean = false,mix:0.5,finishCount:number=0){

        let animName:string=""
        if( typeof animNameOrIndex ==='number'){
            animName=spineCom.skeletonData["_skeletonCache"].animations[animNameOrIndex].name
        }else{
            animName=animNameOrIndex
        }
      
        let curAnim=spineCom.animation
        spineCom.setMix(curAnim,animName,mix)
        spineCom.setAnimation(0,animName,loop)
        if(!loop || finishCount>0){
          return new Promise((resolve, reject) => {
            let count = 0;
            spineCom.setCompleteListener(() => {
                count++
                if(!loop){
                    resolve(count)
                }else{
                    if(count>=finishCount){
                        spineCom.paused=true
                        resolve(count)
                    }
                }
            })
          })
        }
    }

    /**
     * 用外部图片局部换装
     * 构建一个SkeletonTexture， 然后给Attachment的region替换属性
     * @param sk   骨骼动画
     * @param slotName  需要替换的插槽名称
     * @param texture   外部图片
     */
    public static changeSlotTexture(sk: sp.Skeleton, slotName: string, tex2d: Texture2D ,mOffset:Vec2 = v2(0,0)) {
        //获取插槽
        let slot = sk.findSlot(slotName);
        let attach: sp.spine.RegionAttachment | sp.spine.MeshAttachment = slot.getAttachment() as (sp.spine.RegionAttachment | sp.spine.MeshAttachment);
        if (!attach) {
            console.warn('get attach nil')
            return
        }
        // @ts-ignore
        let spineTexture: sp.SkeletonTexture = new sp.SkeletonTexture({ width: tex2d.width, height: tex2d.height });
        spineTexture.setRealTexture(tex2d);
        // @ts-ignore
        let region: sp.spine.TextureAtlasRegion = attach.region as sp.spine.TextureAtlasRegion;
        region.width = tex2d.width;
        region.height = tex2d.height;
        region.originalWidth = tex2d.width;
        region.originalHeight = tex2d.height;

        region.rotate = false;
        region.u = 0;
        region.v = 0;
        region.u2 = 1;
        region.v2 = 1;
        // 换图后可以通过设置x、y偏移量来对准位置（如果切图有偏差）
        region.texture = spineTexture;
        region.renderObject = region;
        region.offsetX = mOffset.x;
        region.offsetY = mOffset.y;

        // 如果不修改attach的大小则新图片会被限制在原始图片大小范围内
        attach.width = tex2d.width;
        attach.height = tex2d.height;
        console.log(attach);

        if (attach instanceof sp.spine.MeshAttachment) {
            attach.updateUVs();
        } else {
            // attach.setRegion(region);
            attach.region = region;
            attach.updateOffset();
        }
        // ani 如果使用了缓存模式则需要刷新缓存, 一般换装为了不英雄别的动画都需要设置缓存模式为privite_cache
        sk.invalidAnimationCache();
    }

}
