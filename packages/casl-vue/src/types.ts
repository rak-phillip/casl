import { App as Application } from 'vue'; // TODO: Find correct type to import
import '@casl/vue/patch'; // eslint-disable-line import/no-unresolved

// @ts-ignore
export type VueAbility = Application['$ability'];
