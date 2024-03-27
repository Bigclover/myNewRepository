import { Asset, AssetManager, AudioClip, Component, Material, Prefab, SpriteFrame, assetManager, sp } from "cc";

export class AssetData<T> {
    res: T;
    refCount: number;
}

export class AssetItem {

    public prefabMap: Map<string, Prefab>;
    public audioMap: Map<string, AudioClip>;
    public spriteFrameMap: Map<string, SpriteFrame>;
    public skeletonMap: Map<string,sp.SkeletonData>;
    public MaterialMap: Map<string,Material>;
    public assetBundle: AssetManager.Bundle;
    public bundleName: string;

    constructor(bundleName: string, assetBundle: AssetManager.Bundle) {
        this.assetBundle = assetBundle;
        this.prefabMap = new Map<string, Prefab>();
        this.audioMap = new Map<string, AudioClip>();
        this.spriteFrameMap = new Map<string, SpriteFrame>();
        this.skeletonMap = new Map<string, sp.SkeletonData>();
        this.MaterialMap = new Map<string, Material>();
        this.bundleName = bundleName;
    }

    preloadType<T extends Component>(type: T) {

    }

    preLoadRes(path: string, asset: typeof Asset){
        if (!this.prefabMap.has(path)) {
            this.loadRes(path, asset);
        }
    }

    async getPrefab(path: string): Promise<Prefab> {
        if (!this.prefabMap.has(path)) {
            return await this.loadRes(path, Prefab);
        } else {
            return this.prefabMap.get(path)
        }
    }

    async getSpine(url: string): Promise<sp.SkeletonData> {
        if (!this.skeletonMap.has(url)) {
            return await this.loadRes<sp.SkeletonData>(url, sp.SkeletonData);
        } else {
            return this.skeletonMap.get(url)
        }

    }

    async getMaterial(url: string): Promise<Material> {
        if (!this.skeletonMap.has(url)) {
            return await this.loadRes<Material>(url,Material);
        } else {
            return this.MaterialMap.get(url)
        }
    }

    async getAudio(path: string): Promise<AudioClip> {

        if (!this.audioMap.has(path)) {
            return await this.loadRes(path,AudioClip);
        } else {
            return this.audioMap.get(path)
        }
    }

    async getSpriteFrame(path: string): Promise<SpriteFrame | undefined> {

        if (!this.spriteFrameMap.has(path)) {
            return await this.loadRes(path, SpriteFrame);
        } else {
            return this.spriteFrameMap.get(path)
        }
    }


    async loadRes<T extends Asset>(path: string, type: typeof Asset): Promise<T | undefined> {
        return new Promise((resolve) => {
            this.assetBundle.load(path, type, (err, asset: T) => {
                if (err) {
                    console.log("资源加载失败: url:", path, '错误日志:', err);
                    resolve(undefined)
                } else {
                    resolve(asset);
                }
            });
        });
    }

    defRes<T extends Asset>(type: T, name: string): Promise<T | undefined> {
        return null;
    }

    clearAllRes() {
        let bundle = assetManager.getBundle(this.bundleName)
        assetManager.removeBundle(bundle);

        this.prefabMap.forEach((value, key) => {
            assetManager.releaseAsset(value);
        });

        this.audioMap.forEach((value, key) => {
            assetManager.releaseAsset(value);
        });

        this.spriteFrameMap.forEach((value, key) => {
            assetManager.releaseAsset(value);
        });

        this.skeletonMap.forEach((value, key) => {
            assetManager.releaseAsset(value);
        });

        this.MaterialMap.forEach((value, key) => {
            assetManager.releaseAsset(value);
        });

    }

    releaseBundle() {
        // cc.assetManager.assets.remove();
        // cc.loader.release();
    }



}
