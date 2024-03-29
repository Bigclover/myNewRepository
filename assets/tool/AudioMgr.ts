import { Node, AudioSource, AudioClip, resources, director, assetManager } from 'cc';
import AssetsManger from '../assetsManager/AssetsManger';

/** 音频类型枚举 */
export enum MusicType {
    SOUND,  // 音效
    MUSIC,  // 音乐
    AUDIO_SOUND, // 音频
    LOOP_SOUND     // 循环音效
}

/**
 * @en
 * this is a sington class for audio play, can be easily called from anywhere in you project.
 * @zh
 * 这是一个用于播放音频的单件类，可以很方便地在项目的任何地方调用。
 */ 
export class AudioMgr {
    private static _inst: AudioMgr;
    public static get inst(): AudioMgr {
        if (this._inst == null) {
            this._inst = new AudioMgr();
        }
        return this._inst;
    }

    private _audioSource: AudioSource;
    constructor() {
        let audioMgr = new Node();
        audioMgr.name = '__audioMgr__';
        director.getScene().addChild(audioMgr);
        director.addPersistRootNode(audioMgr);
        //@en add AudioSource componrnt to play audios.
        //@zh 添加 AudioSource 组件，用于播放音频。
        this._audioSource = audioMgr.addComponent(AudioSource);
    }
    public get audioSource() {
        return this._audioSource;
    }

    /** 背景音乐缓存池 */
    private static _musicPool: Map<string, __AudioSource> = new Map<string, __AudioSource>();
    /** 音效缓存池 */
    private static _soundPool: Map<string, __AudioSource[]> = new Map<string, __AudioSource[]>();
    /** 当前背景音乐 */
    private static _curMusic: __AudioSource;
    /** 当前音效 */
    private static _curSound: string = "";
    /** 上次播放音效时间 */
    private static _lastSoundTime: number = 0;
    /** 是否暂停所有音效 */
    private static _pauseFlag: boolean = false;

    private static getFixedPath(bundleName: string, path: string) {
        let cachePath = '';
        cachePath = bundleName
        return `${cachePath}/${path}`
    }

    /**
     * 播放音效
     * @param {string} path 播放背景音乐
     */
    public  playMusic(bundleName: string, path: string): void {
        if (AudioMgr._pauseFlag) { return; }
        if (AudioMgr._curMusic) {
            AudioMgr._curMusic.stop();
        }
        let fixedPath = AudioMgr.getFixedPath(bundleName, path);
        let source = AudioMgr._musicPool.get(fixedPath);
        if (source) {
            source.play(true);
        } else {
            new __AudioSource(bundleName, path, MusicType.MUSIC,this._audioSource,(ASour:__AudioSource)=>{
                source = ASour;
                AudioMgr._musicPool.set(fixedPath, source);
                source.play(true);
            });
        }
        AudioMgr._curMusic = source;
    }

    /**
     * 播放音效
     * @param {string} path 音效资源
     */
    public  playEffect(bundleName: string, path: string, finishCb?: () => void): void {
        if (AudioMgr._pauseFlag) { return; }
        let curTime = new Date().getTime();
        if (path === AudioMgr._curSound) {
            let tempTime = curTime - AudioMgr._lastSoundTime;
            if (tempTime < 50) {
                return;
            }
        }
        AudioMgr._curSound = path;
        AudioMgr._lastSoundTime = curTime;
        let fixedPath = AudioMgr.getFixedPath(bundleName, path);
        let source = AudioMgr.getEffectFromPool(fixedPath);
        if (source) {
            // console.log('the played audio already in pool');
            source.play(false, finishCb);
        } else {
            new __AudioSource(bundleName, path, MusicType.SOUND,this._audioSource,(ASour:__AudioSource)=>{
                source = ASour;
                AudioMgr.addEffectToPool(fixedPath, source);
                source.play(false, finishCb);
            });
            
        }
    }

    /** 从音效对象池获取对象 */
    public static getEffectFromPool(path: string): __AudioSource {
        let list = AudioMgr._soundPool.get(path);
        if (list) {
            for (let source of list) {
                if (!source.isPlaying()) {
                    return source;
                }
            }
        }
        return null;
    }

    /** 向音效对象池添加对象 */
    public static addEffectToPool(path: string, source: __AudioSource): void {
        let list = AudioMgr._soundPool.get(path);
        if (list) {
            list.push(source);
        } else {
            list = [];
            list.push(source);
            AudioMgr._soundPool.set(path, list);
        }
    }


    // playOneShot(sound: AudioClip | string, volume: number = 1.0) {
    //     if (sound instanceof AudioClip) {
    //         this._audioSource.playOneShot(sound, volume);
    //     }
    // }

    // play(sound: AudioClip | string, volume: number = 1.0) {
    //     if (sound instanceof AudioClip) {
    //         this._audioSource.stop();
    //         this._audioSource.clip = sound;
    //         this._audioSource.play();
    //         this.audioSource.volume = volume;
    //     }
    // }

}

class __AudioSource {
    // 是否加载完成
    private _loaded: boolean = false;
    // 音频资源
    private _audioClip: AudioClip = null;
    // bundle名称
    private _bundleName: string;
    // 音频路径
    private _path: string = "";
    // 音频类型
    private _musicType: MusicType;
    // 是否已被暂停
    private _isStop: boolean;

    private _audioSo:AudioSource;

    private state = {} as any

    public constructor(bundleName: string, path: string, type: MusicType,auduiSo:AudioSource,cb: (ASour:__AudioSource) => void) {
        this._bundleName = bundleName;
        this._path = path;
        this._musicType = type;
        this._audioSo = auduiSo;
        this.loadRes(()=>{
            if (cb) { cb(this); }
        });
    }

    public get musicType(): MusicType {
        return this._musicType;
    }
    

    /**
     * 音频加载接口
     * @param {() => void} cb 加载完成回调
     */
    private loadRes(cb: () => void): void {
        if (!this._loaded) {
            AssetsManger.instance.loadAudio(this._path, this._bundleName).then((audio: AudioClip) => {
                this._audioClip = audio;
                this._loaded = true;
                if (cb) { cb(); }
            });
        }
    }

    public play(isLoop?: boolean, cb?: () => void): void {
        this._isStop = false;
        if (this._loaded) {
            this.stop();
            // this._audioSource.loop = isLoop;
            // this._audioSource.play();
            if (!isLoop) {
                isLoop = false
            }
            this.state.isLoop = isLoop;
            this.state.isPlaying = true;
            if (this._musicType == MusicType.MUSIC) {
                this._audioSo.stop();
                this._audioSo.clip = this._audioClip;
                this._audioSo.play();
            } else {
                this._audioSo.playOneShot(this._audioClip);
            }
            this._audioSo.volume = 1;
            this._audioSo.loop = isLoop;
            
            if (cb) {
                let duration = this._audioClip.getDuration();
                this._audioSo.scheduleOnce(()=>{
                    this.state.isPlaying = false;
                    cb();
                },duration)
                // TimerSystem.instance.doOnce(duration * 1000, () => {
                //     console.log('into TimerSystem call back')
                //     cb();
                // }, this, null, false)
            }
        } 
        // else {
        //     this.loadRes(() => {
        //         if (!this._isStop) {
        //             this.play(isLoop, cb);
        //         }
        //     });
        // }
    }

    async playEffect(isLoop?: boolean) {
        return new Promise<void>(resolve => {
            this.play(isLoop, () => {
                resolve()
            })
        })
    }

    public isPlaying(): boolean {
        return this.state.isPlaying;
    }

    public stop(): void {
        this._isStop = true;
        if (this._loaded) {
            this._audioSo.stop();
        }
    }

    public pause(): void {
        if (this._loaded) {
            this._audioSo.pause();
        }
    }

    public resume(): void {
        if (this._loaded) {
            this._audioSo.play();
        }
    }

    public destroy(): void {
        this.stop();
        if (this._audioClip) {
            // console.log('release audio:' + this._audioSource.name)
            assetManager.releaseAsset(this._audioClip)
            this._audioClip.destroy()
            this._audioClip = null;
        }
    }
}