import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';

const SERA_LOGO = require('./assets/sera white logo png.png');

export default function App() {
  const [started, setStarted] = React.useState(false);

  if (started) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#050807" />

        <View style={styles.header}>
          <Image source={SERA_LOGO} style={styles.smallLogo} />
        </View>

        <View style={styles.home}>
          <Text style={styles.welcome}>Welcome to SERA</Text>

          <Text style={styles.subtitle}>
            What can we help you with today?
          </Text>

          <View style={styles.services}>
            <Service icon="🚲" title="Bike Taxi" />
            <Service icon="📦" title="Parcel" />
            <Service icon="🛍️" title="Buy & Bring" />
            <Service icon="📄" title="Print & Xerox" />
            <Service icon="🏃" title="General Tasks" />
            <Service icon="❤️" title="SERA Care" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050807" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoBox}>
          <Image source={SERA_LOGO} style={styles.logo} />
        </View>

        <Text style={styles.hero}>
          A More Helpful
        </Text>

        <Text style={styles.heroGreen}>
          Tomorrow
        </Text>

        <Text style={styles.description}>
          Your daily tasks.{'\n'}
          Handled with care.
        </Text>

        <View style={styles.servicePreview}>
          <Preview icon="🏠" text="People" />
          <Preview icon="📦" text="Tasks" />
          <Preview icon="❤️" text="Care" />
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => setStarted(true)}
        >
          <Text style={styles.buttonText}>
            Get Started
          </Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>

        <Pressable>
          <Text style={styles.login}>
            Already have an account?{' '}
            <Text style={styles.loginGreen}>Login</Text>
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          PEOPLE • TASKS • CARE
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Preview({ icon, text }) {
  return (
    <View style={styles.previewItem}>
      <View style={styles.previewCircle}>
        <Text style={styles.previewIcon}>{icon}</Text>
      </View>
      <Text style={styles.previewText}>{text}</Text>
    </View>
  );
}

function Service({ icon, title }) {
  return (
    <Pressable style={styles.service}>
      <View style={styles.serviceIcon}>
        <Text style={styles.serviceEmoji}>{icon}</Text>
      </View>

      <Text style={styles.serviceTitle}>
        {title}
      </Text>

      <Text style={styles.serviceArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050807',
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },

  logoBox: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 35,
  },

  logo: {
    width: 310,
    height: 210,
    resizeMode: 'contain',
  },

  hero: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },

  heroGreen: {
    color: '#00E676',
    fontSize: 38,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
  },

  description: {
    color: '#D4DAD7',
    fontSize: 18,
    lineHeight: 27,
    textAlign: 'center',
    marginTop: 18,
  },

  servicePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 38,
    marginBottom: 40,
  },

  previewItem: {
    alignItems: 'center',
    flex: 1,
  },

  previewCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#09251D',
    borderWidth: 1,
    borderColor: '#087F5B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  previewIcon: {
    fontSize: 28,
  },

  previewText: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 9,
  },

  button: {
    width: '100%',
    height: 62,
    borderRadius: 18,
    backgroundColor: '#00C978',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },

  buttonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },

  buttonText: {
    color: '#00150D',
    fontSize: 19,
    fontWeight: '800',
  },

  arrow: {
    color: '#00150D',
    fontSize: 28,
    marginLeft: 12,
    marginTop: -2,
  },

  login: {
    color: '#B8C1BD',
    fontSize: 15,
    marginTop: 25,
  },

  loginGreen: {
    color: '#00E676',
    fontWeight: '700',
  },

  footer: {
    color: '#68736E',
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 35,
  },

  header: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#10231C',
  },

  smallLogo: {
    width: 150,
    height: 60,
    resizeMode: 'contain',
  },

  home: {
    flex: 1,
    padding: 24,
  },

  welcome: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginTop: 25,
  },

  subtitle: {
    color: '#9BA8A2',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 25,
  },

  services: {
    gap: 12,
  },

  service: {
    minHeight: 72,
    backgroundColor: '#0B1511',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#17352A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#09251D',
    justifyContent: 'center',
    alignItems: 'center',
  },

  serviceEmoji: {
    fontSize: 24,
  },

  serviceTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
    flex: 1,
  },

  serviceArrow: {
    color: '#00E676',
    fontSize: 28,
  },
});
