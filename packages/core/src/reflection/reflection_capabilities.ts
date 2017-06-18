
import { Type,isType } from "../type";
import { global,stringify } from "../util";
import { PlatfromReflectionCapabilities } from "./platform_reflection_capabilitles";
import { GetterFn,SetterFn,MethodFn } from "./types";


export const DELEGATE_CTOR = /^function\s+\S+\(\)\s*{[\s\S]+\.apply\(this,\s*arguments\)/;

export class ReflectionCapabilities implements PlatfromReflectionCapabilities{
    private _reflect :any;
    constructor(reflect?:any){this._reflect= reflect||global['Reflect']};

    isReflectionEnable(): boolean { return true; }

    factory<T>(t: Type<T>): (args: any[]) => T { return (...args: any[]) => new t(args); }

    _zipTypesAndAnnotations(paramTypes: any[], paramAnnotations: any[]): any[][] {
        let result: any[][];

        if(typeof paramTypes ==='undefined'){
            result = new Array(paramAnnotations.length);
        }else{
            result = new Array(paramTypes.length);
        }

        for (var i = 0; i < result.length; i++) {
            if(typeof paramTypes==='undefined'){
                result[i]=[];
            }else if(paramTypes[i]!=Object){
                result[i] = [paramTypes[i]];
            }else{
                result[i]=[];
            }

            if(paramAnnotations&&paramAnnotations[i]!=null){
                result[i]= result[i].concat(paramAnnotations[i]);
            }
        }

        return result;
    }
    private _ownParameters(type: Type<any>, parentCtor: any): any[][] | null {
        if (DELEGATE_CTOR.exec(type.toString())) {
            return null;
        }

        //TODO:parameters direct API

        //TODO:parentCtor.ctorParameters

        if(this._reflect!=null&&this._reflect.getOwnMetadata!=null){
            const paramAnnotations = this._reflect.getOwnMetadata('parameters',type);
            const paramTypes = this._reflect.getOwnMetadata('design:paramtypes',type);
            if(paramTypes||paramAnnotations){
                this._zipTypesAndAnnotations(paramTypes,paramAnnotations);
            }
        }

        return new Array(<any>type.length).fill(undefined);

    }

    parameters(type:Type<any>):any[][]{
        if(!isType(type)){
            return [];
        }

        const parentCtor = getParentCtor(type);
        let parameters = this._ownParameters(type,parentCtor);
        if(!parameters&&parentCtor!==Object){
            parameters = this.parameters(parentCtor);
        }
        return parameters || [];
    }

    private _ownAnnotations(typeOrFunc:Type<any>,parentCtor:any):any[]|null{
        //TODO:annocations direct API
        //TOOD:decorators 

        if (this._reflect && this._reflect.getOwnMetadata) {
            return this._reflect.getOwnMetadata('annotations', typeOrFunc);
        }
        return null;
    }

    annotations(typeOrFunc:Type<any>):any[]{
        if(!isType(typeOrFunc)){
            return [];
        }
        const parentCtor = getParentCtor(typeOrFunc);
        const ownAnnotations = this._ownAnnotations(typeOrFunc, parentCtor) || [];
        const parentAnnotations = parentCtor !== Object ? this.annotations(parentCtor) : [];
        return parentAnnotations.concat(ownAnnotations);
    }

    private _ownPropMetadata(typeOrFunc: any, parentCtor: any): { [key: string]: any[] |null } {
        //TODO: typeOfFunc.propMetadata
        //TODO: typeOfFunc.propDecorators

        if (this._reflect != null && this._reflect.getOwnMetadata != null) {
            return this._reflect.getOwnMetadata('propMetadata',typeOrFunc);
        }
        return null;
    }

    
    propMetadata(typeOrFunc:any):{[key:string]:any}{
        if(!isType(typeOrFunc)){
            return {};
        }
        const parentCtor = getParentCtor(typeOrFunc);
        const propMetadata: { [key: string]: any } = {};
        if(parentCtor!==Object){
            const parentPropMetadata = this.propMetadata(parentCtor);
            Object.keys(parentPropMetadata).forEach((propName)=>{
                propMetadata[propName]=parentPropMetadata[propName];
            });
        }
        const ownPropMetadata= this._ownPropMetadata(typeOrFunc,parentCtor);
        if(ownPropMetadata){
            Object.keys(ownPropMetadata).forEach((propName)=>{
                const decorators:any[] =[];
                if(propMetadata.hasOwnProperty(propName)){
                    decorators.push(...propMetadata[propName]);
                }
                decorators.push(...ownPropMetadata[propName]);
                propMetadata[propName] = decorators;
            });
        }
        return propMetadata;
    }

    hasLifecycleHook(type:any,lcProperty:string):boolean{
        return type instanceof Type &&  lcProperty in type.prototype;
    }

    getter(name: string): GetterFn { return <GetterFn>new Function('o', 'return o.' + name + ";") }

    setter(name:string):SetterFn{
        return <SetterFn>new Function('o', 'v', 'return o.' + name + '=v;');
    }

    method(name: string): MethodFn {
        const functionBody = `if (!o.${name}) throw new Error('"${name}" is undefined');
        return o.${name}.apply(o, args);`;
        return <MethodFn>new Function('o', 'args', functionBody);
    }

// There is not a concept of import uri in Js, but this is useful in developing Dart applications.
  importUri(type: any): string {
    // StaticSymbol
    if (typeof type === 'object' && type['filePath']) {
      return type['filePath'];
    }
    // Runtime type
    return `./${stringify(type)}`;
  }

  resourceUri(type: any): string { return `./${stringify(type)}`; }

  resolveIdentifier(name: string, moduleUrl: string, members: string[], runtime: any): any {
    return runtime;
  }
  resolveEnum(enumIdentifier: any, name: string): any { return enumIdentifier[name]; }
}

function getParentCtor(ctor:Function):Type<any>{
    const parentProto = Object.getPrototypeOf(ctor.prototype);
    const parentCtor = parentProto ? parentProto.constructor : null;

    return parentCtor || null;
}
