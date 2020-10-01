import { App as Application, reactive } from 'vue';
import { VueAbility } from './types';

const WATCHERS = new WeakMap();

function renderingDependencyFor(app: Application, ability: VueAbility) {
  if (WATCHERS.has(ability)) {
    return WATCHERS.get(ability);
  }

  const data = { _touch: true }; // eslint-disable-line no-underscore-dangle
  const watcher = reactive(data);

  ability.on('updated', () => {
    // eslint-disable-next-line no-underscore-dangle
    watcher._touch = !watcher._touch;
  });
  WATCHERS.set(ability, watcher);

  return watcher;
}

function abilityDescriptor(ability?: VueAbility) {
  if (ability) {
    return { value: ability };
  }

  return {
    get() {
      throw new Error('Please provide `Ability` instance either in `abilitiesPlugin` or in ComponentOptions');
    }
  };
}

export function abilitiesPlugin(app: Application, defaultAbility?: VueAbility) {
  Object.defineProperty(app.config.globalProperties, '$ability', abilityDescriptor(defaultAbility));

  app.mixin({
    beforeCreate() {
      const { ability, parent } = this.$options;
      const localAbility = ability || (parent ? parent.$ability : null);

      if (localAbility) {
        Object.defineProperty(this, '$ability', { value: localAbility });
      }
    },

    methods: {
      $can(...args: any): boolean {
        const dep = renderingDependencyFor(app, this.$ability);
        dep._touch = dep._touch; // eslint-disable-line
        return this.$ability.can(...args);
      }
    }
  });
}
