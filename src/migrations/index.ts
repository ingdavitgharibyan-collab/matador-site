import * as migration_20261028_181419_initial from './20261028_181419_initial';
import * as migration_20261028_193025_phase_a_ordering_rules from './20261028_193025_phase_a_ordering_rules';

export const migrations = [
  {
    up: migration_20261028_181419_initial.up,
    down: migration_20261028_181419_initial.down,
    name: '20261028_181419_initial',
  },
  {
    up: migration_20261028_193025_phase_a_ordering_rules.up,
    down: migration_20261028_193025_phase_a_ordering_rules.down,
    name: '20261028_193025_phase_a_ordering_rules'
  },
];
