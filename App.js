import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ykltmnvxxwwtinugotxp.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_M_UUA7yqv8kKfc9WwTl5aA_Fxo_HIlN";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const SERVICES = [
  {
    name: "Bike Taxi",
    icon: "🏍️",
    description: "Quick local rides",
  },
  {
    name: "Parcel",
    icon: "📦",
    description: "Send a parcel locally",
  },
  {
    name: "Buy & Bring",
    icon: "🛍️",
    description: "We'll buy and bring it",
  },
  {
    name: "Print & Xerox",
    icon: "📄",
    description: "Print and deliver",
  },
  {
    name: "General Task",
    icon: "🏃",
    description: "Everyday local tasks",
  },
  {
    name: "SERA Care",
    icon: "❤️",
    description: "When you can't be there",
  },
];

export default function App() {
  const [screen, setScreen] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  const [selectedService, setSelectedService] = useState(null);

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");

  const [personName, setPersonName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");

  const [careMinutes, setCareMinutes] = useState("180");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;

      if (data.session?.user) {
        setUser(data.session.user);
        setScreen("home");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function login() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      Alert.alert(
        "Login",
        "Enter your test email and password."
      );
      return;
    }

    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

    setLoading(false);

    if (error) {
      Alert.alert("Login failed", error.message);
      return;
    }

    setUser(data.user);
    setScreen("home");
  }

  async function logout() {
    await supabase.auth.signOut();

    setUser(null);
    setScreen("login");

    setEmail("");
    setPassword("");
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

  async function createBooking() {
    if (!user) {
      Alert.alert(
        "Login required",
        "Please log in first."
      );

      setScreen("login");
      return;
    }

    if (!pickup.trim() || !destination.trim()) {
      Alert.alert(
        "Missing details",
        "Enter pickup and destination."
      );

      return;
    }

    const isCare =
      selectedService?.name === "SERA Care";

    if (isCare && !personName.trim()) {
      Alert.alert(
        "Missing details",
        "Enter the name of the person needing care."
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
          destination_address: destination.trim(),
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
        "Booking error",
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
          "Care booking error",
          careError.message
        );

        return;
      }
    }

    setLoading(false);

    Alert.alert(
      "Request created",
      `${serviceType} request created successfully.`,
      [
        {
          text: "OK",
          onPress: () => setScreen("home"),
        },
      ]
    );
  }

  function LoginScreen() {
    return (
      <SafeAreaView style={styles.dark}>
        <ScrollView
          contentContainerStyle={styles.login}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require(
              "./assets/sera white logo png.png"
            )}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.brandWhite}>
            SERA
          </Text>

          <Text style={styles.tagWhite}>
            PEOPLE • TASKS • CARE
          </Text>

          <Text style={styles.helpful}>
            A More Helpful Tomorrow
          </Text>

          <Text style={styles.loginTitle}>
            Welcome to SERA
          </Text>

          <Text style={styles.loginSub}>
            Development login — phone OTP will
            be added before launch
          </Text>

          <Text style={styles.labelWhite}>
            Test email
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="Enter your test email"
            placeholderTextColor="#8C969B"
            style={styles.darkInput}
          />

          <Text style={styles.labelWhite}>
            Password
          </Text>

          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter your test password"
            placeholderTextColor="#8C969B"
            style={styles.darkInput}
          />

          <Pressable
            style={[
              styles.greenButton,
              loading && styles.disabledButton,
            ]}
            onPress={login}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? "Signing in..."
                : "Continue"}
            </Text>
          </Pressable>

          <Text style={styles.noteDark}>
            Development mode only. Phone OTP +
            MSG91 will be connected later.
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  function HomeScreen() {
    return (
      <SafeAreaView style={styles.light}>
        <ScrollView
          contentContainerStyle={styles.content}
        >
          <View style={styles.top}>
            <View>
              <Text style={styles.brand}>
                SERA
              </Text>

              <Text style={styles.tag}>
                PEOPLE • TASKS • CARE
              </Text>
            </View>

            <Pressable
              onPress={logout}
              style={styles.logout}
            >
              <Text style={styles.logoutText}>
                Logout
              </Text>
            </Pressable>
          </View>

          <View style={styles.hero}>
            <Text style={styles.helpfulGreen}>
              A More Helpful Tomorrow
            </Text>

            <Text style={styles.heroTitle}>
              What can we help with?
            </Text>

            <Text style={styles.heroSub}>
              Everyday tasks, local services and
              care — all in one place.
            </Text>
          </View>

          <Text style={styles.section}>
            Services
          </Text>

          <View style={styles.grid}>
            {SERVICES.map((item) => (
              <Pressable
                key={item.name}
                style={styles.card}
                onPress={() =>
                  openService(item)
                }
              >
                <Text style={styles.icon}>
                  {item.icon}
                </Text>

                <Text style={styles.cardTitle}>
                  {item.name}
                </Text>

                <Text style={styles.cardSub}>
                  {item.description}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.careBanner}>
            <Text style={styles.careTitle}>
              SERA Care
            </Text>

            <Text style={styles.careText}>
              When you can't be there, we can be
              there.
            </Text>

            <Pressable
              style={styles.whiteButton}
              onPress={() =>
                openService({
                  name: "SERA Care",
                  icon: "❤️",
                  description:
                    "Trusted human companionship",
                })
              }
            >
              <Text
                style={styles.whiteButtonText}
              >
                Book a Care Partner
              </Text>
            </Pressable>
          </View>

          <Text style={styles.footer}>
            SERA • PEOPLE • TASKS • CARE
          </Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  function BookingScreen() {
    const isCare =
      selectedService?.name === "SERA Care";

    const minutes = Math.max(
      30,
      Number(careMinutes) || 180
    );

    const careAmount =
      (minutes / 60) * 150;

    return (
      <SafeAreaView style={styles.light}>
        <ScrollView
          contentContainerStyle={styles.content}
        >
          <View style={styles.header}>
            <Pressable
              onPress={() =>
                setScreen("home")
              }
              style={styles.back}
            >
              <Text style={styles.backText}>
                ‹
              </Text>
            </Pressable>

            <Text style={styles.headerTitle}>
              {selectedService?.name}
            </Text>

            <View
              style={{
                width: 42,
              }}
            />
          </View>

          <View
            style={
              isCare
                ? styles.careHero
                : styles.serviceHero
            }
          >
            <Text style={styles.bigIcon}>
              {selectedService?.icon}
            </Text>

            <Text style={styles.heroTitle}>
              {selectedService?.name}
            </Text>

            <Text style={styles.heroSub}>
              {isCare
                ? "When you can't be there, we can be there."
                : selectedService?.description}
            </Text>
          </View>

          {isCare && (
            <>
              <Text style={styles.label}>
                Person needing assistance
              </Text>

              <TextInput
                value={personName}
                onChangeText={setPersonName}
                placeholder="Name"
                placeholderTextColor="#9AA5A9"
                style={styles.input}
              />
            </>
          )}

          <Text style={styles.label}>
            {isCare
              ? "Pickup location"
              : "Pickup / start"}
          </Text>

          <TextInput
            value={pickup}
            onChangeText={setPickup}
            placeholder="Enter pickup or start location"
            placeholderTextColor="#9AA5A9"
            style={styles.input}
          />

          <Text style={styles.label}>
            Destination
          </Text>

          <TextInput
            value={destination}
            onChangeText={setDestination}
            placeholder="Enter destination"
            placeholderTextColor="#9AA5A9"
            style={styles.input}
          />

          {isCare && (
            <>
              <Text style={styles.label}>
                Purpose
              </Text>

              <TextInput
                value={purpose}
                onChangeText={setPurpose}
                placeholder="Hospital visit, doctor appointment, etc."
                placeholderTextColor="#9AA5A9"
                style={styles.input}
              />
            </>
          )}

          <Text style={styles.label}>
            Notes
          </Text>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional instructions"
            placeholderTextColor="#9AA5A9"
            multiline
            style={[
              styles.input,
              styles.notes,
            ]}
          />

          {isCare && (
            <>
              <Text style={styles.section}>
                Expected care duration
              </Text>

              <View
                style={styles.durationRow}
              >
                {[
                  "60",
                  "120",
                  "180",
                  "240",
                  "300",
                ].map((value) => (
                  <Pressable
                    key={value}
                    onPress={() =>
                      setCareMinutes(value)
                    }
                    style={[
                      styles.duration,
                      careMinutes === value &&
                        styles.durationSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.durationText,
                        careMinutes === value &&
                          styles.durationTextSelected,
                      ]}
                    >
                      {Number(value) / 60}h
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>
                Custom minutes
              </Text>

              <TextInput
                value={careMinutes}
                onChangeText={setCareMinutes}
                keyboardType="number-pad"
                placeholder="Example: 107"
                placeholderTextColor="#9AA5A9"
                style={styles.input}
              />

              <View style={styles.info}>
                <Text style={styles.infoTitle}>
                  Care pricing
                </Text>

                <Text style={styles.infoText}>
                  Companion time ₹150/hour,
                  billed per minute. Travel is
                  separate at ₹7/km. Minimum
                  care charge: 30 minutes.
                </Text>
              </View>

              <View style={styles.fare}>
                <Text style={styles.fareTitle}>
                  Estimated Care
                </Text>

                <View style={styles.fareRow}>
                  <Text>
                    Companion time
                  </Text>

                  <Text>
                    ₹{careAmount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.fareRow}>
                  <Text>
                    Travel
                  </Text>

                  <Text>
                    Calculated after trip
                  </Text>
                </View>
              </View>
            </>
          )}

          <Pressable
            style={[
              styles.primaryLight,
              loading &&
                styles.disabledButton,
            ]}
            onPress={createBooking}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? "Creating request..."
                : "Request SERA Partner →"}
            </Text>
          </Pressable>

          <Text style={styles.smallNote}>
            Development build: booking data is
            saved to Supabase. Maps, matching,
            payment and SMS will be connected
            later.
          </Text>
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
    backgroundColor: "#071015",
  },

  light: {
    flex: 1,
    backgroundColor: "#F7F9F8",
  },

  login: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },

  logo: {
    width: "100%",
    height: 120,
    marginBottom: 4,
  },

  brandWhite: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 2,
  },

  tagWhite: {
    color: "#C7D0D3",
    fontSize: 11,
    letterSpacing: 2,
    textAlign: "center",
    marginTop: 4,
  },

  helpful: {
    color: "#7BE36A",
    textAlign: "center",
    fontSize: 15,
    marginTop: 12,
    marginBottom: 28,
  },

  loginTitle: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },

  loginSub: {
    color: "#AAB5B9",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    marginBottom: 24,
  },

  labelWhite: {
    color: "#DCE4E6",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 7,
  },

  darkInput: {
    backgroundColor: "#111C21",
    borderWidth: 1,
    borderColor: "#2C3A40",
    borderRadius: 14,
    color: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 15,
  },

  greenButton: {
    backgroundColor: "#1F6F4A",
    borderRadius: 15,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 7,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  disabledButton: {
    opacity: 0.6,
  },

  noteDark: {
    color: "#718086",
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 18,
  },

  content: {
    padding: 20,
    paddingBottom: 45,
  },

  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },

  brand: {
    fontSize: 28,
    fontWeight: "900",
    color: "#155D42",
    letterSpacing: 1,
  },

  tag: {
    fontSize: 9,
    color: "#64726F",
    letterSpacing: 1.5,
    marginTop: 2,
  },

  logout: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#E8EFEC",
  },

  logoutText: {
    color: "#155D42",
    fontWeight: "700",
  },

  hero: {
    backgroundColor: "#E4F1EB",
    borderRadius: 24,
    padding: 22,
    marginBottom: 25,
  },

  helpfulGreen: {
    color: "#2C8A61",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
});
 
