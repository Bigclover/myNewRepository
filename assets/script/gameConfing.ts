export enum skillType {
    ATTACK = 0,
    DEFEND = 1,
    REVIVE = 2,
    DRAWCARD = 3,
    EFFECT_ATK = 4
}

export interface effectObj{
    kType:number,
    initNum:number,
    effNum:number
}

export interface deckObj{
    cardName:string,
    isOneoff:boolean,
    baseEffect:effectObj[],
    descr:string
}

export interface monInfo{
    name:string,
    level:number,
    maxHp:number,
    speed:number,
    type:number,
    skills:effectObj[]
}

export class gameConfing {
    // private static _instance: WaterPipeConfig = null;

    // public static get instance(): WaterPipeConfig {
    //     if (!this._instance) {
    //         this._instance = new WaterPipeConfig();
    //     }
    //     return this._instance;
    // }

    deepCopy(obj1) {
		var obj2 = Array.isArray(obj1) ? [] : {};
		if (obj1 && typeof obj1 === "object") {
		  for (var i in obj1) {
			var prop = obj1[i]; // 避免相互引用造成死循环，如obj1.a=obj
			if (prop == obj1) {
			  continue;
			}
			if (obj1.hasOwnProperty(i)) {
			  // 如果子属性为引用数据类型，递归复制
			  if (prop && typeof prop === "object") {
				obj2[i] = (prop.constructor === Array) ? [] : {};
				arguments.callee(prop, obj2[i]); // 递归调用
			  } else {
				// 如果是基本数据类型，只是简单的复制
				obj2[i] = prop;
			  }
			}
		  }
		}
		return obj2;
	  }
}

