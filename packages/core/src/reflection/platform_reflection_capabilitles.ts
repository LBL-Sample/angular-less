
import { Type } from "../type";
import { GetterFn,SetterFn,MethodFn } from "./types";

export interface PlatfromReflectionCapabilities {
    isReflectionEnable(): boolean;
    factory(type: Type<any>): Function;
    hasLifecycleHook(type: any, lcProperty: string): boolean;
    parameters(type:Type<any>):any[][];
    annotations(type:Type<any>):any[];
    propMetadata(typeOrFunc:Type<any>):{[key:string]:any[]};
    getter(name:string):GetterFn;
    setter(name:string):SetterFn;
    method(name:string):MethodFn;
    importUri(type:Type<any>):string;
    resourceUri(type:Type<any>):string;
    resolveIdentifier(name:string,moduleUrl:string,members:string[],runtime:any):any;
    resolveEnum(enumIdentifier:any,name:string):any;
}