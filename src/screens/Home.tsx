import { useState } from "react";
import { FlatList, HStack, Heading, Text, VStack } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";

import { Group } from "@components/Group";
import { HomeHeader } from "@components/HomeHeader";
import { ExerciseCard } from "@components/ExerciseCard";

export function Home() {
  const navigation = useNavigation<AppNavigatorRoutesProps>();
  const [groupSelected, setGroupSelected] = useState("costa");
  const [groups, setGroups] = useState([
    "costa",
    "ombro",
    "biceps",
    "triceps",
    "peito",
    "perna",
    "panturrilha",
    "abdomen",
  ]);
  const [exercises, setExercises] = useState([
    "Supino",
    "Rosca direta",
    "Rosca inversa",
    "Rosca francesa",
    "Triceps corda",
    "Triceps testa",
    "Triceps coice",
    "Triceps pulley",
  ]);

  function handleOpenExerciseDetail() {
    navigation.navigate("exercise");
  }

  return (
    <VStack flex={1}>
      <HomeHeader />
      <FlatList
        data={groups}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Group
            name={item}
            isActive={
              groupSelected.toLocaleUpperCase() === item.toLocaleUpperCase()
            }
            onPress={() => setGroupSelected(item)}
          />
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        _contentContainerStyle={{ px: 8 }}
        my={10}
        maxH={10}
      />

      <VStack flex={1} px={8}>
        <HStack justifyContent="space-between" mb={5}>
          <Heading color="gray.200" fontSize="md">
            Exercícios
          </Heading>
          <Text color="gray.200" fontSize="sm">
            {exercises.length}
          </Text>
        </HStack>
        <FlatList
          data={exercises}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <ExerciseCard onPress={handleOpenExerciseDetail} />
          )}
          showsVerticalScrollIndicator={false}
          _contentContainerStyle={{ pb: 20 }}
        />
      </VStack>
    </VStack>
  );
}
