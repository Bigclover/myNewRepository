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
    // {cardType:cardType.CLOSE_ATK,cardName:'剑击',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.ATTACK,initNum:10,effNum:10,range:1}],descr:''},
    // {cardType:cardType.CLOSE_ATK,cardName:'剑挡',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.ATTACK,initNum:5,effNum:5,range:1},{kType:skillType.DEFEND,initNum:5,effNum:5,range:0}],descr:''},
    {cardType:cardType.DISTANCE_ATK,cardName:'手枪',isOneoff:false,isStable:false,consumption:1,baseEffect:[{kType:skillType.ATTACK,initNum:20,effNum:0,range:10}],descr:'载弹伤害:'},
    {cardType:cardType.DISTANCE_ATK,cardName:'手枪',isOneoff:false,isStable:false,consumption:1,baseEffect:[{kType:skillType.ATTACK,initNum:20,effNum:0,range:10}],descr:'载弹伤害:'},
    {cardType:cardType.DISTANCE_ATK,cardName:'手枪',isOneoff:false,isStable:false,consumption:1,baseEffect:[{kType:skillType.ATTACK,initNum:20,effNum:0,range:10}],descr:'载弹伤害:'},
    {cardType:cardType.ENERGY,cardName:'装弹',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.LOAD,initNum:1,effNum:1,range:0}],descr:''},
    {cardType:cardType.ENERGY,cardName:'装弹',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.LOAD,initNum:1,effNum:1,range:0}],descr:''},
    {cardType:cardType.ENERGY,cardName:'装弹',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.LOAD,initNum:1,effNum:1,range:0}],descr:''},
    {cardType:cardType.DRAWCARD,cardName:'神抽',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.DRAWCARD,initNum:1,effNum:1,range:0}],descr:''},
    {cardType:cardType.DEFEND,cardName:'格挡',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.DEFEND,initNum:5,effNum:5,range:0}],descr:''},
    {cardType:cardType.DEFEND,cardName:'格挡+',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.DEFEND,initNum:10,effNum:10,range:0}],descr:''},
    {cardType:cardType.REVIVE,cardName:'恢复',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.REVIVE,initNum:10,effNum:10,range:0}],descr:''},
    {cardType:cardType.REVIVE,cardName:'恢复',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.REVIVE,initNum:10,effNum:10,range:0}],descr:''},
    // {cardType:cardType.EFFECT,cardName:'大力丸',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.EFFECT_ATK,initNum:5,effNum:5,range:0}],descr:''},
    // {cardType:cardType.EFFECT,cardName:'神力丸',isOneoff:true,isStable:false,consumption:0,baseEffect:[{kType:skillType.EFFECT_ATK,initNum:20,effNum:20,range:0}],descr:''},
    {cardType:cardType.DRAWCARD,cardName:'神抽',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.DRAWCARD,initNum:1,effNum:1,range:0}],descr:''},
    {cardType:cardType.MOVE,cardName:'后撤',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.MOVE,initNum:-5,effNum:-5,range:0}],descr:''},
    {cardType:cardType.MOVE,cardName:'前进',isOneoff:false,isStable:false,consumption:0,baseEffect:[{kType:skillType.MOVE,initNum:5,effNum:5,range:0}],descr:''},
    // {cardType:cardType.MOVE,cardName:'冲锋',isOneoff:false,isStable:true,consumption:0,baseEffect:[{kType:skillType.MOVE,initNum:10,effNum:10,range:0},{kType:skillType.STUN,initNum:1,effNum:1,range:1}],descr:''}          
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

