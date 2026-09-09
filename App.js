import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  "https://ykltmnvxxwwtinugotxp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_M_UUA7yqv8kKfc9WwTl5aA_Fxo_HIlN";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const COLORS = {
  background: "#071311",
  background2: "#0B1D18",
  surface: "rgba(255,255,255,0.08)",
  surfaceStrong: "rgba(255,255,255,0.12)",
  border: "rgba(255,255,255,0.14)",
  white: "#FFFFFF",
  muted: "#9EAEAA",
  green: "#45D483",
  greenDark: "#0E6B49",
  greenSoft: "#B9F0D2",
  black: "#08100E",
  lightBackground: "#F4F8F6",
  lightCard: "#FFFFFF",
  lightText: "#12231D",
  lightMuted: "#71817B",
  line: "#DFE8E3",
  care: "#F3DDE2",
  careText: "#712F3C",
};

const SERVICES = [
  {
    name: "Bike Taxi",
    icon: "◈",
    subtitle: "Fast local rides",
    description:
      "Get around your city quickly with a nearby partner.",
  },
  {
    name: "Parcel",
    icon: "□",
    subtitle: "Send anything",
    description:
      "Reliable local pickup and delivery.",
  },
  {
    name: "Buy & Bring",
    icon: "◇",
    subtitle: "We'll get it",
    description:
      "Ask a SERA partner to buy and bring what you need.",
  },
  {
    name: "Print & Xerox",
    icon: "▤",
    subtitle: "Print & deliver",
    description:
      "Get documents printed and delivered to your door.",
  },
  {
    name: "General Task",
    icon: "＋",
    subtitle: "Need a hand?",
    description:
      "Simple local tasks handled by a SERA partner.",
  },
  {
    name: "SERA Care",
    icon: "♡",
    subtitle: "Human companionship",
    description:
      "When you can't be there, we can be there.",
    care: true,
  },
];

export default function App() {
  const [screen, setScreen] = useState("login");
  const [tab, setTab] = useState("home");

  const [user, setUser] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [selectedService, setSelectedService] =
    useState(null);

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const [personName, setPersonName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [careMinutes, setCareMinutes] =
    useState("180");

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;

      if (data.session?.user) {
        setUser(data.session.user);
        setScreen("home");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!active) return;

        setUser(session?.user ?? null);

        if (session?.user) {
          setScreen("home");
        }
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function login() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert(
        "Enter your details",
        "Please enter your development email and password."
      );
      return;
    }

    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

    setLoading(false);

    if (error) {
      Alert.alert("Login failed", error.message);
      return;
    }

    setUser(data.user);
    setTab("home");
    setScreen("home");
  }

  async function logout() {
    await supabase.auth.signOut();

    setUser(null);
    setEmail("");
    setPassword("");
    setTab("home");
    setScreen("login");
  }

  function openService(service) {
    setSelectedService(service);

    setPickup("");
    setDestination("");
    setPersonName("");
    setPurpose("");
    setNotes("");
    setCareMinutes("180");

    setScreen("booking");
  }

  function goBackHome() {
    setSelectedService(null);
    setScreen("home");
    setTab("home");
  }

  async function createBooking() {
    if (!user) {
      Alert.alert(
        "Login required",
        "Please log in before creating a request."
      );
      setScreen("login");
      return;
    }

    if (!pickup.trim()) {
      Alert.alert(
        "Pickup required",
        "Please enter the pickup location."
      );
      return;
    }

    if (!destination.trim()) {
      Alert.alert(
        "Destination required",
        "Please enter the destination."
      );
      return;
    }

    const isCare =
      selectedService?.name === "SERA Care";

    if (isCare && !personName.trim()) {
      Alert.alert(
        "Person's name required",
        "Please enter the name of the person who needs assistance."
      );
      return;
    }

    setLoading(true);

    const minutes = Math.max(
      30,
      Number(careMinutes) || 180
    );

    const careAmount =
      (minutes / 60) * 150;

    const serviceType =
      selectedService?.name || "General Task";

    const { data: booking, error } =
      await supabase
        .from("bookings")
        .insert({
          customer_id: user.id,
          service_type: serviceType,
          status: "requested",
          pickup_address: pickup.trim(),
          destination_address:
            destination.trim(),
          distance_km: 0,
          estimated_minutes: isCare
            ? minutes
            : 30,
          total_fare: isCare
            ? careAmount
            : 0,
        })
        .select()
        .single();

    if (error) {
      setLoading(false);

      Alert.alert(
        "Request failed",
        error.message
      );

      return;
    }

    if (isCare) {
      const { error: careError } =
        await supabase
          .from("care_bookings")
          .insert({
            booking_id: booking.id,
            person_name: personName.trim(),
            purpose: purpose.trim(),
            notes: notes.trim(),

            care_started_at: null,
            care_ended_at: null,
            care_minutes: 0,

            customer_care_rate: 150,
            partner_care_rate: 100,
            travel_rate: 7,
            completion_bonus: 40,

            care_amount: careAmount,
            travel_amount: 0,
            partner_payout: 40,
          });

      if (careError) {
        setLoading(false);

        Alert.alert(
          "Care request failed",
          careError.message
        );

        return;
      }
    }

    setLoading(false);

    Alert.alert(
      "Request received",
      "Your SERA request has been created.",
      [
        {
          text: "View Activity",
          onPress: () => {
            setSelectedService(null);
            setTab("activity");
            setScreen("home");
          },
        },
      ]
    );
  }

  const careHours = useMemo(() => {
    const minutes = Math.max(
      30,
      Number(careMinutes) || 180
    );

    return minutes / 60;
  }, [careMinutes]);

  const careAmount = careHours * 150;

  function GlassCard({
    children,
    style,
    onPress,
  }) {
    if (onPress) {
      return (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.glassCard,
            style,
            pressed && styles.pressed,
          ]}
        >
          {children}
        </Pressable>
      );
    }

    return (
      <View style={[styles.glassCard, style]}>
        {children}
      </View>
    );
  }

  function BrandMark({
    light = false,
    large = false,
  }) {
    return (
      <View style={styles.brandWrap}>
        <Text
          style={[
            styles.brand,
            light && styles.brandLight,
            large && styles.brandLarge,
          ]}
        >
          SERA
        </Text>

        <Text
          style={[
            styles.brandTag,
            light && styles.brandTagLight,
          ]}
        >
          PEOPLE • TASKS • CARE
        </Text>
      </View>
    );
  }

  function LoginScreen() {
    return (
      <SafeAreaView style={styles.loginRoot}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />

        <ScrollView
          contentContainerStyle={styles.loginContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.loginGlowOne} />
          <View style={styles.loginGlowTwo} />

          <Image
            source={require(
              "./assets/sera white logo png.png"
            )}
            style={styles.loginLogo}
            resizeMode="contain"
          />

          <Text style={styles.loginHelpful}>
            A More Helpful Tomorrow
          </Text>

          <View style={styles.loginHeading}>
            <Text style={styles.loginTitle}>
              Welcome to SERA
            </Text>

            <Text style={styles.loginSubtitle}>
              One place for people, tasks and care.
            </Text>
          </View>

          <View style={styles.loginGlass}>
            <Text style={styles.inputLabel}>
              Development login
            </Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="Email address"
              placeholderTextColor="#72837D"
              style={styles.loginInput}
            />

            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Password"
              placeholderTextColor="#72837D"
              style={styles.loginInput}
            />

            <Pressable
              onPress={login}
              disabled={loading}
              style={({ pressed }) => [
                styles.mainButton,
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.mainButtonText}>
                {loading
                  ? "Signing in..."
                  : "Continue"}
              </Text>

              <Text style={styles.mainButtonArrow}>
                →
              </Text>
            </Pressable>

            <Text style={styles.devText}>
              Development mode
            </Text>
          </View>

          <Text style={styles.loginFooter}>
            SERA • PEOPLE • TASKS • CARE
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  function Header() {
    return (
      <View style={styles.homeHeader}>
        <BrandMark />

        <Pressable
          onPress={() => setTab("profile")}
          style={styles.profileButton}
        >
          <Text style={styles.profileLetter}>
            {user?.email
              ? user.email
                  .charAt(0)
                  .toUpperCase()
              : "S"}
          </Text>
        </Pressable>
      </View>
    );
  }

  function HomeScreen() {
    return (
      <SafeAreaView style={styles.appRoot}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.homeContent}
        >
          <Header />

          <View style={styles.locationRow}>
            <View>
              <Text style={styles.locationLabel}>
                YOUR LOCATION
              </Text>

              <Text style={styles.locationValue}>
                Choose your location
              </Text>
            </View>

            <View style={styles.locationIcon}>
              <Text style={styles.locationPin}>
                •
              </Text>
            </View>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroOrb} />

            <Text style={styles.heroEyebrow}>
              SERA
            </Text>

            <Text style={styles.heroTitle}>
              What can we help
              {"\n"}with today?
            </Text>

            <Text style={styles.heroDescription}>
              Everyday tasks, local services and
              trusted human care — all in one place.
            </Text>

            <View style={styles.heroBottom}>
              <Text style={styles.heroSmall}>
                PEOPLE • TASKS • CARE
              </Text>

              <Text style={styles.heroArrow}>
                ↗
              </Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Services
            </Text>

            <Text style={styles.sectionHint}>
              Everything nearby
            </Text>
          </View>

          <View style={styles.serviceGrid}>
            {SERVICES.map((service) => (
              <GlassCard
                key={service.name}
                onPress={() =>
                  openService(service)
                }
                style={[
                  styles.serviceCard,
                  service.care &&
                    styles.careServiceCard,
                ]}
              >
                <View
                  style={[
                    styles.serviceIcon,
                    service.care &&
                      styles.careIcon,
                  ]}
                >
                  <Text
                    style={[
                      styles.serviceIconText,
                      service.care &&
                        styles.careIconText,
                    ]}
                  >
                    {service.icon}
                  </Text>
                </View>

                <Text style={styles.serviceName}>
                  {service.name}
                </Text>

                <Text style={styles.serviceSubtitle}>
                  {service.subtitle}
                </Text>

                <View style={styles.cardArrow}>
                  <Text style={styles.cardArrowText}>
                    →
                  </Text>
                </View>
              </GlassCard>
            ))}
          </View>

          <Pressable
            onPress={() =>
              openService(SERVICES[5])
            }
            style={({ pressed }) => [
              styles.careFeature,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.careFeatureGlow} />

            <View style={styles.careFeatureTop}>
              <View style={styles.careFeatureIcon}>
                <Text style={styles.careHeart}>
                  ♡
                </Text>
              </View>

              <Text style={styles.careFeatureLabel}>
                SERA CARE
              </Text>
            </View>

            <Text style={styles.careFeatureTitle}>
              When you can't be there,
              {"\n"}we can be there.
            </Text>

            <Text style={styles.careFeatureText}>
              A trusted human companion for
              hospital visits, appointments and
              everyday assistance.
            </Text>

            <View style={styles.careFeatureBottom}>
              <Text style={styles.careFeaturePrice}>
                ₹150 / hour
              </Text>

              <View style={styles.careFeatureCTA}>
                <Text
                  style={styles.careFeatureCTAText}
                >
                  Explore Care →
                </Text>
              </View>
            </View>
          </Pressable>

          <View style={styles.bottomSpace} />
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    );
  }

  function ActivityScreen() {
    return (
      <SafeAreaView style={styles.appRoot}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />

        <ScrollView
          contentContainerStyle={styles.pageContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageEyebrow}>
                SERA
              </Text>

              <Text style={styles.pageTitle}>
                Activity
              </Text>
            </View>

            <View style={styles.headerCircle}>
              <Text style={styles.headerCircleText}>
                ⋯
              </Text>
            </View>
          </View>

          <View style={styles.emptyActivity}>
            <View style={styles.emptyIcon}>
              <Text style={styles.emptyIconText}>
                ◌
              </Text>
            </View>

            <Text style={styles.emptyTitle}>
              Nothing here yet
            </Text>

            <Text style={styles.emptyText}>
              Your SERA requests and completed
              tasks will appear here.
            </Text>

            <Pressable
              onPress={() => {
                setTab("home");
                setScreen("home");
              }}
              style={styles.secondaryButton}
            >
              <Text
                style={styles.secondaryButtonText}
              >
                Explore services
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <BottomNav />
      </SafeAreaView>
    );
  }

  function CareTabScreen() {
    return (
      <SafeAreaView style={styles.appRoot}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />

        <ScrollView
          contentContainerStyle={styles.pageContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.pageHeader}>
            <View>
              <Text style={styles.pageEyebrow}>
                SERA
              </Text>

              <Text style={styles.pageTitle}>
                Care
              </Text>
            </View>
          </View>

          <View style={styles.careLargeCard}>
            <Text style={styles.careLargeEyebrow}>
              SERA CARE
            </Text>

            <Text style={styles.careLargeTitle}>
              Someone you trust,
              {"\n"}when you can't be there.
            </Text>

            <Text style={styles.careLargeText}>
              Human companionship for hospital
              visits, appointments and local
              assistance.
            </Text>

            <View style={styles.careLargeDivider} />

            <View style={styles.carePriceRow}>
              <View>
                <Text style={styles.priceLabel}>
                  CARE TIME
                </Text>

                <Text style={styles.priceValue}>
                  ₹150
                  <Text style={styles.priceUnit}>
                    {" "}
                    / hour
                  </Text>
                </Text>
              </View>

              <View style={styles.priceBadge}>
                <Text style={styles.priceBadgeText}>
                  PER MINUTE
                </Text>
              </View>
            </View>

            <Pressable
              onPress={() =>
                openService(SERVICES[5])
              }
              style={styles.careBookButton}
            >
              <Text style={styles.careBookText}>
                Book a Care Partner
              </Text>

              <Text style={styles.careBookArrow}>
                →
              </Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>
            What Care includes
          </Text>
          <View style={styles.careIncludeCard}>
            <View style={styles.careIncludeIcon}>
              <Text style={styles.careIncludeEmoji}>🤝</Text>
            </View>
            <View style={styles.careIncludeContent}>
              <Text style={styles.careIncludeTitle}>
                Human companionship
              </Text>
              <Text style={styles.careIncludeText}>
                A trusted partner stays with your loved one throughout the visit.
              </Text>
            </View>
          </View>

          <View style={styles.careIncludeCard}>
            <View style={styles.careIncludeIcon}>
              <Text style={styles.careIncludeEmoji}>🏥</Text>
            </View>
            <View style={styles.careIncludeContent}>
              <Text style={styles.careIncludeTitle}>
                Hospital & appointment support
              </Text>
              <Text style={styles.careIncludeText}>
                Help with check-in, registration, queues and navigation.
              </Text>
            </View>
          </View>

          <View style={styles.careIncludeCard}>
            <View style={styles.careIncludeIcon}>
              <Text style={styles.careIncludeEmoji}>📄</Text>
            </View>
            <View style={styles.careIncludeContent}>
              <Text style={styles.careIncludeTitle}>
                Documents & updates
              </Text>
              <Text style={styles.careIncludeText}>
                Assistance with documents and keeping family members updated.
              </Text>
            </View>
          </View>

          <View style={styles.careIncludeCard}>
            <View style={styles.careIncludeIcon}>
              <Text style={styles.careIncludeEmoji}>🏠</Text>
            </View>
            <View style={styles.careIncludeContent}>
              <Text style={styles.careIncludeTitle}>
                Safe return home
              </Text>
              <Text style={styles.careIncludeText}>
                Stay with them until the visit is complete and help them return safely.
              </Text>
            </View>
          </View>

          <View style={styles.careNote}>
            <Text style={styles.careNoteTitle}>
              SERA Care is non-medical support
            </Text>
            <Text style={styles.careNoteText}>
              Our Care Partners provide companionship and practical assistance.
              They do not provide medical treatment, diagnosis or medication administration.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "login") {
    return <LoginScreen />;
  }

  if (screen === "booking") {
    return <BookingScreen />;
  }

  return <HomeScreen />;
}

const styles = StyleSheet.create({
  dark: {
    flex: 1,
    backgroundColor: "#061015",
  },

  light: {
    flex: 1,
    backgroundColor: "#F4F7F5",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  login: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },

  logo: {
    width: "100%",
    height: 110,
    marginBottom: 8,
  },

  brandWhite: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 3,
  },

  tagWhite: {
    color: "#B8C5C8",
    fontSize: 10,
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 5,
  },

  helpful: {
    color: "#7BE36A",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 30,
  },

  loginTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },

  loginSub: {
    color: "#9EACB0",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 26,
  },

  labelWhite: {
    color: "#DCE5E7",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },

  darkInput: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 18,
    paddingHorizontal: 17,
    height: 56,
    color: "#FFFFFF",
    fontSize: 15,
    marginBottom: 17,
  },

  greenButton: {
    backgroundColor: "#79E36A",
    minHeight: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },

  buttonText: {
    color: "#071015",
    fontSize: 16,
    fontWeight: "800",
  },

  noteDark: {
    color: "#7F8D91",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 18,
  },

  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  brand: {
    color: "#123239",
    fontSize: 29,
    fontWeight: "900",
    letterSpacing: 2,
  },

  tag: {
    color: "#708084",
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 3,
  },

  logout: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(20,50,57,0.08)",
  },

  logoutText: {
    color: "#23434A",
    fontSize: 12,
    fontWeight: "700",
  },

  hero: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 28,
    padding: 23,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  helpfulGreen: {
    color: "#52A947",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 9,
  },

  heroTitle: {
    color: "#102D33",
    fontSize: 27,
    fontWeight: "850",
    lineHeight: 33,
  },

  heroSub: {
    color: "#718085",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },

  section: {
    color: "#19373D",
    fontSize: 19,
    fontWeight: "800",
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#19373D",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 24,
    marginBottom: 14,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    minHeight: 145,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderRadius: 23,
    padding: 17,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  icon: {
    fontSize: 30,
    marginBottom: 14,
  },

  cardTitle: {
    color: "#17353B",
    fontSize: 15,
    fontWeight: "800",
  },

  cardSub: {
    color: "#7B888C",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },

  careBanner: {
    backgroundColor: "#12383A",
    borderRadius: 27,
    padding: 22,
    marginTop: 8,
    marginBottom: 10,
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },

  careTitle: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
  },

  careText: {
    color: "#C5D8D5",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    marginBottom: 17,
  },

  whiteButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  whiteButtonText: {
    color: "#17383B",
    fontSize: 14,
    fontWeight: "800",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  back: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "rgba(20,50,57,0.08)",
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  backText: {
    color: "#17373D",
    fontSize: 36,
    fontWeight: "300",
    lineHeight: 40,
    marginTop: -4,
  },

  headerTitle: {
    color: "#18363C",
    fontSize: 18,
    fontWeight: "800",
  },

  serviceHero: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 27,
    padding: 22,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
  },

  careHero: {
    backgroundColor: "#12383A",
    borderRadius: 27,
    padding: 23,
    marginBottom: 22,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },

  bigIcon: {
    fontSize: 38,
    marginBottom: 10,
  },

  label: {
    color: "#27444A",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
    marginTop: 4,
  },

  input: {
    minHeight: 55,
    backgroundColor: "rgba(255,255,255,0.82)",
    borderWidth: 1,
    borderColor: "rgba(30,65,70,0.09)",
    borderRadius: 17,
    paddingHorizontal: 16,
    color: "#17363C",
    fontSize: 14,
    marginBottom: 16,
  },

  notes: {
    minHeight: 95,
    paddingTop: 15,
    textAlignVertical: "top",
  },

  durationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  duration: {
    width: "18%",
    height: 52,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderWidth: 1,
    borderColor: "rgba(30,65,70,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  durationSelected: {
    backgroundColor: "#173D3E",
    borderColor: "#173D3E",
  },

  durationText: {
    color: "#53666A",
    fontSize: 13,
    fontWeight: "800",
  },

  durationTextSelected: {
    color: "#FFFFFF",
  },

  info: {
    backgroundColor: "rgba(123,227,106,0.12)",
    borderWidth: 1,
    borderColor: "rgba(82,169,71,0.15)",
    borderRadius: 19,
    padding: 17,
    marginTop: 3,
    marginBottom: 15,
  },

  infoTitle: {
    color: "#285B32",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 6,
  },

  infoText: {
    color: "#56705A",
    fontSize: 12,
    lineHeight: 18,
  },

  fare: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 21,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(30,65,70,0.07)",
  },

  fareTitle: {
    color: "#17363C",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 12,
  },

  fareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
  },

  primaryLight: {
    backgroundColor: "#79E36A",
    minHeight: 59,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 5,
    shadowOpacity: 0.13,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  smallNote: {
    color: "#7B898D",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 14,
    marginBottom: 10,
  },

  priceBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(123,227,106,0.16)",
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginBottom: 13,
  },

  priceBadgeText: {
    color: "#5A9E50",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },

  careBookButton: {
    minHeight: 58,
    backgroundColor: "#79E36A",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginTop: 18,
  },

  careBookText: {
    color: "#102C31",
    fontSize: 15,
    fontWeight: "900",
  },

  careBookArrow: {
    color: "#102C31",
    fontSize: 25,
    fontWeight: "700",
  },

  careIncludeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 20,
    padding: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.95)",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  careIncludeIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(123,227,106,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  careIncludeEmoji: {
    fontSize: 22,
  },

  careIncludeContent: {
    flex: 1,
  },

  careIncludeTitle: {
    color: "#19373D",
    fontSize: 14,
    fontWeight: "800",
  },

  careIncludeText: {
    color: "#758387",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },

  careNote: {
    backgroundColor: "rgba(18,56,58,0.06)",
    borderRadius: 19,
    padding: 17,
    marginTop: 5,
    marginBottom: 20,
  },

  careNoteTitle: {
    color: "#25474C",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },

  careNoteText: {
    color: "#6F7F83",
    fontSize: 11,
    lineHeight: 17,
  },
});

 
