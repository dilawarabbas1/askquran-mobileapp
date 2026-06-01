import { NavigationContainer, useNavigationContainerRef, type Theme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { SettingsProvider } from "@/context/Settings";
import { SearchBusProvider, useSearchBus } from "@/context/SearchBus";
import { I18nProvider, useI18n } from "@/i18n/I18n";
import { ThemeProvider, useTheme } from "@/theme/ThemeContext";

import { AboutScreen } from "@/screens/AboutScreen";
import { DuasScreen } from "@/screens/DuasScreen";
import { FactsScreen } from "@/screens/FactsScreen";
import { MoreHubScreen } from "@/screens/MoreHubScreen";
import { CharacterScreen, CommandsScreen, ParablesScreen, WarningsScreen } from "@/screens/MoreScreens";
import { ProphetStoriesScreen } from "@/screens/ProphetStoriesScreen";
import { SearchScreen } from "@/screens/SearchScreen";

const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();

function tabIcon(emoji: string) {
  return ({ color }: { color: string }) => <Text style={{ fontSize: 18, color }}>{emoji}</Text>;
}

function MoreNavigator() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const screenOptions = {
    headerStyle: { backgroundColor: colors.heroBg },
    headerTintColor: colors.heroText,
    contentStyle: { backgroundColor: colors.bg },
  };
  return (
    <MoreStack.Navigator screenOptions={screenOptions}>
      <MoreStack.Screen name="MoreHub" component={MoreHubScreen} options={{ title: t("nav.more") }} />
      <MoreStack.Screen name="ProphetStories" component={ProphetStoriesScreen} options={{ title: t("nav.prophetStories") }} />
      <MoreStack.Screen name="Parables" component={ParablesScreen} options={{ title: t("nav.quranicParables") }} />
      <MoreStack.Screen name="Commands" component={CommandsScreen} options={{ title: t("nav.commandsProhibitions") }} />
      <MoreStack.Screen name="Warnings" component={WarningsScreen} options={{ title: t("nav.quranicWarnings") }} />
      <MoreStack.Screen name="Character" component={CharacterScreen} options={{ title: t("nav.ethicalCharacterMap") }} />
    </MoreStack.Navigator>
  );
}

function Tabs() {
  const { t } = useI18n();
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen name="Search" component={SearchScreen} options={{ tabBarLabel: t("nav.search"), tabBarIcon: tabIcon("🔍") }} />
      <Tab.Screen name="Facts" component={FactsScreen} options={{ tabBarLabel: t("nav.facts"), tabBarIcon: tabIcon("📖") }} />
      <Tab.Screen name="Duas" component={DuasScreen} options={{ tabBarLabel: t("nav.duas"), tabBarIcon: tabIcon("🤲") }} />
      <Tab.Screen name="More" component={MoreNavigator} options={{ tabBarLabel: t("nav.more"), tabBarIcon: tabIcon("✦") }} />
      <Tab.Screen name="About" component={AboutScreen} options={{ tabBarLabel: t("nav.about"), tabBarIcon: tabIcon("ⓘ") }} />
    </Tab.Navigator>
  );
}

/** Bridges the search bus to navigation: any screen can request a search and
 *  this switches to the Search tab. */
function BusBridge({ navigate }: { navigate: () => void }) {
  const { setNavigateToSearch } = useSearchBus();
  useEffect(() => {
    setNavigateToSearch(navigate);
  }, [navigate, setNavigateToSearch]);
  return null;
}

function Root() {
  const { colors, mode } = useTheme();
  const navRef = useNavigationContainerRef();

  const navTheme: Theme = {
    dark: mode === "dark",
    colors: {
      primary: colors.primary,
      background: colors.bg,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.accent,
    },
  };

  return (
    <SettingsProvider>
      <SearchBusProvider>
        <NavigationContainer ref={navRef} theme={navTheme}>
          <BusBridge navigate={() => navRef.navigate("Search" as never)} />
          <Tabs />
        </NavigationContainer>
      </SearchBusProvider>
    </SettingsProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <I18nProvider>
          <StatusBar style="light" />
          <Root />
        </I18nProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
