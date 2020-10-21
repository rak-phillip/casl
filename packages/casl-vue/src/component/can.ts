import { defineComponent, VNode } from 'vue';
import { SubjectType, Generics, AnyAbility, Abilities, IfString, AbilityTuple } from '@casl/ability';

type AbilityCanProps<
  T extends Abilities,
  Else = IfString<T, { do: T } | { I: T }>
> = T extends AbilityTuple
  ? { do: T[0], on: T[1], field?: string } |
  { I: T[0], a: Extract<T[1], SubjectType>, field?: string } |
  { I: T[0], an: Extract<T[1], SubjectType>, field?: string } |
  { I: T[0], this: Exclude<T[1], SubjectType>, field?: string }
  : Else;

export type AllCanProps<T extends AnyAbility> = AbilityCanProps<Generics<T>['abilities']> & {
  not?: boolean,
  passThrough?: boolean
};

export default defineComponent({
  name: 'Can',
  functional: true,
  props: {
    I: String,
    do: String,
    a: [String, Function],
    an: [String, Function],
    this: [String, Function, Object],
    on: [String, Function, Object],
    not: Boolean,
    passThrough: Boolean,
    field: String
  },
  render(): VNode | VNode[] {
    const mixed = this.$props as any;
    const [action, field] = (mixed.I || mixed.do || '').split(' ');
    const subject = mixed.of || mixed.an || mixed.a || mixed.this || mixed.on;

    if (!action) {
      throw new Error('[Vue Can]: neither `I` nor `do` prop was passed in <Can>');
    }

    const isAllowed = this.$parent.$can(action, subject, field); // TODO: Parent might be null
    const canRender = this.not ? !isAllowed : isAllowed;

    if (!this.passThrough) {
      return canRender ? children : []; // TODO: we no longer have access to children without refs...
    }

    if (!this.$slots || !this.$slots.default) {
      throw new Error('[Vue Can]: `passThrough` expects default scoped slot to be specified');
    }

    // TODO: Type error
    return this.$slots.default({
      allowed: canRender,
      ability: this.$parent.$ability,
    }) as VNode;
  }
});
