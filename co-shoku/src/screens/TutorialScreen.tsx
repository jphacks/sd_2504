import { useRef, useState } from 'react';
import { FlatList, Image, ListRenderItemInfo, Pressable, StyleSheet, Text, View, ViewToken } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { TutorialSlide, TUTORIAL_SLIDES } from '../constants/tutorialSlides';

export const TutorialScreen = () => {
  const { completeOnboarding } = useAppContext();
  const listRef = useRef<FlatList<TutorialSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const handleViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 60,
  };

  const renderItem = ({ item }: ListRenderItemInfo<TutorialSlide>) => (
    <View style={styles.slide}>
      <View style={styles.illustration}>
        {item.image ? (
          <Image source={item.image} style={styles.illustrationImage} resizeMode="contain" />
        ) : (
          <Text style={styles.emoji}>🍽️</Text>
        )}
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );

  const handleSkip = () => {
    completeOnboarding();
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={handleSkip}>
          <Text style={styles.skip}>スキップ</Text>
        </Pressable>
      </View>
      <FlatList
        ref={listRef}
        data={TUTORIAL_SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      <View style={styles.pagination}>
        {TUTORIAL_SLIDES.map((slide, index) => (
          <View key={slide.id} style={[styles.dot, activeIndex === index && styles.dotActive]} />
        ))}
      </View>
      <View style={styles.footer}>
        {activeIndex === TUTORIAL_SLIDES.length - 1 ? (
          <PrimaryButton title="はじめる" onPress={completeOnboarding} />
        ) : (
          <PrimaryButton
            title="次へ"
            onPress={() => listRef.current?.scrollToIndex({ index: activeIndex + 1 })}
          />
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  skip: {
    color: '#777',
    fontWeight: '500',
  },
  slide: {
    width: 320,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  illustration: {
    width: 220,
    height: 220,
    borderRadius: 16,
    backgroundColor: '#FFEAE0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  emoji: {
    fontSize: 72,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 24,
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFC1A8',
    marginHorizontal: 4,
  },
  dotActive: {
    width: 16,
    backgroundColor: '#FF7F50',
  },
  footer: {
    marginTop: 24,
  },
});
