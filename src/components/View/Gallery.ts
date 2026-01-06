import {Component} from "../base/Component.ts"

interface GalleryData {
    catalog: HTMLElement[];
}

export class Gallery extends Component<GalleryData> {

    constructor(container: HTMLElement) {
        super(container);
    }

    set catalog (value: HTMLElement[]) {
        this.container.replaceChildren(...value);
    }
}