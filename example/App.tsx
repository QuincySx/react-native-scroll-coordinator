import { useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { DetailScreen, type ExampleDetail } from './src/DetailScreen';
import { ScenarioGallery } from './src/ScenarioGallery';
import { type ScenarioId, scenarioCatalog } from './src/scenarios/catalog';
import { scenarioRenderers } from './src/scenarios';

function AppContent() {
  const galleryScrollOffset = useRef(0);
  const [selectedId, setSelectedId] = useState<ScenarioId | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ExampleDetail | null>(
    null,
  );

  useEffect(() => {
    if (selectedId == null) {
      return undefined;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (selectedDetail != null) {
          setSelectedDetail(null);
          return true;
        }
        setSelectedId(null);
        return true;
      },
    );
    return () => subscription.remove();
  }, [selectedDetail, selectedId]);

  if (selectedId == null) {
    return (
      <ScenarioGallery
        initialScrollOffset={galleryScrollOffset.current}
        onScrollOffsetChange={offset => {
          galleryScrollOffset.current = offset;
        }}
        onSelect={setSelectedId}
      />
    );
  }

  const scenario = scenarioCatalog.find(item => item.id === selectedId);
  const Scenario = scenarioRenderers[selectedId];

  return (
    <View style={styles.screen}>
      <View style={styles.navigationBar}>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => {
            setSelectedDetail(null);
            setSelectedId(null);
          }}
          style={styles.backButton}
          testID="scenario-back"
        >
          <Text style={styles.backLabel}>‹ Scenarios</Text>
        </Pressable>
        <Text numberOfLines={1} style={styles.navigationTitle}>
          {scenario?.title}
        </Text>
      </View>
      <Scenario onOpenDetail={setSelectedDetail} />
      {selectedDetail == null ? null : (
        <DetailScreen
          detail={selectedDetail}
          onBack={() => setSelectedDetail(null)}
        />
      )}
    </View>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <AppContent />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  backButton: {
    justifyContent: 'center',
    minHeight: 44,
    paddingRight: 12,
  },
  backLabel: {
    color: '#2563EB',
    fontSize: 15,
    fontWeight: '700',
  },
  navigationBar: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  navigationTitle: {
    color: '#0F172A',
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'right',
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  screen: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
});

export default App;
