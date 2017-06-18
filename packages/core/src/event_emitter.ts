import { Subject } from 'rxjs/Subject';

export class EventEmitter<T> extends Subject<T>{
    __isAsync: boolean;

    constructor(isAsync: boolean = false) {
        super();
        this.__isAsync = isAsync;
    }

    emit(value?: any) { super.next(value) }

    subscribe(generatorOrNext?: any, error?: any, complete?: any): any {
        let schedulerFn: (t: any) => any;
        let errorFn = (err: any): any => null;
        let completeFn = (): any => null;

        if (generatorOrNext && typeof generatorOrNext === 'object') {
            schedulerFn = this.__isAsync ? (value: any) => {
                setTimeout(() => generatorOrNext.next(value));
            } : (value: any) => { generatorOrNext.next(value) };

            if (generatorOrNext.error) {
                errorFn = this.__isAsync ? (err) => { setTimeout(() => generatorOrNext.error(err)); } :
                    (err) => { generatorOrNext.error(err); };
            }

            if (generatorOrNext.complete) {
                completeFn = this.__isAsync ? () => { setTimeout(() => generatorOrNext.complete()); } :
                    () => { generatorOrNext.complete(); };
            }
        } else {
            schedulerFn = this.__isAsync ? (value: any) => { setTimeout(() => generatorOrNext(value)); } :
                (value: any) => { generatorOrNext(value); };

            if (error) {
                errorFn =
                    this.__isAsync ? (err) => { setTimeout(() => error(err)); } : (err) => { error(err); };
            }

            if (complete) {
                completeFn =
                    this.__isAsync ? () => { setTimeout(() => complete()); } : () => { complete(); };
            }
        }

        return super.subscribe(schedulerFn, errorFn, completeFn);
    }
}