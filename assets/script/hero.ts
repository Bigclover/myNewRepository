import { _decorator} from 'cc';
import { creature } from './creature';

const { ccclass, property } = _decorator;

@ccclass('hero')
export class hero extends creature {

    start() {
        super.start();
        
    }

    update(deltaTime: number) {
        // super.update(deltaTime);

    }
}

