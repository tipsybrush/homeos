import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { addDays, isDateKey, parseTime, relativeDayLabel, type DateKey } from '@/core/dates';
import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';
import { formatNaira, parseNairaInput } from '@/core/money';
import { colors, radius, spacing, webTopInset } from '@/core/theme/tokens';
import { statusMeta } from '@/features/meals/components/MealCard';
import { useRecipes } from '@/features/meals/hooks';
import { categoryLabel, findDuplicate, MAX_SERVINGS, validateDraft, type DraftErrors } from '@/features/meals/logic';
import { createMeal, deleteMeal, duplicateMeal, getMeal, listMealsForDate, updateMeal } from '@/features/meals/repository';
import { MEAL_CATEGORIES, MEAL_STATUSES, type MealDraft, type MealStatus } from '@/features/meals/types';
import { useToday } from '@/hooks/useToday';
import { Button, Chip, confirmAsync, Glass, notify, Text, TextField } from '@/ui';

type Params = { id: string; date?: string; category?: string; recipeId?: string };

export default function MealEditor() {
  const params = useLocalSearchParams<Params>();
  const isNew = params.id === 'new';
  const db = useDb();
  const { bump } = useDataVersion();
  const { today } = useToday();
  const insets = useSafeAreaInsets();
  const recipes = useRecipes();

  const [loaded, setLoaded] = useState(isNew);
  const [date, setDate] = useState<DateKey>(params.date && isDateKey(params.date) ? params.date : today);
  const [category, setCategory] = useState<string>(params.category ?? defaultCategory());
  const [customCategory, setCustomCategory] = useState('');
  const [recipeId, setRecipeId] = useState<string | null>(params.recipeId ?? null);
  const [customName, setCustomName] = useState('');
  const [servings, setServings] = useState(2);
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<MealStatus>('planned');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState('');
  const [errors, setErrors] = useState<DraftErrors>({});
  const [saving, setSaving] = useState(false);
  const [recipeQuery, setRecipeQuery] = useState('');

  useEffect(() => {
    if (isNew) return;
    getMeal(db, params.id).then((m) => {
      if (!m) {
        notify('Meal not found', 'It may have been deleted.');
        router.back();
        return;
      }
      setDate(m.date);
      if ((MEAL_CATEGORIES as readonly string[]).includes(m.mealCategory)) setCategory(m.mealCategory);
      else {
        setCategory('custom');
        setCustomCategory(m.mealCategory);
      }
      setRecipeId(m.recipeId);
      setCustomName(m.customMealName ?? '');
      setServings(m.servings);
      setTime(m.scheduledTime ?? '');
      setStatus(m.status);
      setNotes(m.notes);
      setCost(m.estimatedCostKobo != null ? String(m.estimatedCostKobo / 100) : '');
      setLoaded(true);
    });
  }, [db, isNew, params.id]);

  const filteredRecipes = useMemo(() => {
    const q = recipeQuery.trim().toLowerCase();
    const cat = category as (typeof MEAL_CATEGORIES)[number];
    const list = recipes.data.filter((r) => !q || r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q));
    // Suggest recipes that suit this meal type first.
    return [...list].sort((a, b) => Number(b.mealCategories.includes(cat)) - Number(a.mealCategories.includes(cat)));
  }, [recipes.data, recipeQuery, category]);

  const draft = (): MealDraft => {
    const parsedCost = parseNairaInput(cost);
    return {
      date,
      mealCategory: category === 'custom' ? customCategory : category,
      recipeId,
      customMealName: recipeId ? null : customName,
      servings,
      scheduledTime: parseTime(time),
      status,
      notes,
      estimatedCostKobo: parsedCost,
    };
  };

  const save = async () => {
    const d = draft();
    const errs = validateDraft(d, time);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const existing = await listMealsForDate(db, d.date);
    const dup = findDuplicate(d, existing, isNew ? undefined : params.id);
    if (dup) {
      const ok = await confirmAsync('Already planned', `This meal is already on ${relativeDayLabel(d.date, today).toLowerCase()}’s ${d.mealCategory}. Add it again?`, 'Add anyway');
      if (!ok) return;
    }
    setSaving(true);
    try {
      if (isNew) await createMeal(db, d);
      else await updateMeal(db, params.id, d);
      bump();
      router.back();
    } catch (e) {
      notify('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const ok = await confirmAsync('Delete this meal?', 'This cannot be undone.', 'Delete', true);
    if (!ok) return;
    await deleteMeal(db, params.id);
    bump();
    router.back();
  };

  const duplicateTo = async (target: DateKey) => {
    await duplicateMeal(db, params.id, target);
    bump();
    notify('Copied', `Added to ${relativeDayLabel(target, today).toLowerCase()}.`);
  };

  if (!loaded) return null;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen
        options={{
          title: isNew ? 'New meal' : 'Edit meal',
          headerLeft: () => (
            <Pressable onPress={() => router.back()} hitSlop={10} accessibilityRole="button">
              <Text variant="body" tone="accent">
                Cancel
              </Text>
            </Pressable>
          ),
          headerRight: () => (
            <Pressable onPress={save} disabled={saving} hitSlop={10} accessibilityRole="button">
              <Text variant="headline" tone="accent">
                {isNew ? 'Add' : 'Save'}
              </Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}>
        <Field label="Day">
          <Glass style={styles.stepper}>
            <StepBtn icon="chevron-back" label="Previous day" onPress={() => setDate(addDays(date, -1))} />
            <Text variant="headline" style={styles.stepValue}>
              {relativeDayLabel(date, today)}
            </Text>
            <StepBtn icon="chevron-forward" label="Next day" onPress={() => setDate(addDays(date, 1))} />
          </Glass>
        </Field>

        <Field label="Meal" error={errors.category}>
          <View style={styles.chips}>
            {MEAL_CATEGORIES.map((c) => (
              <Chip key={c} label={categoryLabel(c)} selected={category === c} onPress={() => setCategory(c)} />
            ))}
            <Chip label="Custom" selected={category === 'custom'} onPress={() => setCategory('custom')} />
          </View>
          {category === 'custom' && (
            <TextField label="Custom meal type" placeholder="e.g. Pre-workout" value={customCategory} onChangeText={setCustomCategory} />
          )}
        </Field>

        <Field label="What are you eating?" error={errors.name}>
          {recipeId ? (
            <Glass style={styles.selectedRecipe}>
              <Ionicons name="book-outline" size={20} color={colors.accent} />
              <Text variant="headline" style={{ flex: 1 }}>
                {recipes.data.find((r) => r.id === recipeId)?.name ?? 'Recipe'}
              </Text>
              <Pressable onPress={() => setRecipeId(null)} accessibilityRole="button" accessibilityLabel="Remove recipe" hitSlop={10}>
                <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
              </Pressable>
            </Glass>
          ) : (
            <>
              <TextField
                label="Type a meal, or search your recipes"
                placeholder="e.g. Jollof rice, or Suya from Mallam"
                value={customName}
                onChangeText={(t) => {
                  setCustomName(t);
                  setRecipeQuery(t);
                }}
              />
              <View style={styles.chips}>
                {filteredRecipes.slice(0, 8).map((r) => (
                  <Chip key={r.id} label={r.name} onPress={() => setRecipeId(r.id)} accessibilityLabel={`Use recipe ${r.name}`} />
                ))}
              </View>
            </>
          )}
        </Field>

        <Field label="Servings" error={errors.servings}>
          <Glass style={styles.stepper}>
            <StepBtn icon="remove" label="Fewer servings" onPress={() => setServings((s) => Math.max(1, s - 1))} />
            <Text variant="headline" style={styles.stepValue}>
              {servings}
            </Text>
            <StepBtn icon="add" label="More servings" onPress={() => setServings((s) => Math.min(MAX_SERVINGS, s + 1))} />
          </Glass>
        </Field>

        <TextField
          label="Time (optional)"
          placeholder="e.g. 19:30"
          value={time}
          onChangeText={setTime}
          keyboardType="numbers-and-punctuation"
          error={errors.scheduledTime}
          hint="24-hour time. Used for the dashboard’s Up next list."
        />

        <TextField
          label="Estimated cost (optional)"
          placeholder="₦"
          value={cost}
          onChangeText={setCost}
          keyboardType="decimal-pad"
          error={errors.cost}
          hint={cost && !Number.isNaN(parseNairaInput(cost)) ? formatNaira(parseNairaInput(cost)) : 'Leave blank if you don’t know. HomeOS never guesses prices.'}
        />

        {!isNew && (
          <Field label="Status">
            <View style={styles.chips}>
              {MEAL_STATUSES.map((s) => (
                <Chip key={s} label={statusMeta(s).label} selected={status === s} onPress={() => setStatus(s)} />
              ))}
            </View>
          </Field>
        )}

        <TextField label="Notes (optional)" placeholder="Prep notes, who’s eating…" value={notes} onChangeText={setNotes} multiline style={{ minHeight: 88 }} />

        <Button label={isNew ? 'Add meal' : 'Save changes'} kind="primary" onPress={save} loading={saving} />

        {!isNew && (
          <View style={styles.secondary}>
            <Button label="Copy to tomorrow" onPress={() => duplicateTo(addDays(date, 1))} style={{ flex: 1 }} />
            <Button label="Copy to next week" onPress={() => duplicateTo(addDays(date, 7))} style={{ flex: 1 }} />
          </View>
        )}
        {!isNew && <Button label="Delete meal" kind="destructive" onPress={remove} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function defaultCategory(): string {
  const h = new Date().getHours();
  if (h < 10) return 'breakfast';
  if (h < 15) return 'lunch';
  return 'dinner';
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <Text variant="footnote" tone="secondary" style={{ paddingHorizontal: spacing.xxs }}>
        {label}
      </Text>
      {children}
      {error ? (
        <Text variant="footnote" tone="danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function StepBtn({ icon, label, onPress }: { icon: 'chevron-back' | 'chevron-forward' | 'add' | 'remove'; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.stepBtn} hitSlop={6}>
      <Ionicons name={icon} size={22} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingTop: spacing.md + webTopInset, gap: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md },
  stepBtn: { width: 52, height: 48, alignItems: 'center', justifyContent: 'center' },
  stepValue: { flex: 1, textAlign: 'center' },
  selectedRecipe: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md },
  secondary: { flexDirection: 'row', gap: spacing.xs },
});
