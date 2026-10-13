import { colors } from '@/core/theme/tokens';

/**
 * HomeOS modules. Each household feature registers here so the More tab,
 * dashboard and future settings can list it without screens knowing about
 * each other. Planned modules show as "Coming next" instead of hiding, so the
 * app never looks broken while they are being built.
 *
 * To add a module: create src/features/<id>/, add its routes under
 * src/app/<id>/, then flip its status to 'available' and set `href`.
 */
export type ModuleStatus = 'available' | 'planned';

export type HomeModule = {
  id: string;
  title: string;
  description: string;
  icon: string; // Ionicons name
  color: string;
  status: ModuleStatus;
  href?: string;
  /** PRD phase or scope note shown on planned modules. */
  phase?: string;
};


export const MODULES: HomeModule[] = [
  {
    id: 'meals',
    title: 'Meal planner',
    description: 'Daily and weekly meals, recipes',
    icon: 'restaurant',
    color: colors.accent,
    status: 'available',
    href: '/meals',
  },
  {
    id: 'smart-home',
    title: 'Smart home',
    description: 'Rooms, lights, plugs and scenes via Home Assistant',
    icon: 'home',
    color: colors.blue,
    status: 'available',
    href: '/rooms',
  },
  {
    id: 'kitchen',
    title: 'Kitchen & groceries',
    description: 'Inventory, shopping list, naira budget',
    icon: 'basket',
    color: colors.green,
    status: 'planned',
    phase: 'Phase 2',
  },
  {
    id: 'exercise',
    title: 'Exercise routine',
    description: 'Your weekly workout plan and daily session',
    icon: 'barbell',
    color: colors.red,
    status: 'planned',
    phase: 'After first slice',
  },
  {
    id: 'wardrobe',
    title: 'Wardrobe',
    description: 'Outfits from clothes you own, what to buy next',
    icon: 'shirt',
    color: colors.indigo,
    status: 'planned',
    phase: 'After first slice',
  },
  {
    id: 'energy',
    title: 'Energy & inverter',
    description: 'Only real readings from supported hardware',
    icon: 'flash',
    color: colors.yellow,
    status: 'planned',
    phase: 'Phase 4, after hardware is chosen',
  },
  {
    id: 'reminders',
    title: 'Household reminders',
    description: 'Cooking, defrost and chore reminders',
    icon: 'alarm',
    color: colors.teal,
    status: 'planned',
    phase: 'Phase 3',
  },
];
