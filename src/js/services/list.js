import { firebaseConfig } from "../config/firebase";
export class OptionListService {

    constructor() {
    }

    saveList(name, list) {
        JSON.stringify(list);
        localStorage.setItem(name, list)
    }

    getList(name, list) {
        const list = localStorage.getItem(name, list);
        return JSON.parse(list);
    }

}