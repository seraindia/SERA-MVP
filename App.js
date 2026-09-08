import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ykltmnvxxwwtinugotxp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_M_UUA7yqv8kKfc9WwTl5aA_Fxo_HIlN";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const GREEN = "#20D46B";
const DARK = "#073B3A";
const BG = "#F7F9F8";
const TEXT = "#102323";
const MUTED = "#6B7777";

const SERVICES = [
  {
    id: "bike",
    icon: "🏍️",
    title: "Bike Taxi",
    subtitle: "Fast local rides",
  },
  {
    id: "parcel",
    icon: "📦",
    title: "Parcel",
    subtitle: "Pickup & delivery",
  },
  {
    id: "buy",
    icon: "🛍️",
    title: "Buy & Bring",
    subtitle: "We'll buy & bring it",
  },
  {
    id: "print",
    icon: "📄",
    title: "Print & Xerox",
    subtitle: "Print and deliver",
  },
  {
    id: "task",
    icon: "🏃",
    title: "General Task",
    subtitle: "Local help & errands",
  },
  {
    id: "care",
    icon: "❤️",
    title: "SERA Care",
    subtitle: "When you can't be there",
  },
];

export default function App() {
  const [screen, setScreen] = useState("login");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  async function sendOTP() {
    const cleanPhone = phone.replace(/\D/g, "");

    if (cleanPhone.length !== 10) {
      Alert.alert(
        "Check your number",
        "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${cleanPhone}`,
    });

    setLoading(false);

    if (error) {
      Alert.alert("OTP", error.message);
      return;
    }

    setScreen("otp");
  }

  async function verifyOTP() {
    if (otp.length !== 6) {
      Alert.alert("Check OTP", "Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    const cleanPhone = phone.replace(/\D/g, "");

    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${cleanPhone}`,
      token: otp,
      type: "sms",
    });

    setLoading(false);

    if (error) {
      Alert.alert("Verification failed", error.message);
      return;
    }

    setScreen("home");
  }

  function selectService(service) {
    setSelectedService(service);
    setScreen("booking");
  }

  function goHome() {
    setSelectedService(null);
    setScreen("home");
  }

  if (screen === "login") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loginContainer}>
          <Image
            source={require("./assets/sera white logo png.png")}
            style={styles.loginLogo}
            resizeMode="contain"
          />

          <View style={styles.logoFallback}>
            <Text style={styles.logoText}>SERA</Text>
            <Text style={styles.logoTagline}>
              PEOPLE • TASKS • CARE
            </Text>
          </View>

          <Text style={styles.welcome}>A More Helpful Tomorrow.</Text>

          <Text style={styles.loginTitle}>Welcome to SERA</Text>

          <Text style={styles.loginSubtitle}>
            Enter your mobile number to continue
          </Text>

          <View style={styles.phoneBox}>
            <Text style={styles.country}>+91</Text>

            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
              placeholder="Mobile number"
              placeholderTextColor="#9AA5A5"
              style={styles.phoneInput}
            />
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={sendOTP}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Sending OTP..." : "Continue"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.terms}>
            By continuing, you agree to SERA's Terms & Privacy Policy.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "otp") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.otpContainer}>
          <TouchableOpacity onPress={() => setScreen("login")}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>

          <View style={styles.smallLogo}>
            <Text style={styles.smallLogoText}>SERA</Text>
          </View>

          <Text style={styles.loginTitle}>Verify your number</Text>

          <Text style={styles.loginSubtitle}>
            Enter the 6-digit OTP sent to +91 {phone}
          </Text>

          <TextInput
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            placeholder="000000"
            placeholderTextColor="#9AA5A5"
            style={styles.otpInput}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={verifyOTP}
            disabled={loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={sendOTP}>
            <Text style={styles.resend}>Resend OTP</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (screen === "home") {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.homeContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.hello}>Hello 👋</Text>
              <Text style={styles.headerTitle}>How can SERA help?</Text>
            </View>

            <View style={styles.profileCircle}>
              <Text style={styles.profileIcon}>👤</Text>
            </View>
          </View>

          <View style={styles.banner}>
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>
                A More Helpful Tomorrow.
              </Text>

              <Text style={styles.bannerSubtitle}>
                People • Tasks • Care
              </Text>
            </View>

            <Text style={styles.bannerIcon}>✨</Text>
          </View>

          <Text style={styles.sectionTitle}>Services</Text>

          <View style={styles.serviceGrid}>
            {SERVICES.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                onPress={() => selectService(service)}
                activeOpacity={0.8}
              >
                <View style={styles.serviceIcon}>
                  <Text style={styles.serviceEmoji}>
                    {service.icon}
                  </Text>
                </View>

                <Text style={styles.serviceTitle}>
                  {service.title}
                </Text>

                <Text style={styles.serviceSubtitle}>
                  {service.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.careBanner}>
            <View style={styles.careHeart}>
              <Text style={styles.careHeartText}>❤️</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.careTitle}>SERA Care</Text>
              <Text style={styles.careSubtitle}>
                When you can't be there, we can be there.
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Your recent activity</Text>

          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No recent bookings</Text>
            <Text style={styles.emptyText}>
              Your completed and active bookings will appear here.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === "booking") {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.bookingContent}>
          <TouchableOpacity onPress={goHome}>
            <Text style={styles.back}>‹ Back</Text>
          </TouchableOpacity>

          <View style={styles.bookingIcon}>
            <Text style={styles.bookingEmoji}>
              {selectedService?.icon}
            </Text>
          </View>

          <Text style={styles.bookingTitle}>
            {selectedService?.title}
          </Text>

          <Text style={styles.bookingSubtitle}>
            {selectedService?.subtitle}
          </Text>

          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <View style={styles.dotGreen} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationLabel}>Pickup / Start</Text>
                <Text style={styles.locationPlaceholder}>
                  Enter pickup location
                </Text>
              </View>
            </View>

            <View style={styles.locationLine} />

            <View style={styles.locationRow}>
              <View style={styles.dotDark} />
              <View style={{ flex: 1 }}>
                <Text style={styles.locationLabel}>Destination</Text>
                <Text style={styles.locationPlaceholder}>
                  Enter destination
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Booking details</Text>

          <View style={styles.detailCard}>
            <Text style={styles.detailText}>
              📍 Live route & distance
            </Text>

            <Text style={styles.detailText}>
              🔔 Partner matching notification
            </Text>

            <Text style={styles.detailText}>
              🗺️ Real-time tracking
            </Text>

            <Text style={styles.detailText}>
              🔐 OTP verification
            </Text>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              Alert.alert(
                "Coming next",
                "Real booking creation will be connected to the SERA backend next."
              )
            }
          >
            <Text style={styles.primaryButtonText}>
              Continue
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  loginContainer: {
    flex: 1,
    padding: 28,
    justifyContent: "center",
  },

  loginLogo: {
    width: 220,
    height: 90,
    alignSelf: "center",
    marginBottom: 4,
  },

  logoFallback: {
    alignItems: "center",
    marginBottom: 18,
  },

  logoText: {
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 5,
    color: DARK,
  },

  logoTagline: {
    fontSize: 10,
    letterSpacing: 3,
    color: GREEN,
    marginTop: 2,
  },

  welcome: {
    textAlign: "center",
    fontSize: 14,
    color: GREEN,
    fontWeight: "700",
    marginBottom: 38,
  },

  loginTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT,
    marginBottom: 8,
  },

  loginSubtitle: {
    fontSize: 15,
    color: MUTED,
    lineHeight: 22,
    marginBottom: 24,
  },

  phoneBox: {
    height: 58,
    borderWidth: 1,
    borderColor: "#DCE4E2",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    marginBottom: 16,
  },

  country: {
    fontSize: 16,
    fontWeight: "700",
    color: TEXT,
    marginRight: 12,
  },

  phoneInput: {
    flex: 1,
    fontSize: 17,
    color: TEXT,
  },

  primaryButton: {
    height: 58,
    backgroundColor: DARK,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
  },

  terms: {
    textAlign: "center",
    color: "#8A9594",
    fontSize: 11,
    lineHeight: 17,
    marginTop: 18,
  },

  otpContainer: {
    flex: 1,
    padding: 28,
    paddingTop: 24,
  },

  back: {
    fontSize: 17,
    fontWeight: "700",
    color: DARK,
    marginBottom: 35,
  },

  smallLogo: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: DARK,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },

  smallLogoText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2,
  },

  otpInput: {
    height: 65,
    borderWidth: 1,
    borderColor: "#DCE4E2",
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    textAlign: "center",
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: 8,
    color: TEXT,
    marginBottom: 16,
  },

  resend: {
    textAlign: "center",
    color: GREEN,
    fontWeight: "800",
    marginTop: 20,
    fontSize: 15,
  },

  homeContent: {
    padding: 20,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  hello: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 3,
  },

  headerTitle: {
    fontSize: 23,
    fontWeight: "900",
    color: TEXT,
  },

  profileCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: DARK,
    alignItems: "center",
    justifyContent: "center",
  },

  profileIcon: {
    fontSize: 21,
  },

  banner: {
    backgroundColor: DARK,
    borderRadius: 22,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 27,
  },

  bannerText: {
    flex: 1,
  },

  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    lineHeight: 26,
  },

  bannerSubtitle: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
    letterSpacing: 1,
  },

  bannerIcon: {
    fontSize: 35,
    marginLeft: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: TEXT,
    marginBottom: 13,
  },

  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  serviceCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#E7EEEC",
  },

  serviceIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#EFF8F3",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  serviceEmoji: {
    fontSize: 25,
  },

  serviceTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: TEXT,
    marginBottom: 4,
  },

  serviceSubtitle: {
    fontSize: 11,
    color: MUTED,
    lineHeight: 16,
  },

  careBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7EEEC",
    marginBottom: 27,
  },

  careHeart: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFF0F1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  careHeartText: {
    fontSize: 22,
  },

  careTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: TEXT,
  },

  careSubtitle: {
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
    lineHeight: 16,
  },

  arrow: {
    fontSize: 28,
    color: DARK,
    marginLeft: 8,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E7EEEC",
  },

  emptyIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: TEXT,
  },

  emptyText: {
    textAlign: "center",
    color: MUTED,
    fontSize: 12,
    marginTop: 5,
    lineHeight: 18,
  },

  bookingContent: {
    padding: 22,
    paddingBottom: 40,
  },

  bookingIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: DARK,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  bookingEmoji: {
    fontSize: 34,
  },

  bookingTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: TEXT,
  },

  bookingSubtitle: {
    color: MUTED,
    fontSize: 14,
    marginTop: 5,
    marginBottom: 25,
  },

  locationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 19,
    borderWidth: 1,
    borderColor: "#E2EAE8",
    marginBottom: 27,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  dotGreen: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: GREEN,
    marginRight: 15,
  },

  dotDark: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DARK,
    marginRight: 15,
  },

  locationLine: {
    height: 27,
    width: 1,
    backgroundColor: "#CBD5D2",
    marginLeft: 5.5,
  },

  locationLabel: {
    fontSize: 12,
    color: MUTED,
    marginBottom: 3,
  },

  locationPlaceholder: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT,
  },

  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 19,
    borderWidth: 1,
    borderColor: "#E2EAE8",
    marginBottom: 22,
  },

  detailText: {
    fontSize: 14,
    color: TEXT,
    fontWeight: "600",
    marginBottom: 15,
  },
});
