// import { _decorator, Component, Node } from 'cc';
// const { ccclass, property } = _decorator;
// @ccclass('deckData')

import { skillType, deckObj, cardType } from "./gameConfing";


export default class deckData{
    private static _instance: deckData;
    public static get instance(): deckData {
        if (this._instance == null) {
            this._instance = new deckData();
        }
        return this._instance;
    }

    private _curDeckData:deckObj[]=
    [
    // {cardType:cardType.CLOSE_ATK,cardName:'剑击',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.ATTACK,initNum:10,effNum:10,range:1,turns:0}],descr:''},
    // {cardType:cardType.CLOSE_ATK,cardName:'剑击',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.ATTACK,initNum:10,effNum:10,range:1,turns:0}],descr:''},
    // {cardType:cardType.CLOSE_ATK,cardName:'剑挡',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.ATTACK,initNum:5,effNum:5,range:1,turns:0},{kType:skillType.DEFEND,initNum:5,effNum:5,range:0,turns:0}],descr:''},
    // {cardType:cardType.CLOSE_ATK,cardName:'剑挡',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.ATTACK,initNum:5,effNum:5,range:1,turns:0},{kType:skillType.DEFEND,initNum:5,effNum:5,range:0,turns:0}],descr:''},
    {cardType:cardType.DISTANCE_ATK,cardName:'手枪',isOneoff:false,isStable:false,consumption:1,baseEffect:[{kType:skillType.ATTACK,initNum:20,effNum:0,range:10,turns:0,descr:''}],descr:'载弹伤害:20'},
    {cardType:cardType.DISTANCE_ATK,cardName:'手枪',isOneoff:false,isStable:false,consumption:1,baseEffect:[{kType:skillType.ATTACK,initNum:20,effNum:0,range:10,turns:0,descr:''}],descr:'载弹伤害:20'},
    {cardType:cardType.DISTANCE_ATK,cardName:'手枪',isOneoff:false,isStable:false,consumption:1,baseEffect:[{kType:skillType.ATTACK,initNum:20,effNum:0,range:10,turns:0,descr:''}],descr:'载弹伤害:20'},
    {cardType:cardType.EFFECT,cardName:'装弹',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.LOAD,initNum:1,effNum:1,range:0,turns:-1,descr:'远程武器弹药'}],descr:''},
    {cardType:cardType.EFFECT,cardName:'装弹',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.LOAD,initNum:1,effNum:1,range:0,turns:-1,descr:'远程武器弹药'}],descr:''},
    {cardType:cardType.EFFECT,cardName:'装弹',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.LOAD,initNum:1,effNum:1,range:0,turns:-1,descr:'远程武器弹药'}],descr:''},
    {cardType:cardType.DRAWCARD,cardName:'神抽',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.DRAWCARD,initNum:1,effNum:1,range:0,turns:0,descr:''}],descr:''},
    {cardType:cardType.EFFECT,cardName:'格挡',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.DEFEND,initNum:5,effNum:5,range:0,turns:1,descr:'护甲:持续一回合'}],descr:''},
    {cardType:cardType.EFFECT,cardName:'格挡+',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.DEFEND,initNum:10,effNum:10,range:0,turns:1,descr:'护甲:持续一回合'}],descr:''},
    {cardType:cardType.REVIVE,cardName:'恢复',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.REVIVE,initNum:10,effNum:10,range:0,turns:0,descr:''}],descr:''},
    {cardType:cardType.REVIVE,cardName:'恢复',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.REVIVE,initNum:10,effNum:10,range:0,turns:0,descr:''}],descr:''},
    // {cardType:cardType.EFFECT,cardName:'大力丸',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.EFFECT_ATK,initNum:5,effNum:5,range:0,turns:0,descr:'增加近战物理伤害'}],descr:''},
    // {cardType:cardType.EFFECT,cardName:'神力丸',isOneoff:true,isStable:false,consumption:0,baseEffect:[{kType:skillType.EFFECT_ATK,initNum:20,effNum:20,range:0,turns:0,descr:'增加近战物理伤害'}],descr:''},
    {cardType:cardType.DRAWCARD,cardName:'神抽',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.DRAWCARD,initNum:1,effNum:1,range:0,turns:0,descr:''}],descr:''},
    {cardType:cardType.MOVE,cardName:'后撤步',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.TANGLE,initNum:2,effNum:2,range:10,turns:2,descr:'缠绕:无法位移'},{kType:skillType.MOVE,initNum:-5,effNum:-5,range:0,turns:0,descr:''}],descr:''},
    // {cardType:cardType.MOVE,cardName:'突进',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.MOVE,initNum:5,effNum:5,range:0,turns:0}],descr:''},
    {cardType:cardType.EFFECT,cardName:'毒药',isOneoff:false,isStable:true,consumption:0,baseEffect:[{kType:skillType.POISON,initNum:5,effNum:5,range:10,turns:0,descr:'每层造成伤害'}],descr:''},
    {cardType:cardType.EXECUTE,cardName:'毒杀',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.POISONEXECUTE,initNum:4,effNum:0,range:0,turns:0,descr:''}],descr:'每消耗1层毒造成4伤害'}
    // {cardType:cardType.MOVE,cardName:'冲锋',isOneoff:false,isStable:true,consumption:0,baseEffect:[{kType:skillType.MOVE,initNum:10,effNum:10,range:0,turns:0,descr:''},{kType:skillType.STUN,initNum:1,effNum:1,range:1,turns:1,descr:'眩晕:无法行动'}],descr:''}          
    ];

    public getDeckData():deckObj[]{
        return this._curDeckData;
    }

    public setDeckData(dData:deckObj[]){
        this._curDeckData = null;
        this._curDeckData = [...dData];
    }

    public addCardToDeck(dData:deckObj){
        this._curDeckData.push(dData);
    }
}

