import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from "react-native";
import { ChevronDown, Mail, Phone, MessageCircle } from "lucide-react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { useResponsive } from "@/hooks/useResponsive";
import ScreenHeader from "@/components/ScreenHeader";
import Card from "@/components/Card";

const FAQS = [
  {
    q: "How do I request time off?",
    a: "Go to the Leave tab, tap 'Apply Leave', choose your leave type and dates, then submit for approval.",
  },
  {
    q: "How do I update my weekly availability?",
    a: "Open the Availability tab, tap the checkboxes for the shifts you can work each day, then tap Save Availability.",
  },
  {
    q: "Can I swap a shift with a colleague?",
    a: "Yes — use the Swap Shift quick action on your Dashboard, or contact your ward manager directly.",
  },
  {
    q: "Why haven't I received a notification?",
    a: "Notifications appear once your manager approves or updates a request. Make sure notifications are enabled in Settings.",
  },
];

export default function HelpScreen() {
  const { colors } = useAppTheme();
  const { contentMaxWidth } = useResponsive();
  const [open, setOpen] = useState<number | null>(0);

  const contacts = [
    { icon: Phone, label: "Call Support", value: "+1 800 555 0134", action: () => Linking.openURL("tel:+18005550134") },
    { icon: Mail, label: "Email Support", value: "support@careshift.app", action: () => Linking.openURL("mailto:support@careshift.app") },
    { icon: MessageCircle, label: "Live Chat", value: "Mon-Fri, 9am-6pm", action: () => {} },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader title="Help & Support" showBell={false} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={[styles.page, { maxWidth: contentMaxWidth, alignSelf: "center", width: "100%" }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
          <Card style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
            {FAQS.map((item, idx) => {
              const isOpen = open === idx;
              return (
                <View
                  key={item.q}
                  style={idx !== FAQS.length - 1 ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border } : undefined}
                >
                  <Pressable onPress={() => setOpen(isOpen ? null : idx)} style={styles.faqRow}>
                    <Text style={[styles.faqQ, { color: colors.text }]}>{item.q}</Text>
                    <ChevronDown
                      size={18}
                      color={colors.textMuted}
                      style={{ transform: [{ rotate: isOpen ? "180deg" : "0deg" }] }}
                    />
                  </Pressable>
                  {isOpen && (
                    <Text style={[styles.faqA, { color: colors.textSecondary }]}>{item.a}</Text>
                  )}
                </View>
              );
            })}
          </Card>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            {contacts.map((c, idx) => (
              <Pressable
                key={c.label}
                onPress={c.action}
                style={[
                  styles.contactRow,
                  idx !== contacts.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.contactIcon, { backgroundColor: colors.primaryTint }]}>
                  <c.icon size={17} color={colors.primary} />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.contactLabel, { color: colors.text }]}>{c.label}</Text>
                  <Text style={[styles.contactValue, { color: colors.textMuted }]}>{c.value}</Text>
                </View>
              </Pressable>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 16, paddingTop: 18 },
  sectionTitle: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  faqRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 14 },
  faqQ: { fontSize: 13, fontWeight: "600", flex: 1, marginRight: 10 },
  faqA: { fontSize: 12.5, paddingHorizontal: 14, paddingBottom: 14, lineHeight: 19 },
  contactRow: { flexDirection: "row", alignItems: "center", padding: 14 },
  contactIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  contactLabel: { fontSize: 13, fontWeight: "600" },
  contactValue: { fontSize: 11, marginTop: 2 },
});
