// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { _decorator, Component, Node, SpriteComponent, AudioSourceComponent, builtinResMgr, director, Font, instantiate, LabelComponent, loader, log, Material, ModelComponent, Prefab, SpriteAtlas, SpriteFrame, Texture2D, TextureCube, UIModelComponent, assetManager, resources, Asset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PreloadAssets')
export class PreloadAssets extends Component {
    private _curType = "";
    private _lastType = "";
    private _btnLabel = null;
    private _audioSource = null;
    private _isLoading = false;
    private _urls = {
        Audio: "test_assets/audio",
        Txt: "test_assets/text",
        ImageAsset: "test_assets/PurpleMonster",
        Texture2D: "test_assets/PurpleMonster/texture",
        Font: "test_assets/font",
        SpriteAtlas: "test_assets/atlas",
        SpriteFrame: "test_assets/image/spriteFrame",
        Prefab: "test_assets/prefab",
        Animation: "test_assets/testAnim",
        Scene: "test_assets/testScene",
        TextureCube: "test_assets/cubemap",
        Material: "test_assets/testMat",
        Mesh: "test_assets/Monster/monster",
        Skeleton: "test_assets/Monster/Armature",
        Dir: 'test_assets'
    };

    @property({ type: Node })
    showWindow = null;

    @property({ type: LabelComponent})
    loadTips: LabelComponent = null;

    @property({ type: [Node] })
    loadList = [];

    @property({ type: Prefab })
    loadAnimTestPrefab = null;

    @property({ type: SpriteFrame })
    loadMaterialSpriteFrame = null;

    // use this for initialization
    onLoad () {
        // registered event
        this._onRegisteredEvent();
    }

    onDestroy () {

    }

    _onRegisteredEvent () {
        for (var i = 0; i < this.loadList.length; ++i) {
            this.loadList[i].on(Node.EventType.TOUCH_END, this._onClick.bind(this));
        }
    }

    _onClick (event: any) {
        if (this._isLoading) {
            return;
        }

        this._onClear();

        this._curType = event.target.name.split('_')[1];
        if (this._lastType !== "" && this._curType === this._lastType) {
            this.loadTips.string = ''
            this._onShowResClick(event);
            return;
        }

        if (this._btnLabel) {
            this._btnLabel.string = "已加载 " + this._lastType;
        }

        this._lastType = this._curType;

        this._btnLabel = event.target.getChildByName("Label").getComponent(LabelComponent);

        this.loadTips.string = this._curType + " Loading....";
        this._isLoading = true;

        this._load();
    }

    _load () {
        var url = this._urls[this._curType];
        var loadCallBack = this._loadCallBack.bind(this);
        switch (this._curType) {
            case 'SpriteFrame':
                // specify the type to load sub asset from texture's url
                resources.preload(url, SpriteFrame, loadCallBack);
                break;
            case 'Texture2D':
                resources.preload(url, Texture2D, loadCallBack);
                break;
            case 'TextureCube':
                resources.preload(url, TextureCube, loadCallBack);
                break;
            case 'Font':
                resources.preload(url, Font, loadCallBack);
                break;
            case 'SpriteAtlas':
                resources.preload(url, SpriteAtlas, loadCallBack);
                break;
            case 'Animation':
            case 'Prefab':
            case 'EffectAsset':
            case 'Skeleton':
            case 'Mesh':
            case 'ImageAsset':
            case 'Txt':
            case 'Audio':
            case 'Material':
            case 'Skeleton':
                resources.preload(url, loadCallBack);
                break;
            case 'Scene':
                director.preloadScene('LoadRes');
                break;
            case 'Dir':
                resources.preloadDir(url, loadCallBack);
                break;
            default:
                break;
        }
    }

    _loadCallBack (err) {
        this._isLoading = false;
        if (err) {
            log('Error url [' + err + ']');
            return;
        }
        if (this._curType === "Audio") {
            this._btnLabel.string = "播放";
        }
        else {
            this._btnLabel.string = "创建";
        }
        this._btnLabel.string += this._curType;
        this.loadTips.string = this._curType + " Preloaded Successfully!";
    }

    _onClear () {
        this.showWindow.removeAllChildren(true);
        if (this._audioSource && this._audioSource instanceof AudioSourceComponent) {
            this._audioSource.stop();
        }
    }

    _onShowResClick (event: any) {
        var url = this._urls[this._curType];
        switch (this._curType) {
            case 'SpriteFrame':
                // specify the type to load sub asset from texture's url
                resources.load(url, SpriteFrame, (err, asset) => this._createNode(this._curType, asset));
                break;
            case 'Texture2D':
                resources.load(url, Texture2D, (err, asset) => this._createNode(this._curType, asset));
                break;
            case 'TextureCube':
                resources.load(url, TextureCube, (err, asset) => this._createNode(this._curType, asset));
                break;
            case 'Font':
                resources.load(url, Font, (err, asset) => this._createNode(this._curType, asset));
                break;
            case 'SpriteAtlas':
                resources.load(url, SpriteAtlas, (err, asset) => this._createNode(this._curType, asset));
                break;
            case 'Animation':
            case 'Prefab':
            case 'EffectAsset':
            case 'Skeleton':
            case 'Mesh':
            case 'ImageAsset':
            case 'Txt':
            case 'Audio':
            case 'Material':
            case 'Skeleton':
                resources.load(url, (err, asset) => this._createNode(this._curType, asset));
                break;
            case 'Scene':
                director.loadScene('LoadRes');
                break;
            case 'Dir':
                resources.loadDir(url, (err, asset) => {
                    this.loadTips.string = "The asset loaded: ";
                    asset.forEach((r) => this.loadTips.string += `${r.name};`);
                });
                break;
            default:
                break;
        }
    }

    _createNode (type: string, res: any) {
        this.loadTips.string = "";
        const node = new Node("New " + type);
        node.setPosition(0, 0, 0);
        let component = null;
        switch (this._curType) {
            case "SpriteFrame":
                component = node.addComponent(SpriteComponent);
                component.spriteFrame = res;
                break;

            case "SpriteAtlas":
                component = node.addComponent(SpriteComponent);
                component.spriteFrame = res.getSpriteFrames()[0];
                break;
            case "Texture2D":
                let cube = instantiate(this.loadAnimTestPrefab);
                const model = cube.getComponent(ModelComponent);
                model.material.setProperty('albedoMap', res);
                cube.setPosition(0, 0, 50);
                cube.setScale(100, 100, 100);
                cube.parent = this.showWindow;
                break;
            case 'ImageAsset':
                component = node.addComponent(SpriteComponent);
                const spriteFrame = new SpriteFrame();
                const tex = new Texture2D();
                tex.image = res;
                spriteFrame.texture = tex;
                component.spriteFrame = spriteFrame;
                break;
            case "Audio":
                component = node.addComponent(AudioSourceComponent);
                component.clip = res;
                component.play();
                this._audioSource = component;
                this.loadTips.string = "播放音乐。";
                break;
            case "Txt":
                component = node.addComponent(LabelComponent);
                component.lineHeight = 40;
                component.string = res.text;
                break;
            case "Material":
                component = node.addComponent(SpriteComponent);
                component.sharedMaterials = res;
                component.spriteFrame = this.loadMaterialSpriteFrame;
                break;
            case "Font":
                component = node.addComponent(LabelComponent);
                component.font = res;
                component.lineHeight = 40;
                component.string = "This is BitmapFont!";
                break;
            case 'Mesh':
                component = node.addComponent(ModelComponent);
                node.addComponent(UIModelComponent);
                node.setPosition(0, 0, 50);
                node.setScale(5, 5, 5);
                component.mesh = res;
                component.material = builtinResMgr.get<Material>('standard-material');
                break;
            case "Prefab":
                let prefab = instantiate(res);
                prefab.parent = node;
                prefab.setPosition(0, 0, 0);
                break;
            default:
                this.loadTips.string = "此项没有展示效果";
                break;
        }
        this.showWindow.addChild(node);
    }
}
