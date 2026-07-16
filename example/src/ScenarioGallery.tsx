import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  headerDemoCases,
  headerModeDefinitions,
  headerModeNames,
  type ScenarioId,
  scenarioCatalog,
  tabModeNames,
} from './scenarios/catalog';

export function ScenarioGallery({
  initialScrollOffset,
  onScrollOffsetChange,
  onSelect,
}: {
  initialScrollOffset: number;
  onScrollOffsetChange: (offset: number) => void;
  onSelect: (id: ScenarioId) => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      contentOffset={{ x: 0, y: initialScrollOffset }}
      onScroll={event =>
        onScrollOffsetChange(event.nativeEvent.contentOffset.y)
      }
      scrollEventThrottle={32}
      style={styles.screen}
      testID="scenario-gallery"
    >
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>INTERACTION LAB</Text>
        <Text style={styles.title}>Scroll Coordinator</Text>
        <Text style={styles.subtitle}>
          10 个互不重复的 Header 入口验证核心行为，再验证 7 个内容与交互场景。
        </Text>
      </View>

      <View style={styles.guide}>
        <Text style={styles.guideTitle}>先看清楚 Header 和 TabBar 的区别</Text>
        <Text style={styles.guideBody}>
          先看带/不带视差 ×
          三种收起结果，再测试自动测量、Snap、固定头和无头模式。纯数值变体留给配置与自动化测试，不重复占用首页入口。
        </Text>
      </View>

      {[
        {
          description: '带/不带视差 × 隐藏/保留原布局/替代小布局。',
          group: 'header-matrix' as const,
          title: 'Header 基础矩阵 · 6 种',
        },
        {
          description: '替代布局自动测量、Snap、完全固定，以及无 Header。',
          group: 'header-special' as const,
          title: 'Header 特殊用法 · 4 种',
        },
        {
          description: '列表类型、横向手势、受控 Tab、点击详情与慢加载组合。',
          group: 'integration' as const,
          title: '内容与交互组合 · 7 种',
        },
      ].map(section => (
        <View key={section.group} style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionDescription}>{section.description}</Text>
          </View>
          <View style={styles.grid}>
            {scenarioCatalog
              .filter(scenario => scenario.group === section.group)
              .map(scenario => (
                <Pressable
                  accessibilityHint={scenario.summary}
                  accessibilityRole="button"
                  key={scenario.id}
                  onPress={() => onSelect(scenario.id)}
                  style={({ pressed }) => [
                    styles.card,
                    pressed ? styles.cardPressed : null,
                  ]}
                  testID={`scenario-entry-${scenario.id}`}
                >
                  <View style={styles.cardHeading}>
                    <Text style={styles.number}>
                      {String(scenarioCatalog.indexOf(scenario) + 1).padStart(
                        2,
                        '0',
                      )}
                    </Text>
                    <Text style={styles.arrow}>↗</Text>
                  </View>
                  <Text style={styles.cardTitle}>{scenario.title}</Text>
                  <Text style={styles.cardSummary}>{scenario.summary}</Text>
                  <View style={styles.modeList}>
                    <Text style={styles.modeText}>
                      Header：{headerModeNames[scenario.headerMode]}
                    </Text>
                    <Text style={styles.modeOutcome}>
                      最终：
                      {headerDemoCases.find(item => item.id === scenario.id)
                        ?.restingState ??
                        headerModeDefinitions[scenario.headerMode].restingState}
                    </Text>
                    <Text style={styles.modeText}>
                      Tab：{tabModeNames[scenario.tabMode]}（TabBar 均吸顶）
                    </Text>
                  </View>
                  <View style={styles.tags}>
                    {scenario.tags.map(tag => (
                      <View key={tag} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                </Pressable>
              ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  arrow: { color: '#2563EB', fontSize: 20, fontWeight: '700' },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 18,
  },
  cardHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardPressed: { opacity: 0.68, transform: [{ scale: 0.99 }] },
  cardSummary: { color: '#64748B', fontSize: 13, lineHeight: 19 },
  cardTitle: { color: '#0F172A', fontSize: 18, fontWeight: '800' },
  content: { paddingBottom: 40 },
  eyebrow: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  grid: { gap: 12 },
  guide: {
    backgroundColor: '#DBEAFE',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
  },
  guideBody: { color: '#1E3A8A', fontSize: 13, lineHeight: 20 },
  guideTitle: { color: '#172554', fontSize: 15, fontWeight: '900' },
  hero: {
    backgroundColor: '#0F172A',
    gap: 10,
    padding: 24,
    paddingVertical: 32,
  },
  number: { color: '#94A3B8', fontSize: 12, fontWeight: '800' },
  modeList: { gap: 3 },
  modeOutcome: { color: '#1D4ED8', fontSize: 11, fontWeight: '900' },
  modeText: { color: '#334155', fontSize: 11, fontWeight: '700' },
  screen: { backgroundColor: '#F1F5F9', flex: 1 },
  section: { gap: 10, padding: 16 },
  sectionDescription: { color: '#64748B', fontSize: 12, lineHeight: 18 },
  sectionHeading: { gap: 4 },
  sectionTitle: { color: '#0F172A', fontSize: 19, fontWeight: '900' },
  subtitle: { color: '#CBD5E1', fontSize: 14, lineHeight: 21, maxWidth: 640 },
  tag: {
    backgroundColor: '#EFF6FF',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  tagText: { color: '#1D4ED8', fontSize: 11, fontWeight: '700' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
  title: { color: '#FFFFFF', fontSize: 32, fontWeight: '900' },
});
