// import { _decorator, Component, Node } from 'cc';
// const { ccclass, property } = _decorator;
// @ccclass('deckData')

import { skillType, deckObj } from "./gameConfing";


export default class deckData{
    private static _instance: deckData;
    public static get instance(): deckData {
        if (this._instance == null) {
            this._instance = new deckData();
        }
        return this._instance;
    }

    private _curDeckData:deckObj[]=
    [{cardName:'剑击',isOneoff:false,baseEffect:[{kType:skillType.ATTACK,initNum:10,effNum:10,range:1}],descr:''},
    {cardName:'剑击',isOneoff:false,baseEffect:[{kType:skillType.ATTACK,initNum:10,effNum:10,range:1}],descr:''},
    {cardName:'剑挡',isOneoff:false,baseEffect:[{kType:skillType.ATTACK,initNum:5,effNum:5,range:1},{kType:skillType.DEFEND,initNum:5,effNum:5,range:0}],descr:''},
    {cardName:'剑挡',isOneoff:false,baseEffect:[{kType:skillType.ATTACK,initNum:5,effNum:5,range:1},{kType:skillType.DEFEND,initNum:5,effNum:5,range:0}],descr:''},
    {cardName:'神抽',isOneoff:false,baseEffect:[{kType:skillType.DRAWCARD,initNum:1,effNum:1,range:0}],descr:''},
    {cardName:'格挡',isOneoff:false,baseEffect:[{kType:skillType.DEFEND,initNum:5,effNum:5,range:0}],descr:''},
    {cardName:'格挡',isOneoff:false,baseEffect:[{kType:skillType.DEFEND,initNum:5,effNum:5,range:0}],descr:''},
    {cardName:'格挡2',isOneoff:false,baseEffect:[{kType:skillType.DEFEND,initNum:10,effNum:10,range:0}],descr:''},
    {cardName:'恢复',isOneoff:false,baseEffect:[{kType:skillType.REVIVE,initNum:10,effNum:10,range:0}],descr:''},
    {cardName:'恢复',isOneoff:false,baseEffect:[{kType:skillType.REVIVE,initNum:10,effNum:10,range:0}],descr:''},
    {cardName:'大力丸',isOneoff:false,baseEffect:[{kType:skillType.EFFECT_ATK,initNum:5,effNum:5,range:0}],descr:''},
    {cardName:'神力丸',isOneoff:true,baseEffect:[{kType:skillType.EFFECT_ATK,initNum:20,effNum:20,range:0}],descr:''},
    {cardName:'神抽',isOneoff:false,baseEffect:[{kType:skillType.DRAWCARD,initNum:1,effNum:1,range:0}],descr:''},
    {cardName:'前进',isOneoff:false,baseEffect:[{kType:skillType.MOVE,initNum:5,effNum:5,range:0}],descr:''},
    {cardName:'冲锋',isOneoff:false,baseEffect:[{kType:skillType.MOVE,initNum:10,effNum:10,range:0}],descr:''}          
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

