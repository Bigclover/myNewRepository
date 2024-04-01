// import { _decorator, Component, Node } from 'cc';
// const { ccclass, property } = _decorator;
// @ccclass('deckData')

interface effectObj{
    tag:string,
    num:number
}

export interface deckObj{
    cardName:string,
    baseEffect:effectObj[],
    descr:string
}

export default class deckData{
    private static _instance: deckData;
    public static get instance(): deckData {
        if (this._instance == null) {
            this._instance = new deckData();
        }
        return this._instance;
    }

    private _curDeckData:deckObj[]=
    [{cardName:'剑击',baseEffect:[{tag:'攻击',num:10}],descr:''},
    {cardName:'剑击',baseEffect:[{tag:'攻击',num:10}],descr:''},
    {cardName:'重击',baseEffect:[{tag:'攻击',num:20}],descr:''},
    {cardName:'格挡',baseEffect:[{tag:'防御',num:10}],descr:''},
    {cardName:'格挡',baseEffect:[{tag:'防御',num:10}],descr:''},              
    ];

    public getDeckData():deckObj[]{
        return this._curDeckData;
    }

    public setDeckData(dData:deckObj[]){
        this._curDeckData = null;
        this._curDeckData = dData;
    }

    public addCardToDeck(dData:deckObj){
        this._curDeckData.push(dData);
    }
}

