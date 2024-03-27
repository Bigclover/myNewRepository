import { Asset, AssetManager, AudioClip, Material, SpriteFrame, assetManager, sp } from "cc";
import { AssetItem } from "./AssetItem";

export default class AssetsManger {

    private static _instance: AssetsManger;
    public static get instance(): AssetsManger {
        if (this._instance == null) {
            this._instance = new AssetsManger();
        }
        return this._instance;
    }
    bundleMap: Map<string, AssetItem> = new Map<string, AssetItem>();


    preloadBundle(bundleName: string) {

        return new Promise((res, rej) => {
            if (!this.bundleMap.has(bundleName)) {
                assetManager.loadBundle(bundleName, (err, bundle: AssetManager.Bundle) => {
                    if (err) {
                        console.error(err);
                    } else {
                        let item = new AssetItem(bundleName, bundle);
                        this.bundleMap.set(bundleName, item);
                        res(bundle);
                    }
                });
            } else {
                res(this.bundleMap.get(bundleName));
            }
        }).catch((e) => { });
    }

    async preLoadRes(bundleName: string, resName: string, assetType: typeof Asset){
        if (!this.bundleMap.has(bundleName)) {
            await this.preloadBundle(bundleName);
        }
        this.bundleMap.get(bundleName).preLoadRes(resName, assetType)
    }

    async loadPrefab(prefabName: string, bundleName: string) {
        return new Promise(async (res, rej) => {
            if (!this.bundleMap.has(bundleName)) {
                await this.preloadBundle(bundleName);
            }
            try {
                let prefab = await this.bundleMap.get(bundleName).getPrefab(prefabName);
                res(prefab);
            } catch (error) {
                console.error(error);
            }

        }).then().catch((e) => { });
    }

    loadAudio(audioName: string, bundleName: string): Promise<AudioClip> {
        return new Promise(async (res, rej) => {
            if (!this.bundleMap.has(bundleName)) {
                await this.preloadBundle(bundleName);
            }
            try {
                let prefab = await this.bundleMap.get(bundleName).getAudio(audioName);
                res(prefab);
            } catch (error) {
                console.error(error);
            }
        });
    }

    loadImg(imgName: string, bundleName: string = null): Promise<SpriteFrame> {
        return new Promise(async (res, rej) => {
            if (!this.bundleMap.has(bundleName)) {
                await this.preloadBundle(bundleName);
            }
            try {
                let img = await this.bundleMap.get(bundleName).getSpriteFrame(imgName);
                res(img);
            } catch (error) {
                console.error(error);
            }
        });
    }

    loadSpineData(spineName: string, bundleName: string = null): Promise<sp.SkeletonData> {
        return new Promise(async (res, rej) => {
            if (!this.bundleMap.has(bundleName)) {
                await this.preloadBundle(bundleName);
            }
            try {
                let spineData = await this.bundleMap.get(bundleName).getSpine(spineName);
                res(spineData);
            } catch (error) {
                console.error(error);
            }
        });

    }

    loadMaterial(MaterialName: string, bundleName: string = null): Promise<Material> {
        return new Promise(async (res, rej) => {
            if (!this.bundleMap.has(bundleName)) {
                await this.preloadBundle(bundleName);
            }
            try {
                let MaterialData = await this.bundleMap.get(bundleName).getMaterial(MaterialName);
                res(MaterialData);
            } catch (error) {
                console.error(error);
            }
        });

    }

    delPrefab() {

    }

    clearBundle(bundle: string) {
        if (this.bundleMap.has(bundle)) {
            this.bundleMap.get(bundle).clearAllRes();
            this.bundleMap.delete(bundle);
        }
    }

    releaseBundleFun(bundle:AssetManager.Bundle){
        //移除资源
        bundle.load(`image/spriteFrame`, SpriteFrame, function (err, spriteFrame) {
            assetManager.releaseAsset(spriteFrame);
        });

        bundle.release(`image`, SpriteFrame);
        bundle.releaseAll();

        //移除bundle
        //注意：在移除 Asset Bundle 时，并不会释放该 bundle 中被加载过的资源
        let bundle1 = assetManager.getBundle('bundle1');
        bundle1.releaseAll();//先释放资源再释放bundle
        assetManager.removeBundle(bundle1);
    }

    defAudio() {

    }



}
