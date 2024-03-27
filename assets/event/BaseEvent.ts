
// export default class BaseEvent{ 
//     /**
//      * 注册事件
//      *  */ 
//     public static readonly ON_TOOL_ = 'ON_TOUCH_CLICK'; 
// }

export enum BaseEvent {

    // 基础类事件类 前面添加BASE
    //工具类事件监听TOOL

    /**
     * 音频加载
     */
    BASE_EVENT_RECORD_AIN_END,
    /**
     * 音频开始
     */
    EVENT_RECORD_AIN_START,
    //读音完成正确回掉
    ANSWER_COMPLETED,
    //音频播放完成
    AUDIO_COMPLETED,

    EVENT_NATIVE_CALL_COCOS = "event_native_call_cocos", // 原生回调游戏事件
    EVENT_NATIVE_LOADED = "event_native_loaded", // 原生加载完成？(云完全散开)

    EVENT_FOLLOW_UP = "event_follow_up",//跟读
    EVENT_FOLLOW_UP_RIGHT = "event_follow_up_right",//跟读正确
    EVENT_FOLLOW_UP_WRONG = "event_follow_up_wrong"//跟读错误

}




