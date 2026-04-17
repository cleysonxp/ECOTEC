import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../styles/colors';
import { LogoPlaceholder } from '../components/LogoPlaceholder';
import { RootStackParamList } from '../utils/navigationTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cep, setCep] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [street, setStreet] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleRegister = () => {
    Keyboard.dismiss();
    console.log('Register:', {
      username,
      email,
      password,
      confirmPassword,
      cep,
      state,
      city,
      neighborhood,
      street,
    });
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -50}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <LogoPlaceholder />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Junte-se ao</Text>
              <Text style={styles.titleBrand}>EcoTec</Text>
              <Text style={styles.subtitle}>Crie sua conta agora</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome de Usuário</Text>
              <TextInput
                style={styles.input}
                placeholder="seu_usuario"
                placeholderTextColor={colors.placeholder}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoComplete="username"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="seu_email@example.com"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Digite sua senha"
                  placeholderTextColor={colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.visibilityIcon}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Text style={styles.visibilityText}>
                    {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Senha</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirme sua senha"
                  placeholderTextColor={colors.placeholder}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!isConfirmPasswordVisible}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.visibilityIcon}
                  onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                >
                  <Text style={styles.visibilityText}>
                    {isConfirmPasswordVisible ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.sectionTitle}>Endereço</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>CEP</Text>
              <TextInput
                style={styles.input}
                placeholder="00000-000"
                placeholderTextColor={colors.placeholder}
                value={cep}
                onChangeText={setCep}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Estado</Text>
                <TextInput
                  style={styles.input}
                  placeholder="SP"
                  placeholderTextColor={colors.placeholder}
                  value={state}
                  onChangeText={setState}
                  maxLength={2}
                  autoCapitalize="characters"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>Cidade</Text>
                <TextInput
                  style={styles.input}
                  placeholder="São Paulo"
                  placeholderTextColor={colors.placeholder}
                  value={city}
                  onChangeText={setCity}
                  autoCapitalize="words"
                />
              </View>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Bairro</Text>
              <TextInput
                style={styles.input}
                placeholder="Vila Mariana"
                placeholderTextColor={colors.placeholder}
                value={neighborhood}
                onChangeText={setNeighborhood}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Rua</Text>
              <TextInput
                style={styles.input}
                placeholder="Rua Principal, 123"
                placeholderTextColor={colors.placeholder}
                value={street}
                onChangeText={setStreet}
                autoCapitalize="words"
              />
            </View>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>Cadastrar</Text>
            </TouchableOpacity>
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Já tem conta? </Text>
              <TouchableOpacity onPress={handleLoginPress}>
                <Text style={styles.loginLink}>Faça login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  content: {
    paddingHorizontal: 26,
    paddingVertical: 20,
  },
  logoContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  titleContainer: {
    marginBottom: 28,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  titleBrand: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: colors.placeholder,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 20,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  inputContainer: {
    marginBottom: 18,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.lightGray,
    fontWeight: '500',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.lightGray,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  visibilityIcon: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visibilityText: {
    fontSize: 20,
  },
  registerButton: {
    height: 54,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  registerButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
    letterSpacing: 0.2,
  },
});