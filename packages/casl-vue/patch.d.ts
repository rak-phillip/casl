import { AnyAbility } from '@casl/ability';

declare module 'vue/runtime-core' {
  export interface ComponentOptions {
    ability?: AnyAbility;
  }

  export interface ComponentCustomProperties {
    $ability: AnyAbility
    $can(this: this, ...args: Parameters<this['$ability']['can']>): boolean
  }
}
