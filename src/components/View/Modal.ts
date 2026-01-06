import {ensureElement} from "../../utils/utils.ts";
import {Component} from "../base/Component.ts"
import type { IEvents } from "../base/Events.ts";

interface ModalWindow {}

export class Modal extends Component<ModalWindow>{
    protected contentElement: HTMLElement;
    protected closeButton: HTMLButtonElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this.contentElement = ensureElement<HTMLElement>('.modal__content', this.container);
        this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);

        //закрытие по кнопке
        this.closeButton.addEventListener('click', (event) => {
            this.events.emit('modal:close', event);
        });

        //закрытие по оверлею
        this.container.addEventListener('click',(event) => {
            if(event.target === this.container) {
                this.events.emit('modal:close', event);
            }
        } )

    }

    set content(value: HTMLElement) {
        this.contentElement.replaceChildren(value);
    }
    // открытия модалки
    open() {
        this.container.classList.add('modal_active');
    }

    //закрытия модалки
    close() {
        this.container.classList.remove('modal_active');
    }
}