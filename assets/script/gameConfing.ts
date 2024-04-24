export enum cardType {
  CLOSE_ATK = 0,
  DISTANCE_ATK = 1,
  EFFECT = 2, 
  REVIVE = 3,
  DRAWCARD = 4,      //EFFECT_ATK,STUN
  MOVE = 5,
}

export enum skillType {
    ATTACK = 0, //伤害
    DEFEND = 1, //防盾
    REVIVE = 2, //回血
    DRAWCARD = 3, //抽卡
    EFFECT_ATK = 4, //加攻
    MOVE = 5, //位移
    STUN = 6, //眩晕
    LOAD = 7, //装弹
    TANGLE = 8 //缠结
}

export interface mAndvObj{
  monId:number,
  value:number
}

export interface effectObj{
    kType:skillType,
    initNum:number,
    effNum:number,
    range:number,
    turns:number  //技能生效回合 -1:代表一直生效
}

export interface stateObj{
    sType:skillType,
    stateNum:number,
    isEffective:boolean,
    persistTurns:number,
    beginRound:number
}

export interface deckObj{
    cardType:cardType,
    cardName:string,
    isOneoff:boolean,
    isStable:boolean,
    consumption:number,
    baseEffect:effectObj[],
    descr:string
}

export interface monInfo{
    name:string,
    level:number,
    maxHp:number,
    speed:number,
    type:number,
    stand:number,
    move:number,
    skills:effectObj[]
}

export class gameConfing {
    private static _instance: gameConfing = null;

    public static get instance(): gameConfing {
        if (!this._instance) {
            this._instance = new gameConfing();
        }
        return this._instance;
    }

    getImgPatchByType(type:number):string{
      let _patch:string = '';
      switch (type) {
          case skillType.ATTACK:
              _patch = 'atk';
              break;
          case skillType.DEFEND:
              _patch = 'def';
              break;
          case skillType.REVIVE:
              _patch = 'life';
              break;
          case skillType.DRAWCARD:
              _patch = 'draw';
              break;
          case skillType.EFFECT_ATK:
              _patch = 'efAtk';
              break;
          case skillType.MOVE:
              _patch = 'move';
              break;
          case skillType.STUN:
              _patch = 'stun';
              break;
          case skillType.LOAD:
              _patch = 'load';
              break;  
          case skillType.TANGLE:
              _patch = 'tangle';
              break;    
          default:
              _patch = 'atk';
              break;
      }
      _patch = `img/skillType/${_patch}/spriteFrame`;
      return _patch;
  }

    public swapArray<T>( array:T[],index1:number,index2:number) {
      // 如果入参为空，则返回null
      if (array == null || array.length == 0) {
      return null;
      }
      // 如果下标越界，则返回原数组
      if (index1 < 0 || index1 >= array.length || index2 < 0 || index2 >= array.length) {
      return array;
      }
      // 交换数组中两个元素的位置
      let temp:T = array[index1];
      array[index1] = array[index2];
      array[index2] = temp;
      return array;
  }

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

