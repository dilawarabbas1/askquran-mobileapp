// Core screens ported from aq-ui.jsx: SearchHome (hero + topics + recent),
// Results (ranked ayah cards), and Reader (single-ayah focus).

import React, { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useApp } from "../AQContext";
import { AyahCard, BlockTitle, FieldLabel, IconBtn, OrnDivider, PlaceBadge, SegLabel, Translation } from "../atoms";
import { Icon, RawIcon } from "../Icon";
import { SearchBar } from "../SearchBar";
import { RECENT, RESULTS, TOPICS, type AyahItem } from "../data";
import { FONTS, mix } from "../tokens";

/* ---------- HOME / SEARCH ---------- */
export function SearchHome() {
  const app = useApp();
  const { tokens } = app;
  const [q, setQ] = useState("");
  const grid = app.homeLayout === "Grid";
  const submit = () => { if (q.trim()) app.runSearch(q.trim()); };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 26 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      {/* hero band */}
      <View style={{ paddingHorizontal: 26, paddingTop: 14, paddingBottom: 20, alignItems: "center" }}>
        <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: FONTS.ar, fontSize: 17, lineHeight: 27, color: tokens.text, textAlign: "center", writingDirection: "rtl" }}>
          لَا إِلٰهَ إِلَّا ٱللَّٰهُ مُحَمَّدٌ رَسُولُ ٱللَّٰهِ
        </Text>
        <Text numberOfLines={1} adjustsFontSizeToFit style={{ fontFamily: FONTS.serif.italic, fontStyle: "italic", fontSize: 11.5, color: tokens.brand2, marginTop: 6, textAlign: "center" }}>
          There is no god but Allah; Muhammad is the Messenger of Allah
        </Text>
        <Text style={{ maxWidth: 300, marginTop: 8, fontSize: 13.5, lineHeight: 21.6, color: tokens.text2, textAlign: "center", fontFamily: FONTS.sans[400] }}>
          Ask a question and get only referenced source material — nothing generated.
        </Text>
        <OrnDivider />
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 6 }}>
        <SearchBar value={q} onChangeText={setQ} placeholder="Ask about a topic or theme…" onSubmit={submit} showGo />

        <FieldLabel>{grid ? "Explore topics" : "Suggested topics"}</FieldLabel>
        {grid ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 11 }}>
            {TOPICS.map((t) => (
              <Pressable key={t.q} onPress={() => app.runSearch(t.q)} style={[{ width: "47.5%", backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 16, padding: 15, gap: 9 }, tokens.cardShadow]}>
                <View style={{ width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
                  <RawIcon inner={t.ic} size={20} color={tokens.brand} />
                </View>
                <View>
                  <Text style={{ fontFamily: FONTS.serif[600], fontSize: 17, color: tokens.text }}>{t.q}</Text>
                  <Text style={{ fontFamily: FONTS.ar, fontSize: 14, color: tokens.text3 }}>{t.ar}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 9 }}>
            {TOPICS.map((t) => (
              <Pressable key={t.q} onPress={() => app.runSearch(t.q)} style={[{ flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 999, paddingVertical: 9, paddingLeft: 12, paddingRight: 15 }, tokens.cardShadow]}>
                <View style={{ width: 24, height: 24, borderRadius: 7, alignItems: "center", justifyContent: "center", backgroundColor: mix(tokens.brand, 11) }}>
                  <RawIcon inner={t.ic} size={14} w={1.9} color={tokens.brand} />
                </View>
                <Text style={{ fontSize: 13.5, fontFamily: FONTS.sans[600], color: tokens.text }}>{t.q}</Text>
                <Text style={{ fontFamily: FONTS.ar, fontSize: 14, color: tokens.text3 }}>{t.ar}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <FieldLabel>Recent searches</FieldLabel>
        <View>
          {RECENT.map((r, i) => (
            <Pressable key={i} onPress={() => app.runSearch(r)} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: i === RECENT.length - 1 ? 0 : 1, borderBottomColor: tokens.lineSoft }}>
              <Icon name="clock" size={16} color={tokens.text3} />
              <Text style={{ flex: 1, fontSize: 14.5, color: tokens.text, fontFamily: FONTS.sans[600] }}>{r}</Text>
              <Icon name="chevR" size={15} color={tokens.text3} />
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

/* ---------- RESULTS ---------- */
function matches(item: AyahItem, q: string): boolean {
  const t = q.trim().toLowerCase();
  if (!t) return true;
  if (item.topics.some((tp) => tp.includes(t) || t.includes(tp))) return true;
  return (item.en + " " + item.surah + " " + item.ref).toLowerCase().includes(t);
}

export function Results() {
  const app = useApp();
  const { tokens } = app;
  const q = app.query;
  const list = RESULTS.filter((d) => matches(d, q));
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 18, paddingBottom: 26 }} showsVerticalScrollIndicator={false}>
      <View style={{ flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 14, marginHorizontal: 2 }}>
        <Text style={{ fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.text }}>
          Results for <Text style={{ color: tokens.brand }}>“{q}”</Text>
        </Text>
        <Text style={{ fontSize: 12, color: tokens.text3 }}>{list.length} {list.length === 1 ? "source" : "sources"}</Text>
      </View>
      {list.length ? (
        <View style={{ gap: 16 }}>
          {list.map((d, i) => <AyahCard item={d} rank={i + 1} key={d.ref + i} />)}
        </View>
      ) : (
        <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 20 }}>
          <Icon name="search" size={38} w={1.6} color={tokens.text3} />
          <Text style={{ marginTop: 12, fontSize: 14, lineHeight: 24, color: tokens.text3, textAlign: "center" }}>
            No indexed sources matched “{q}”.{"\n"}Try: {TOPICS.map((t) => <Text key={t.q} style={{ color: tokens.brand2, fontFamily: FONTS.sans[700] }}>{t.q} </Text>)}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

/* ---------- READER ---------- */
export function Reader() {
  const app = useApp();
  const { tokens } = app;
  const item = app.readerItem;
  const saved = app.isSaved(item.ref);
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 26 }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, alignItems: "center" }}>
        <SegLabel>Reader</SegLabel>
        <BlockTitle style={{ marginTop: 9, fontSize: 22 }}>{item.surah}</BlockTitle>
        <Text style={{ fontSize: 12.5, color: tokens.text3, marginTop: 4 }}>
          <Text style={{ fontFamily: FONTS.ar, fontSize: 17, color: tokens.orn }}>{item.arName}</Text>
          {"  ·  " + item.ref + "  ·  Juz " + item.juz}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 6 }}>
        <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 18, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 15 }, tokens.cardShadow]}>
          <Text style={{ fontFamily: FONTS.ar, fontSize: 30, lineHeight: 60, color: tokens.arColor, textAlign: "center", writingDirection: "rtl" }}>{item.arabic}</Text>
          <View style={{ height: 1, backgroundColor: tokens.lineSoft, marginVertical: 12 }} />
          <Translation item={item} lang={app.lang} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: tokens.lineSoft }}>
            <PlaceBadge place={item.place} tokens={tokens} madinahLabel="Madinan" />
            <View style={{ flexDirection: "row", gap: 6 }}>
              <IconBtn name={saved ? "bookmarkFill" : "bookmark"} active={saved} onPress={() => app.toggleSave(item)} />
              <IconBtn name="share" onPress={() => {}} />
            </View>
          </View>
        </View>

        {item.surrounding?.length ? (
          <>
            <FieldLabel>In context</FieldLabel>
            <View style={{ gap: 9 }}>
              {item.surrounding.map((n, i) => (
                <View key={i} style={{ paddingHorizontal: 13, paddingVertical: 11, borderRadius: 11, borderWidth: 1, borderColor: n.center ? mix(tokens.brand, 35) : tokens.lineSoft, backgroundColor: n.center ? mix(tokens.brand, 5, tokens.surface2) : tokens.surface2 }}>
                  <Text style={{ fontSize: 10, fontFamily: FONTS.sans[700], letterSpacing: 0.4, color: tokens.text3, marginBottom: 5 }}>{n.ref}{n.center ? " · matched" : ""}</Text>
                  <Text style={{ fontFamily: FONTS.ar, fontSize: 18, lineHeight: 33, color: tokens.arColor, textAlign: "right", writingDirection: "rtl" }}>{n.ar}</Text>
                  <Text style={{ fontFamily: FONTS.serif[400], fontSize: 12.5, color: tokens.text2, marginTop: 4 }}>{n.en}</Text>
                </View>
              ))}
            </View>
          </>
        ) : null}

        <FieldLabel>Tafsir</FieldLabel>
        <View style={{ paddingHorizontal: 15, paddingVertical: 14, backgroundColor: mix(tokens.gold, 7, tokens.surface2), borderWidth: 1, borderColor: tokens.lineSoft, borderRadius: 12 }}>
          <Text style={{ fontFamily: FONTS.serif[400], fontSize: 14, lineHeight: 24.5, color: tokens.text }}>{item.tafseer}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
