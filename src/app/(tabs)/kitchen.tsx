import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { weekOf } from "@/core/dates";
import { useDataVersion, useDb } from "@/core/db/DatabaseProvider";
import { formatNaira, parseNairaInput } from "@/core/money";
import { colors, spacing } from "@/core/theme/tokens";
import {
  buildShoppingList,
  categoryTitle,
  type ShoppingLine,
} from "@/features/kitchen/logic";
import {
  addSpend,
  deleteSpend,
  listChecked,
  listPantry,
  listPlannedIngredients,
  listSpend,
  setChecked,
  setInPantry,
  type SpendEntry,
} from "@/features/kitchen/repository";
import { useToday } from "@/hooks/useToday";
import {
  Button,
  confirmAsync,
  Divider,
  EmptyState,
  Glass,
  Screen,
  Section,
  Text,
  TextField,
} from "@/ui";

type Data = {
  list: ShoppingLine[];
  checked: Set<string>;
  pantry: { key: string; name: string }[];
  spend: SpendEntry[];
};

export default function KitchenScreen() {
  const db = useDb();
  const { version, bump } = useDataVersion();
  const { today } = useToday();
  const days = weekOf(today);
  const start = days[0]!;
  const end = days[6]!;
  const [data, setData] = useState<Data>({
    list: [],
    checked: new Set(),
    pantry: [],
    spend: [],
  });
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [showSpend, setShowSpend] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      const [planned, pantry, checked, spend] = await Promise.all([
        listPlannedIngredients(db, today, end),
        listPantry(db),
        listChecked(db, start),
        listSpend(db, start, end),
      ]);
      const list = buildShoppingList(
        planned,
        new Set(pantry.map((p) => p.key)),
      );
      if (live) setData({ list, checked, pantry, spend });
    })().catch(() => undefined);
    return () => {
      live = false;
    };
  }, [db, today, start, end, version]);

  const toggle = async (line: ShoppingLine) => {
    await setChecked(db, start, line.key, !data.checked.has(line.key));
    bump();
  };
  const haveIt = async (line: ShoppingLine) => {
    await setInPantry(db, line.name, true);
    bump();
  };
  const ranOut = async (name: string) => {
    if (
      !(await confirmAsync(
        "Ran out?",
        `${name} will go back on your shopping list.`,
        "Ran out",
      ))
    )
      return;
    await setInPantry(db, name, false);
    bump();
  };
  const saveSpend = async () => {
    const kobo = parseNairaInput(amount);
    if (kobo == null || Number.isNaN(kobo) || kobo <= 0) {
      setAmountError("Enter an amount, like 12,500.");
      return;
    }
    await addSpend(db, today, kobo, note);
    setAmount("");
    setNote("");
    setAmountError(null);
    setShowSpend(false);
    bump();
  };
  const removeSpend = async (e: SpendEntry) => {
    if (
      !(await confirmAsync(
        "Delete entry?",
        `${formatNaira(e.amountKobo)} ${e.note}`.trim(),
        "Delete",
        true,
      ))
    )
      return;
    await deleteSpend(db, e.id);
    bump();
  };

  const remaining = data.list.filter((l) => !data.checked.has(l.key)).length;
  const groups = [...new Set(data.list.map((l) => l.category))];
  const spent = data.spend.reduce((sum, e) => sum + e.amountKobo, 0);

  return (
    <Screen
      title="Kitchen"
      subtitle={
        data.list.length
          ? `${remaining} of ${data.list.length} items left to buy`
          : "Shopping for the rest of this week"
      }
    >
      {data.list.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title="Nothing to buy yet"
          body="Items appear here from the meals planned for the rest of this week."
        />
      ) : (
        <Glass style={styles.card}>
          {groups.map((g) => (
            <View key={g}>
              <Text variant="caption" tone="secondary" style={styles.group}>
                {categoryTitle(g).toUpperCase()}
              </Text>
              {data.list
                .filter((l) => l.category === g)
                .map((l) => {
                  const done = data.checked.has(l.key);
                  return (
                    <View key={l.key}>
                      <View style={styles.row}>
                        <Pressable
                          onPress={() => toggle(l)}
                          style={styles.check}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: done }}
                          accessibilityLabel={`${l.name}, ${l.amounts}`}
                        >
                          <Ionicons
                            name={done ? "checkmark-circle" : "ellipse-outline"}
                            size={24}
                            color={done ? colors.green : colors.textTertiary}
                          />
                          <View style={{ flex: 1 }}>
                            <Text
                              variant="body"
                              style={done ? styles.doneText : undefined}
                            >
                              {l.name}
                            </Text>
                            <Text variant="footnote" tone="secondary">
                              {l.amounts} · {l.meals} meal
                              {l.meals === 1 ? "" : "s"}
                            </Text>
                          </View>
                        </Pressable>
                        <Pressable
                          onPress={() => haveIt(l)}
                          hitSlop={8}
                          accessibilityRole="button"
                          accessibilityLabel={`I already have ${l.name}`}
                        >
                          <Text variant="subhead" tone="secondary">
                            Have it
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
            </View>
          ))}
        </Glass>
      )}

      {data.pantry.length > 0 && (
        <Section title="In your pantry">
          <Glass style={styles.card}>
            {data.pantry.map((p, i) => (
              <View key={p.key}>
                {i > 0 && <Divider />}
                <Pressable
                  onPress={() => ranOut(p.name)}
                  style={styles.row}
                  accessibilityRole="button"
                  accessibilityHint="Marks it as run out"
                >
                  <Ionicons
                    name="cube-outline"
                    size={20}
                    color={colors.green}
                  />
                  <Text variant="body" style={{ flex: 1 }}>
                    {p.name}
                  </Text>
                  <Text variant="footnote" tone="tertiary">
                    Ran out?
                  </Text>
                </Pressable>
              </View>
            ))}
          </Glass>
        </Section>
      )}

      <Section title={`Spent this week · ${formatNaira(spent)}`}>
        {!showSpend ? (
          <Button
            label="Log what you spent"
            kind="glass"
            onPress={() => setShowSpend(true)}
          />
        ) : (
          <Glass style={[styles.card, styles.form]}>
            <TextField
              label="Amount (₦)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="12,500"
              error={amountError}
            />
            <TextField
              label="Where or what"
              value={note}
              onChangeText={setNote}
              placeholder="Market run"
            />
            <Button label="Save" onPress={saveSpend} />
          </Glass>
        )}
        {data.spend.length > 0 && (
          <Glass style={[styles.card, { marginTop: spacing.xs }]}>
            {data.spend.map((e, i) => (
              <View key={e.id}>
                {i > 0 && <Divider />}
                <Pressable
                  onLongPress={() => removeSpend(e)}
                  style={styles.row}
                  accessibilityHint="Touch and hold to delete"
                >
                  <Text variant="body" style={{ flex: 1 }}>
                    {e.note || "Groceries"}
                  </Text>
                  <Text variant="body">{formatNaira(e.amountKobo)}</Text>
                </Pressable>
              </View>
            ))}
          </Glass>
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24 },
  form: { padding: spacing.md, gap: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 52,
  },
  check: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  group: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    letterSpacing: 0.6,
  },
  doneText: { color: colors.textSecondary, textDecorationLine: "line-through" },
});
