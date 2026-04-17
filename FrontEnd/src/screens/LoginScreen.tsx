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

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = () => {
    Keyboard.dismiss();
    console.log('Login:', { email, password });
  };

  const handleRegisterPress = () => {
    navigation.navigate('Register');
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
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <LogoPlaceholder />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Bem-vindo ao</Text>
              <Text style={styles.titleBrand}>EcoTec</Text>
              <Text style={styles.subtitle}>Acesse sua conta para continuar</Text>
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome de Usuário ou Email</Text>
              <TextInput
                style={styles.input}
                placeholder="seu_usuario@email.com"
                placeholderTextColor={colors.placeholder}
                value={email}
                onChangeText={setEmail}
                editable={true}
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
                  editable={true}
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
            <TouchableOpacity style={styles.forgotPasswordContainer}>
              <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Entrar</Text>
            </TouchableOpacity>
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Não tem conta? </Text>
              <TouchableOpacity onPress={handleRegisterPress}>
                <Text style={styles.signUpLink}>Cadastre-se</Text>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 26,
    paddingVertical: 20,
    justifyContent: 'center',
  },
  titleContainer: {
    marginBottom: 32,
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
  inputContainer: {
    marginBottom: 20,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 28,
  },
  forgotPassword: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'right',
    letterSpacing: 0.2,
  },
  loginButton: {
    height: 54,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  signUpText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  signUpLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
    letterSpacing: 0.2,
  },
});