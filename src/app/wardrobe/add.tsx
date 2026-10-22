import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';

import { useDataVersion, useDb } from '@/core/db/DatabaseProvider';
import { colors, spacing } from '@/core/theme/tokens';
import { CATEGORY_LABEL, WARDROBE_CATEGORIES, type WardrobeCategory } from '@/features/wardrobe/logic';
import { addWardrobeItem } from '@/features/wardrobe/repository';
import { Button, Chip, Text, TextField } from '@/ui';

export default function AddClothingScreen() {
  const db = useDb();
  const { bump } = useDataVersion();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WardrobeCategory>('top');
  const [colour, setColour] = useState('');
  const [light, setLight] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!name.trim()) {
      setError('Give it a name, like "Linen shirt".');
      return;
    }
    await addWardrobeItem(db, { name, category, colour: colour || null, lightFabric: light });
    bump();
    router.back();
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.root} keyboardShouldPersistTaps="handled">
      <TextField label="Name" value={name} onChangeText={setName} placeholder="Linen shirt" error={error} autoFocus />
      <View style={styles.chips}>
        {WARDROBE_CATEGORIES.map((c) => (
          <Chip key={c} label={CATEGORY_LABEL[c]} selected={category === c} onPress={() => setCategory(c)} />
        ))}
      </View>
      <TextField label="Colour" value={colour} onChangeText={setColour} placeholder="Olive" />
      <View style={styles.switchRow}>
        <Text variant="body" style={{ flex: 1 }}>
          Light, breathable fabric
        </Text>
        <Switch value={light} onValueChange={setLight} trackColor={{ true: colors.green }} />
      </View>
      <Button label="Save" onPress={save} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { padding: spacing.lg, gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  switchRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
});
