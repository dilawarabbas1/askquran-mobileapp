// Legal — Privacy Policy + Data Safety, in-app content screens.
// Ports the web PrivacyPage.tsx / DataSafetyPage.tsx verbatim. Both are static
// English-only content (the web pages do not use i18n either), reached from the
// Settings page. Required by Google Play for apps that send data to a backend.

import React from "react";
import { Linking, Pressable, ScrollView, View } from "react-native";
import { Text } from "../AppText";
import { useApp } from "../AQContext";
import { BlockTitle, SegLabel } from "../atoms";
import { Icon } from "../Icon";
import { FONTS, mix } from "../tokens";

const CONTACT = "dilawarabbbas@gmail.com";
const EFFECTIVE = "June 5, 2025";

// ---- shared building blocks ----------------------------------------------

function useLegalKit() {
  const { tokens } = useApp();
  const Section = ({ children }: { children: React.ReactNode }) => (
    <View style={{ marginTop: 24 }}>{children}</View>
  );
  const H2 = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontFamily: FONTS.serif[600], fontSize: 18, color: tokens.text, marginBottom: 10 }}>{children}</Text>
  );
  const P = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontSize: 14, lineHeight: 23, color: tokens.text2, marginBottom: 10 }}>{children}</Text>
  );
  const Bold = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontFamily: FONTS.sans[700], color: tokens.text }}>{children}</Text>
  );
  const Bullet = ({ children }: { children: React.ReactNode }) => (
    <View style={{ flexDirection: "row", gap: 9, marginBottom: 7 }}>
      <Text style={{ color: tokens.brand, lineHeight: 21 }}>•</Text>
      <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 21, color: tokens.text2 }}>{children}</Text>
    </View>
  );
  return { tokens, Section, H2, P, Bold, Bullet };
}

// A simple two/three-column data table rendered as stacked rows.
function DataRow({ cells, head }: { cells: string[]; head?: boolean }) {
  const { tokens } = useApp();
  return (
    <View
      style={{
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: tokens.lineSoft,
        backgroundColor: head ? mix(tokens.brand, 7, tokens.surface) : "transparent",
        paddingVertical: 9,
        paddingHorizontal: 11,
      }}
    >
      {cells.map((c, i) => (
        <Text
          key={i}
          style={{
            flex: i === 0 ? 1.1 : 1,
            fontSize: 11.5,
            lineHeight: 16,
            paddingRight: 8,
            color: head ? tokens.text : tokens.text2,
            fontFamily: head ? FONTS.sans[700] : FONTS.sans[i === 0 ? 600 : 400],
          }}
        >
          {c}
        </Text>
      ))}
    </View>
  );
}

function LegalCard({ children }: { children: React.ReactNode }) {
  const { tokens } = useApp();
  return (
    <View style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 14, overflow: "hidden", marginTop: 4 }, tokens.cardShadow]}>
      {children}
    </View>
  );
}

// ---- Privacy Policy -------------------------------------------------------

export function Privacy() {
  const app = useApp();
  const { tokens, Section, H2, P, Bold, Bullet } = useLegalKit();

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <SegLabel>AskQuran</SegLabel>
      <BlockTitle style={{ marginTop: 8, marginBottom: 6, fontSize: 24 }}>Privacy Policy</BlockTitle>
      <Text style={{ fontSize: 12.5, color: tokens.text3 }}>Effective date: {EFFECTIVE}</Text>

      <P>
        <Bold>AskQuran</Bold> ("we", "our", or "the app") is a free, source-grounded Quran search
        service available at askquran.co and as a mobile application. This policy explains what
        information is collected when you use AskQuran, how it is used, and what it is not used for.
      </P>
      <P>
        We built AskQuran as a sadaqah jariyah — a continuing act of charity. Your trust matters to
        us. We do not sell data, show ads, or share your information with third parties for commercial
        purposes.
      </P>

      <Section>
        <H2>1. Information We Collect</H2>
        <P>
          When you submit a search query, the following information is automatically transmitted to
          our server and recorded in our analytics log:
        </P>
        <LegalCard>
          <DataRow head cells={["Data", "Why", "Stored?"]} />
          <DataRow cells={["Search query text", "Answer your question; analyse useful topics", "Yes — logs"]} />
          <DataRow cells={["Translation ID (e.g. en.sahih)", "Understand which editions are used", "Yes — logs"]} />
          <DataRow cells={["IP address", "Approximate country code (offline GeoIP)", "Yes — redacted in admin"]} />
          <DataRow cells={["Country code (e.g. PK)", "Geographic reach of the service", "Yes — logs"]} />
          <DataRow cells={["Request source (web/mobile/api)", "Distinguish traffic for capacity planning", "Yes — logs"]} />
          <DataRow cells={["Timestamp", "Record when the query was made", "Yes — logs"]} />
          <DataRow cells={["Anonymous device ID (app only)", "Associate analytics events without identifying you personally", "Yes — xNotify analytics"]} />
        </LegalCard>
        <P>
          <Bold>We do not collect:</Bold> names, email addresses, passwords, phone numbers, advertising
          IDs, precise location data, biometric data, payment information, or any account credentials.
          AskQuran has no user registration or login.
        </P>
      </Section>

      <Section>
        <H2>2. How We Use This Information</H2>
        <Bullet>To operate and improve the search service</Bullet>
        <Bullet>To understand which topics, languages, and editions are most useful to users</Bullet>
        <Bullet>To monitor for abuse and protect the service</Bullet>
        <Bullet>To track geographic reach for the purpose of expanding language support</Bullet>
        <Bullet>To analyse anonymous in-app usage patterns via xNotify so we can improve the app experience</Bullet>
        <P>We do not use this information for advertising, profiling, or any commercial purpose.</P>
      </Section>

      <Section>
        <H2>3. Website Analytics (Google Analytics)</H2>
        <P>
          The AskQuran website (askquran.co) uses Google Analytics to collect aggregated, anonymised
          statistics about page visits. Google Analytics may set cookies in your browser and may
          collect your IP address. The AskQuran <Bold>mobile app does not include Google Analytics.</Bold>
        </P>
      </Section>

      <Section>
        <H2>4. Mobile App Analytics (xNotify)</H2>
        <P>
          This app uses xNotify, an analytics service, to record anonymous in-app events such as
          searches and feature usage. Each event is associated with a randomly generated{" "}
          <Bold>distinct_id</Bold> stored on your device — there is no name, email address, or phone
          number attached. Events are transmitted to xNotify's servers over HTTPS. xNotify acts as a
          data processor on our behalf and does not share data with unrelated third parties.
        </P>
      </Section>

      <Section>
        <H2>5. Data Sharing</H2>
        <P>
          We do not sell, rent, trade, or share your data with third parties for commercial purposes.
          The services below process data on our behalf as service providers:
        </P>
        <Bullet>xNotify — anonymous in-app analytics (mobile app)</Bullet>
        <P>
          We may disclose information if required by law or to protect the security of the service.
        </P>
      </Section>

      <Section>
        <H2>6. Data Retention</H2>
        <P>
          Server-side analytics logs (search queries, IP addresses, timestamps) are retained for up
          to <Bold>12 months</Bold> for operational analysis and are then deleted or anonymised.
          Anonymous analytics events stored with xNotify are subject to xNotify's own retention
          policy.
        </P>
      </Section>

      <Section>
        <H2>7. Cookies</H2>
        <P>
          AskQuran itself does not use cookies for tracking or authentication. The website uses Google
          Analytics which may set cookies as described in section 3. Your preferences are stored on
          your device only and never sent to our server.
        </P>
      </Section>

      <Section>
        <H2>8. Children's Privacy</H2>
        <P>
          AskQuran is suitable for all ages. We do not knowingly collect any personal information from
          children under 13. Because we do not require registration, no age-specific data is collected.
        </P>
      </Section>

      <Section>
        <H2>9. Security</H2>
        <P>
          All data transmitted between your device and our server is encrypted using HTTPS/TLS.
          Server-side logs are stored on a private, access-controlled server.
        </P>
      </Section>

      <Section>
        <H2>10. Changes to This Policy</H2>
        <P>
          We may update this Privacy Policy from time to time. When we do, we will update the
          "Effective date" at the top of this page. Continued use of AskQuran after a policy update
          constitutes acceptance of the revised policy.
        </P>
      </Section>

      <Section>
        <H2>12. Contact</H2>
        <P>If you have any questions or concerns about this Privacy Policy, please contact us at:</P>
        <Pressable onPress={() => Linking.openURL(`mailto:${CONTACT}`)}>
          <Text style={{ fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.brand }}>{CONTACT}</Text>
        </Pressable>
      </Section>

      <Pressable onPress={app.openDataSafety} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 26 }}>
        <Text style={{ fontSize: 13.5, fontFamily: FONTS.sans[600], color: tokens.brand }}>View Data Safety summary</Text>
        <Icon name="chevR" size={15} color={tokens.brand} />
      </Pressable>
    </ScrollView>
  );
}

// ---- Data Safety ----------------------------------------------------------

export function DataSafety() {
  const app = useApp();
  const { tokens, Section, H2, P, Bold } = useLegalKit();

  const doList = [
    "Send your search queries to our server to answer them",
    "Log queries, timestamps, and country-level location (from your IP) for usage analytics",
    "Store which Quran translation you searched with",
    "Use Google Analytics on the website for page-view statistics (not in the mobile app)",
    "Collect anonymous in-app analytics events via xNotify, tied to a randomly generated device ID — no personal information attached",
    "Transmit all data over HTTPS/TLS encryption",
  ];
  const dontList = [
    "No user accounts, no registration, no login",
    "No name, email address, or phone number collected — ever",
    "No advertising ID or commercial tracking identifier collected",
    "No ads — ever",
    "No selling or sharing of your data with third parties for commercial purposes",
    "No in-app purchases or payment data",
    "No precise location tracking (country-level only, derived from IP on our server)",
  ];
  const qa: [string, React.ReactNode][] = [
    ["Does this app collect or share any of the required user data types?",
      <Text><Bold>Yes — data is collected.</Bold> The app sends search queries to our backend server and, on the mobile app, collects anonymous analytics events.</Text>],
    ["Is all of the user data collected by this app encrypted in transit?",
      <Text><Bold>Yes.</Bold> All communication uses HTTPS/TLS.</Text>],
    ["Do you provide a way for users to request that their data is deleted?",
      <Text><Bold>No formal deletion mechanism exists</Bold> — AskQuran has no accounts, so there is no account to delete. Users may contact us at {CONTACT} with questions about their data.</Text>],
    ["Data type: App Activity → App interactions / Search history",
      <Text><Bold>Collected.</Bold> Search query text is transmitted to and stored on our server.{"\n"}Purpose: App functionality + Analytics.{"\n"}Required? No. Shared with third parties? No.</Text>],
    ["Data type: Device or other IDs (device ID, anonymous identifier)",
      <Text><Bold>Collected on the mobile app.</Bold> A randomly generated anonymous distinct_id is stored on the device and used by xNotify to associate analytics events. No advertising ID or personal identifier is used.{"\n"}Purpose: Analytics.{"\n"}Shared with third parties? No — xNotify acts as a service provider processing data on AskQuran's behalf.</Text>],
    ["Data type: Personal info (name, email, phone, address)",
      <Text><Bold>Not collected.</Bold> No registration or login exists.</Text>],
    ["Data type: Location (precise or approximate)",
      <Text><Bold>Approximate location only</Bold> — a country code is derived server-side from the IP address using an offline GeoIP database. The device's GPS or network location is never requested or accessed.</Text>],
    ["Does this app share user data with third parties?",
      <Text><Bold>No.</Bold> xNotify is a service provider that processes data on AskQuran's behalf — not an independent third party receiving data for its own use. Data is never sold or shared for commercial purposes. Google Analytics is used on the website only, not in the mobile app.</Text>],
    ["Is this app designed primarily for children under 13?",
      <Text><Bold>No</Bold> — it is suitable for all ages but not designed exclusively for children.</Text>],
  ];

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 36 }} showsVerticalScrollIndicator={false}>
      <SegLabel>AskQuran</SegLabel>
      <BlockTitle style={{ marginTop: 8, marginBottom: 6, fontSize: 24 }}>Data Safety</BlockTitle>
      <Text style={{ fontSize: 13, lineHeight: 20, color: tokens.text2 }}>Plain-English summary of how AskQuran handles your data.</Text>

      <Section>
        <H2>What AskQuran Does — and Doesn't Do</H2>
        <View style={[{ backgroundColor: mix(tokens.brand, 6, tokens.surface), borderWidth: 1, borderColor: mix(tokens.brand, 22, tokens.line), borderRadius: 14, padding: 14, marginBottom: 11 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 9 }}>
            <Icon name="check" size={16} w={2.6} color={tokens.brand} />
            <Text style={{ fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.text }}>What we do</Text>
          </View>
          {doList.map((s) => (
            <View key={s} style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
              <Text style={{ color: tokens.brand }}>•</Text><Text style={{ flex: 1, fontSize: 13, lineHeight: 20, color: tokens.text2 }}>{s}</Text>
            </View>
          ))}
        </View>
        <View style={[{ backgroundColor: mix(tokens.mecca, 7, tokens.surface), borderWidth: 1, borderColor: mix(tokens.mecca, 24, tokens.line), borderRadius: 14, padding: 14 }]}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 9 }}>
            <Icon name="x" size={16} w={2.6} color={tokens.mecca} />
            <Text style={{ fontSize: 14, fontFamily: FONTS.sans[700], color: tokens.text }}>What we don't do</Text>
          </View>
          {dontList.map((s) => (
            <View key={s} style={{ flexDirection: "row", gap: 8, marginBottom: 6 }}>
              <Text style={{ color: tokens.mecca }}>•</Text><Text style={{ flex: 1, fontSize: 13, lineHeight: 20, color: tokens.text2 }}>{s}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section>
        <H2>Data Collected at a Glance</H2>
        <LegalCard>
          <DataRow head cells={["Data type", "Collected?", "Shared?"]} />
          <DataRow cells={["Search query text", "Yes", "No"]} />
          <DataRow cells={["IP address", "Yes (server only)", "No"]} />
          <DataRow cells={["Country code (from IP)", "Yes", "No"]} />
          <DataRow cells={["Translation preference", "Yes", "No"]} />
          <DataRow cells={["Anonymous device ID (app)", "Yes — random, not linked to identity", "No"]} />
          <DataRow cells={["Advertising ID", "No", "—"]} />
          <DataRow cells={["Name / email / phone", "No", "—"]} />
          <DataRow cells={["Location (precise)", "No", "—"]} />
          <DataRow cells={["Financial info", "No", "—"]} />
        </LegalCard>
      </Section>

      <Section>
        <H2>Google Play Data Safety — Reference Answers</H2>
        <P>
          The answers below reflect the actual behaviour of the app and assist the developer when
          completing the Google Play Console Data Safety section.
        </P>
        <View style={{ gap: 10 }}>
          {qa.map(([q, a], i) => (
            <View key={i} style={[{ backgroundColor: tokens.surface, borderWidth: 1, borderColor: tokens.line, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 12 }, tokens.cardShadow]}>
              <Text style={{ fontSize: 13.5, fontFamily: FONTS.sans[700], color: tokens.text, marginBottom: 5 }}>{q}</Text>
              <Text style={{ fontSize: 13, lineHeight: 20, color: tokens.text2 }}>{a}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Pressable onPress={app.openPrivacy} style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 26 }}>
        <Text style={{ fontSize: 13.5, fontFamily: FONTS.sans[600], color: tokens.brand }}>Full Privacy Policy</Text>
        <Icon name="chevR" size={15} color={tokens.brand} />
      </Pressable>
    </ScrollView>
  );
}
