import * as migration_20261114_175712_initial from './20261114_175712_initial';

export const migrations = [
  {
    up: migration_20261114_175712_initial.up,
    down: migration_20261114_175712_initial.down,
    name: '20261114_175712_initial'
  },
];
