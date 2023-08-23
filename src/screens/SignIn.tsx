import { VStack, Image, Text, Center, Heading, ScrollView } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { AuthNavigatorRoutesProps } from "@routes/auth.routes";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import LogoSvg from "@assets/logo.svg";
import BackgroundImg from "@assets/background.png";
import { Input } from "@components/Input";
import { Button } from "@components/Button";
import { Controller, useForm } from "react-hook-form";

interface SignInFormData {
  email: string;
  password: string;
}

const signInFormSchema = yup.object({
  email: yup.string().required("Informe o email").email("Email inválido"),
  password: yup.string().required("Informe a senha").min(6, "Mínimo 6 dígitos"),
});

export function SignIn() {
  const navigation = useNavigation<AuthNavigatorRoutesProps>();
  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<SignInFormData>({
    resolver: yupResolver(signInFormSchema),
  });

  function handleNewAccount() {
    navigation.navigate("signUp");
  }

  function handleSignIn(formData: SignInFormData) {
    console.log({ formData });
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <VStack flex={1} px={10} pb={16}>
        <Image
          source={BackgroundImg}
          // O defaultSource é uma imagem que será exibida enquanto a imagem principal não for carregada
          // Ele carrega uma imagem local, que está dentro do projeto
          // Isso é importante para que o usuário não veja uma tela em branco enquanto a imagem principal é carregada
          // Ele memoriza a imagem principal, para que ela não precise ser carregada novamente
          defaultSource={BackgroundImg}
          alt="Pessoas treinando"
          resizeMode="contain"
          position="absolute"
        />

        <Center my={24}>
          <LogoSvg />
          <Text color="gray.100" fontSize="sm">
            Treine sua mente e o seu corpo
          </Text>
        </Center>

        <Center>
          <Heading color="gray.100" fontSize="xl" mb={6} fontFamily="heading">
            Acesse sua conta
          </Heading>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                value={value}
                errorMessage={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <Input
                placeholder="Senha"
                secureTextEntry
                onChangeText={onChange}
                value={value}
                errorMessage={errors.password?.message}
              />
            )}
          />
          <Button title="Acessar" onPress={handleSubmit(handleSignIn)} />
        </Center>

        <Center mt={24}>
          <Text color="gray.100" fontFamily="body" fontSize="sm" mb={3}>
            Ainda não tem acesso?
          </Text>
          <Button
            title="Criar conta"
            variant="outline"
            onPress={handleNewAccount}
          />
        </Center>
      </VStack>
    </ScrollView>
  );
}
