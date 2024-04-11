// import { _decorator, Component, Node } from 'cc';
// const { ccclass, property } = _decorator;
// @ccclass('deckData')

import { CardType, deckObj } from "./gameConfing";


export default class deckData{
    private static _instance: deckData;
    public static get instance(): deckData {
        if (this._instance == null) {
            this._instance = new deckData();
        }
        return this._instance;
    }

    private _curDeckData:deckObj[]=
    [{cardName:'剑击2',baseEffect:[{type:CardType.ATTACK,num:10}],descr:''},
    {cardName:'剑击2',baseEffect:[{type:CardType.ATTACK,num:10}],descr:''},
    {cardName:'剑击',baseEffect:[{type:CardType.ATTACK,num:5}],descr:''},
    {cardName:'剑击',baseEffect:[{type:CardType.ATTACK,num:5}],descr:''},
    {cardName:'神抽',baseEffect:[{type:CardType.DRAWCARD,num:1}],descr:''},
    {cardName:'格挡',baseEffect:[{type:CardType.DEFEND,num:5}],descr:''},
    {cardName:'格挡',baseEffect:[{type:CardType.DEFEND,num:5}],descr:''},
    {cardName:'格挡2',baseEffect:[{type:CardType.DEFEND,num:10}],descr:''},
    {cardName:'恢复',baseEffect:[{type:CardType.REVIVE,num:10}],descr:''},
    {cardName:'恢复',baseEffect:[{type:CardType.REVIVE,num:10}],descr:''},
    {cardName:'大力丸',baseEffect:[{type:CardType.EFFECT_ATK,num:5}],descr:''},
    {cardName:'神抽',baseEffect:[{type:CardType.DRAWCARD,num:1}],descr:''}          
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

