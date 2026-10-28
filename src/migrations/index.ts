import * as migration_20261028_181419_initial from './20261028_181419_initial';
import * as migration_20261028_193025_phase_a_ordering_rules from './20261028_193025_phase_a_ordering_rules';
import * as migration_20261028_194747_phase_b_menu_options from './20261028_194747_phase_b_menu_options';

export const migrations = [
  {
    up: migration_20261028_181419_initial.up,
    down: migration_20261028_181419_initial.down,
    name: '20261028_181419_initial',
  },
  {
    up: migration_20261028_193025_phase_a_ordering_rules.up,
    down: migration_20261028_193025_phase_a_ordering_rules.down,
    name: '20261028_193025_phase_a_ordering_rules',
  },
  {
    up: migration_20261028_194747_phase_b_menu_options.up,
    down: migration_20261028_194747_phase_b_menu_options.down,
    name: '20261028_194747_phase_b_menu_options'
  },
];
