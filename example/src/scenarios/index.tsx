import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  VirtualizedList,
  useWindowDimensions,
} from 'react-native';

import {
  CoordinatorFlatList,
  CoordinatorHeader,
  CoordinatorHorizontal,
  CoordinatorScrollView,
  CoordinatorTabs,
  CoordinatorVirtualList,
  type CoordinatorTabBarState,
} from 'react-native-scroll-coordinator';
import { CoordinatorFlashList } from 'react-native-scroll-coordinator/flash-list';

import type { ExampleDetail } from '../DetailScreen';
import {
  type HeaderDemoCase,
  headerDemoCases,
  headerModeDefinitions,
  headerModeNames,
  type HeaderMode,
  type HeaderScenarioId,
  type ScenarioId,
  scenarioHeaderModes,
  tabModeNames,
  type TabMode,
} from './catalog';

type Row = { id: string; title: string; detail: string };
type ScenarioProps = {
  onOpenDetail: (detail: ExampleDetail) => void;
};

const palette = ['#172554', '#312E81', '#701A75', '#064E3B'] as const;

const headerPalettes: Record<
  HeaderMode,
  { accent: string; background: string; soft: string }
> = {
  'parallax-hide': {
    accent: '#7E22CE',
    background: '#E9D5FF',
    soft: '#F3E8FF',
  },
  'parallax-retain': {
    accent: '#0369A1',
    background: '#BAE6FD',
    soft: '#E0F2FE',
  },
  'parallax-switch': {
    accent: '#1D4ED8',
    background: '#BFDBFE',
    soft: '#DBEAFE',
  },
  'plain-hide': {
    accent: '#C2410C',
    background: '#FED7AA',
    soft: '#FFEDD5',
  },
  'plain-retain': {
    accent: '#0F766E',
    background: '#99F6E4',
    soft: '#CCFBF1',
  },
  'plain-switch': {
    accent: '#047857',
    background: '#A7F3D0',
    soft: '#D1FAE5',
  },
};

function makeRows(prefix: string, count: number): Row[] {
  return Array.from({ length: count }, (_, index) => ({
    detail: index % 3 === 0 ? 'Heavy card simulation' : 'Tap target',
    id: `${prefix}-${index}`,
    title: `${prefix} item ${index + 1}`,
  }));
}

function testIdPart(value: string) {
  return value.replace(/[^A-Za-z0-9_-]+/g, '-');
}

function DemoHeader({
  demoCase,
  title,
  detail,
  mode,
  tabMode,
}: {
  demoCase?: HeaderDemoCase;
  title: string;
  detail: string;
  mode: HeaderMode;
  tabMode: TabMode;
}) {
  const definition = headerModeDefinitions[mode];
  const colors = headerPalettes[mode];
  const caseId = demoCase?.id ?? mode;
  const collapsedHeight = demoCase?.collapsedHeight ?? 64;
  const collapsedVisualHeight =
    collapsedHeight === 'measure'
      ? demoCase?.collapsedMeasuredHeight ?? 72
      : collapsedHeight;
  const displayDescription = demoCase?.description ?? definition.description;
  const displayTitle = demoCase?.title ?? definition.name;
  const openHeight = demoCase?.openHeight ?? 304;
  const usesCompactOpenLayout = openHeight > 0 && openHeight < 260;
  const parallaxRate = demoCase?.parallaxRate ?? 0.35;
  const restingState = demoCase?.restingState ?? definition.restingState;
  const retainedHeight = demoCase?.minimumHeaderHeight ?? 64;
  const showRetainedArea =
    demoCase == null
      ? definition.restingKind === 'retained'
      : demoCase.showRetainedArea === true;
  return (
    <CoordinatorHeader
      style={[styles.header, { backgroundColor: colors.soft }]}
      testID={`demo-header-${caseId}-shell`}
      transitionEnd={demoCase?.transitionEnd ?? 0.86}
      transitionStart={demoCase?.transitionStart ?? 0.5}
    >
      {definition.hasParallaxBackground ? (
        <CoordinatorHeader.Background parallaxRate={parallaxRate}>
          <View
            style={[
              styles.headerBackdrop,
              { backgroundColor: colors.background },
            ]}
            testID={`demo-header-${caseId}-background`}
          >
            {Array.from({ length: 7 }, (_, index) => (
              <View
                key={index}
                style={[
                  styles.headerParallaxLine,
                  { borderColor: colors.accent, top: 20 + index * 42 },
                ]}
              >
                <Text
                  style={[
                    styles.headerParallaxLineText,
                    { color: colors.accent },
                  ]}
                >
                  {String(index).padStart(2, '0')}
                </Text>
              </View>
            ))}
            <View
              style={[
                styles.headerParallaxMarker,
                { backgroundColor: colors.accent },
              ]}
            />
            <Text
              style={[styles.headerParallaxLabel, { color: colors.accent }]}
              testID={`demo-header-${caseId}-speed`}
            >
              {`背景刻度层 · ${parallaxRate.toFixed(2)}×`}
            </Text>
          </View>
        </CoordinatorHeader.Background>
      ) : null}
      <CoordinatorHeader.Expanded height={openHeight}>
        <View
          style={[
            styles.headerForeground,
            usesCompactOpenLayout ? styles.headerForegroundCompact : null,
            showRetainedArea ? { paddingBottom: retainedHeight + 18 } : null,
          ]}
          testID={`demo-header-${caseId}-expanded`}
        >
          <View style={styles.headerModeRow}>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>
              {headerModeNames[mode]}
            </Text>
            <View
              style={[styles.headerSpeedBadge, { borderColor: colors.accent }]}
            >
              <Text style={[styles.headerSpeedText, { color: colors.accent }]}>
                {definition.hasParallaxBackground
                  ? `前景 1.00× / 背景 ${parallaxRate.toFixed(2)}×`
                  : '单层内容 1.00×'}
              </Text>
            </View>
          </View>
          <Text
            style={[
              styles.headerTitle,
              usesCompactOpenLayout ? styles.headerTitleCompact : null,
            ]}
          >
            {displayTitle}
          </Text>
          <Text
            numberOfLines={usesCompactOpenLayout ? 2 : undefined}
            style={[
              styles.headerDetail,
              usesCompactOpenLayout ? styles.headerDetailCompact : null,
            ]}
          >
            {displayDescription}
          </Text>
          <View
            style={[
              styles.headerOutcome,
              usesCompactOpenLayout ? styles.headerOutcomeCompact : null,
              { borderColor: colors.accent },
            ]}
          >
            <Text
              style={[styles.headerOutcomeText, { color: colors.accent }]}
              testID={`demo-header-${caseId}-outcome`}
            >
              {`收起后：${restingState}`}
            </Text>
          </View>
          <Text numberOfLines={1} style={styles.headerContentNote}>
            {`${tabModeNames[tabMode]} · ${title} · ${detail}`}
          </Text>
          {showRetainedArea ? (
            <View
              style={[
                styles.headerRetainedArea,
                {
                  backgroundColor: colors.soft,
                  borderColor: colors.accent,
                  height: retainedHeight,
                },
              ]}
              testID={`demo-header-${caseId}-retained`}
            >
              <View>
                <Text
                  style={[styles.headerRetainedLabel, { color: colors.accent }]}
                >
                  同一套展开布局的底部
                </Text>
                <Text style={styles.headerRetainedTitle}>原 Header 保留区</Text>
              </View>
              <Text
                style={[styles.headerRetainedHeight, { color: colors.accent }]}
              >
                {`${retainedHeight} dp`}
              </Text>
            </View>
          ) : null}
        </View>
      </CoordinatorHeader.Expanded>
      {definition.hasCollapsedLayout ? (
        <CoordinatorHeader.Collapsed
          height={collapsedHeight === 'measure' ? undefined : collapsedHeight}
        >
          <View
            style={[
              styles.headerCollapsed,
              {
                backgroundColor: colors.soft,
                height: collapsedVisualHeight,
              },
            ]}
            testID={`demo-header-${caseId}-collapsed`}
          >
            <View style={styles.headerCollapsedCopy}>
              <Text
                style={[styles.headerCollapsedLabel, { color: colors.accent }]}
              >
                {collapsedHeight === 'measure'
                  ? `内容实测 ${collapsedVisualHeight} dp · 第二套布局`
                  : `最终固定 ${collapsedVisualHeight} dp · 第二套布局`}
              </Text>
              <Text numberOfLines={1} style={styles.headerCollapsedTitle}>
                {displayTitle}
              </Text>
            </View>
            <View
              style={[
                styles.headerCollapsedBadge,
                { backgroundColor: colors.accent },
              ]}
            >
              <Text style={styles.headerCollapsedBadgeText}>小头</Text>
            </View>
          </View>
        </CoordinatorHeader.Collapsed>
      ) : null}
    </CoordinatorHeader>
  );
}

function FixedTabBar<T extends string>({
  activeIndex,
  selectTab,
  tabs,
}: CoordinatorTabBarState<T>) {
  return (
    <View style={styles.fixedTabBar}>
      {tabs.map((tab, index) => (
        <Pressable
          key={tab.key}
          onPress={() => selectTab(tab.key)}
          style={styles.fixedTab}
        >
          <Text
            style={
              activeIndex === index ? styles.activeTabText : styles.tabText
            }
          >
            {tab.label}
          </Text>
          {activeIndex === index ? <View style={styles.indicator} /> : null}
        </Pressable>
      ))}
    </View>
  );
}

function ScrollableTabBar<T extends string>(state: CoordinatorTabBarState<T>) {
  return (
    <ScrollView
      contentContainerStyle={styles.scrollableTabContent}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollableTabBar}
    >
      {state.tabs.map((tab, index) => (
        <Pressable
          key={tab.key}
          onPress={() => state.selectTab(tab.key)}
          style={[
            styles.pillTab,
            index === state.activeIndex ? styles.pillTabActive : null,
          ]}
        >
          <Text
            style={
              index === state.activeIndex
                ? styles.pillTabTextActive
                : styles.pillTabText
            }
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function Banner({
  id,
  label,
  onOpenDetail,
  cards = 4,
}: {
  id: string;
  label: string;
  onOpenDetail: ScenarioProps['onOpenDetail'];
  cards?: number;
}) {
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(Math.max(width - 64, 240), 520);

  return (
    <View style={styles.bannerSection}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <CoordinatorHorizontal
        style={styles.bannerBoundary}
        testID={`${id}-boundary`}
      >
        <ScrollView
          contentContainerStyle={styles.bannerContent}
          decelerationRate="fast"
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={cardWidth + 12}
          testID={id}
        >
          {Array.from({ length: cards }, (_, index) => (
            <Pressable
              accessibilityHint="轻点打开详情；横向拖动浏览 Banner"
              accessibilityLabel={`${label}, Card ${index + 1} / ${cards}`}
              accessibilityRole="button"
              key={index}
              onPress={() =>
                onOpenDetail({
                  detail: `${label} 中的第 ${
                    index + 1
                  } 张卡片。轻点进入，横向拖动时不应误触。`,
                  id: `${id}-card-${index + 1}`,
                  kind: 'banner',
                  title: `Card ${index + 1} / ${cards}`,
                })
              }
              style={({ pressed }) => [
                styles.bannerCard,
                {
                  backgroundColor: palette[index % palette.length],
                  width: cardWidth,
                },
                pressed ? styles.pressablePressed : null,
              ]}
              testID={`${id}-card-${index + 1}`}
            >
              <Text style={styles.bannerKicker}>NESTED HORIZONTAL</Text>
              <Text style={styles.bannerTitle}>
                Card {index + 1} / {cards}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </CoordinatorHorizontal>
    </View>
  );
}

function RowCard({
  item,
  onOpenDetail,
  tall = false,
}: {
  item: Row;
  onOpenDetail: ScenarioProps['onOpenDetail'];
  tall?: boolean;
}) {
  return (
    <Pressable
      accessibilityHint="轻点打开详情；纵向拖动继续滚动列表"
      accessibilityRole="button"
      onPress={() =>
        onOpenDetail({
          detail: `${item.detail}。轻点进入，纵向滚动时不应误触。`,
          id: item.id,
          kind: 'item',
          title: item.title,
        })
      }
      style={({ pressed }) => [
        styles.row,
        tall ? styles.rowTall : null,
        pressed ? styles.pressablePressed : null,
      ]}
      testID={`row-${testIdPart(item.id)}`}
    >
      <View style={styles.rowCopy}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Text style={styles.rowDetail}>{item.detail}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function HeaderLabPage({
  name,
  onOpenDetail,
}: {
  name: string;
  onOpenDetail: ScenarioProps['onOpenDetail'];
}) {
  const rows = useMemo(() => makeRows(`Header Lab ${name}`, 60), [name]);
  const renderItem = useCallback(
    ({ item }: { item: Row }) => (
      <RowCard item={item} onOpenDetail={onOpenDetail} />
    ),
    [onOpenDetail],
  );

  return (
    <CoordinatorFlatList
      data={rows}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View style={styles.headerLabInstruction}>
          <Text style={styles.headerLabInstructionTitle}>统一测试内容</Text>
          <Text style={styles.headerLabInstructionBody}>
            所有 Header 入口使用完全相同的 TabBar
            和列表。慢慢向上拖动，观察前景与背景速度、最终高度、布局切换和松手行为。
          </Text>
        </View>
      }
      renderItem={renderItem}
    />
  );
}

function HeaderLabScenario({
  demoCase,
  onOpenDetail,
}: ScenarioProps & { demoCase: HeaderDemoCase }) {
  const tabs = useMemo(
    () =>
      ['对照 A', '对照 B'].map(name => ({
        key: name,
        label: name,
        render: () => <HeaderLabPage name={name} onOpenDetail={onOpenDetail} />,
      })),
    [onOpenDetail],
  );

  return (
    <CoordinatorTabs
      headerHeight={demoCase.headerHeight}
      initialTabKey="对照 A"
      minimumHeaderHeight={demoCase.minimumHeaderHeight}
      renderHeader={() => (
        <DemoHeader
          demoCase={demoCase}
          mode={demoCase.mode}
          tabMode="fixed"
          title="统一 FlatList 60 行"
          detail="只改变 Header 配置"
        />
      )}
      renderTabBar={FixedTabBar}
      snapEnabled={demoCase.snapEnabled}
      style={styles.scenario}
      tabs={tabs}
      testID={`demo-${demoCase.id}`}
    />
  );
}

function FlashPage({
  name,
  banner,
  onOpenDetail,
}: {
  name: string;
  banner: boolean;
  onOpenDetail: ScenarioProps['onOpenDetail'];
}) {
  const [refreshing, setRefreshing] = useState(false);
  const rows = useMemo(() => makeRows(name, 100), [name]);
  const renderItem = useCallback(
    ({ item }: { item: Row }) => (
      <RowCard item={item} onOpenDetail={onOpenDetail} />
    ),
    [onOpenDetail],
  );

  return (
    <CoordinatorFlashList
      data={rows}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        banner ? (
          <Banner
            id={`${name}-banner`}
            label="Banner in ListHeader"
            onOpenDetail={onOpenDetail}
          />
        ) : null
      }
      onRefresh={() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 500);
      }}
      refreshing={refreshing}
      renderItem={renderItem}
    />
  );
}

function FlashBannerScenario({ onOpenDetail }: ScenarioProps) {
  const tabs = useMemo(
    () =>
      ['Wallet', 'History', 'DeFi'].map((key, index) => ({
        key,
        label: key,
        render: () => (
          <FlashPage
            banner={index !== 2}
            name={key}
            onOpenDetail={onOpenDetail}
          />
        ),
      })),
    [onOpenDetail],
  );
  return (
    <CoordinatorTabs
      initialTabKey="Wallet"
      renderHeader={() => (
        <DemoHeader
          mode={scenarioHeaderModes['flash-banner']}
          tabMode="fixed"
          title="FlashList 长列表、刷新与 Banner"
          detail="折叠后继续滚动，并验证嵌套横滑"
        />
      )}
      renderTabBar={FixedTabBar}
      style={styles.scenario}
      tabs={tabs}
      testID="demo-flash-banner"
    />
  );
}

function FlatNestedPage({
  name,
  onOpenDetail,
}: {
  name: string;
  onOpenDetail: ScenarioProps['onOpenDetail'];
}) {
  const rows = useMemo(() => makeRows(name, 80), [name]);
  const renderItem = useCallback(
    ({ item, index }: { item: Row; index: number }) => (
      <>
        {index === 0 || index === 14 ? (
          <Banner
            id={`${name}-shelf-${index}`}
            label={`Carousel inside row group ${index + 1}`}
            onOpenDetail={onOpenDetail}
            cards={5}
          />
        ) : null}
        <RowCard
          item={item}
          onOpenDetail={onOpenDetail}
          tall={index % 4 === 0}
        />
      </>
    ),
    [name, onOpenDetail],
  );
  return (
    <CoordinatorFlatList
      data={rows}
      keyExtractor={item => item.id}
      renderItem={renderItem}
    />
  );
}

function FlatListNestedScenario({ onOpenDetail }: ScenarioProps) {
  const tabs = useMemo(
    () =>
      ['For you', 'Nearby', 'Following'].map(key => ({
        key,
        label: key,
        render: () => <FlatNestedPage name={key} onOpenDetail={onOpenDetail} />,
      })),
    [onOpenDetail],
  );
  return (
    <CoordinatorTabs
      initialTabKey="For you"
      renderHeader={() => (
        <DemoHeader
          mode={scenarioHeaderModes['flatlist-nested']}
          tabMode="fixed"
          title="FlatList 可变高度与多组横滑"
          detail="两组独立 Carousel 位于不同列表位置"
        />
      )}
      renderTabBar={FixedTabBar}
      style={styles.scenario}
      tabs={tabs}
      testID="demo-flatlist-nested"
    />
  );
}

function ScrollContentPage({
  name,
  onOpenDetail,
}: {
  name: string;
  onOpenDetail: ScenarioProps['onOpenDetail'];
}) {
  const rows = useMemo(() => makeRows(name, 16), [name]);
  return (
    <CoordinatorScrollView contentContainerStyle={styles.scrollPage}>
      <View style={styles.controlPanel}>
        <Text style={styles.controlTitle}>Interactive controls</Text>
        <View style={styles.controlActions}>
          {['Buy', 'Send', 'Receive'].map(action => (
            <Pressable key={action} style={styles.controlButton}>
              <Text style={styles.controlButtonText}>{action}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <Banner
        id={`${name}-content-banner`}
        label="Banner between normal views"
        onOpenDetail={onOpenDetail}
      />
      {rows.map(item => (
        <RowCard item={item} key={item.id} onOpenDetail={onOpenDetail} />
      ))}
    </CoordinatorScrollView>
  );
}

function ScrollViewContentScenario({ onOpenDetail }: ScenarioProps) {
  const tabs = useMemo(
    () =>
      ['Overview', 'Activity', 'Settings'].map(key => ({
        key,
        label: key,
        render: () => (
          <ScrollContentPage name={key} onOpenDetail={onOpenDetail} />
        ),
      })),
    [onOpenDetail],
  );
  return (
    <CoordinatorTabs
      initialTabKey="Overview"
      renderHeader={() => (
        <DemoHeader
          mode={scenarioHeaderModes['scrollview-content']}
          tabMode="fixed"
          title="ScrollView 混合内容"
          detail="按钮、卡片和 Banner 的点击与拖动"
        />
      )}
      renderTabBar={FixedTabBar}
      style={styles.scenario}
      tabs={tabs}
      testID="demo-scrollview-content"
    />
  );
}

function VirtualPage({
  name,
  onOpenDetail,
}: {
  name: string;
  onOpenDetail: ScenarioProps['onOpenDetail'];
}) {
  const rows = useMemo(() => makeRows(name, 120), [name]);
  return (
    <CoordinatorVirtualList>
      {({ renderScrollComponent }) => (
        <VirtualizedList<Row>
          data={rows}
          getItem={(data, index) => data[index]}
          getItemCount={data => data.length}
          initialNumToRender={10}
          keyExtractor={item => item.id}
          maxToRenderPerBatch={8}
          renderItem={({ item }) => (
            <RowCard item={item} onOpenDetail={onOpenDetail} />
          )}
          renderScrollComponent={renderScrollComponent}
          windowSize={7}
        />
      )}
    </CoordinatorVirtualList>
  );
}

function VirtualAdapterScenario({ onOpenDetail }: ScenarioProps) {
  const tabs = useMemo(
    () =>
      ['Custom A', 'Custom B', 'Custom C'].map(key => ({
        key,
        label: key,
        render: () => <VirtualPage name={key} onOpenDetail={onOpenDetail} />,
      })),
    [onOpenDetail],
  );
  return (
    <CoordinatorTabs
      initialTabKey="Custom A"
      renderHeader={() => (
        <DemoHeader
          mode={scenarioHeaderModes['virtual-adapter']}
          tabMode="fixed"
          title="自定义 VirtualizedList 适配"
          detail="列表负责虚拟化，协调器只提供滚动宿主"
        />
      )}
      renderTabBar={FixedTabBar}
      style={styles.scenario}
      tabs={tabs}
      testID="demo-virtual-adapter"
    />
  );
}

function ManyTabsScenario({ onOpenDetail }: ScenarioProps) {
  const tabs = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const key = `Category ${index + 1}`;
        return {
          key,
          label: index % 3 === 0 ? `${key} · ${index + 2}` : key,
          render: () => (
            <FlashPage
              banner={index % 4 === 0}
              name={key}
              onOpenDetail={onOpenDetail}
            />
          ),
        };
      }),
    [onOpenDetail],
  );
  return (
    <CoordinatorTabs
      initialTabKey="Category 1"
      lazy
      renderHeader={() => (
        <DemoHeader
          mode={scenarioHeaderModes['many-tabs']}
          tabMode="scrollable"
          title="12 个可横滑分类"
          detail="TabBar 横滑与页面左右切换互不冲突"
        />
      )}
      renderTabBar={ScrollableTabBar}
      style={styles.scenario}
      tabs={tabs}
      testID="demo-many-tabs"
    />
  );
}

function CustomActionTabBar<T extends string>({
  actionCount,
  onAction,
  state,
}: {
  actionCount: number;
  onAction: () => void;
  state: CoordinatorTabBarState<T>;
}) {
  return (
    <View style={styles.customTabBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.customTabs}>
          {state.tabs.map((tab, index) => (
            <Pressable
              key={tab.key}
              onPress={() => state.selectTab(tab.key)}
              style={styles.customTab}
            >
              <Text
                style={
                  index === state.activeIndex
                    ? styles.activeTabText
                    : styles.tabText
                }
              >
                {tab.label}
              </Text>
              {index === 1 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>7</Text>
                </View>
              ) : null}
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <Pressable
        onPress={onAction}
        style={styles.tabAction}
        testID="custom-tab-action"
      >
        <Text style={styles.tabActionText}>＋ {actionCount}</Text>
      </Pressable>
    </View>
  );
}

function CustomTabActionsScenario({ onOpenDetail }: ScenarioProps) {
  const [activeKey, setActiveKey] = useState('Assets');
  const [actionCount, setActionCount] = useState(0);
  const tabs = useMemo(
    () =>
      ['Assets', 'Orders', 'Messages', 'Profile'].map(key => ({
        key,
        label: key,
        render: () => <FlatNestedPage name={key} onOpenDetail={onOpenDetail} />,
      })),
    [onOpenDetail],
  );
  return (
    <CoordinatorTabs
      activeTabKey={activeKey}
      onTabChange={event => setActiveKey(event.key)}
      renderHeader={() => (
        <DemoHeader
          mode={scenarioHeaderModes['custom-tab-actions']}
          tabMode="controlled"
          title="业务受控的 Tab 状态"
          detail={`当前：${activeKey}；操作按钮已点击 ${actionCount} 次`}
        />
      )}
      renderTabBar={state => (
        <CustomActionTabBar
          actionCount={actionCount}
          onAction={() => setActionCount(value => value + 1)}
          state={state}
        />
      )}
      style={styles.scenario}
      tabs={tabs}
      testID="demo-custom-tab-actions"
    />
  );
}

const SLOW_LIST_TOTAL = 20_000;
const SLOW_LIST_BATCH_SIZE = 30;
const SLOW_LIST_DELAY_MS = 1500;

function SlowHugeListPage({
  name,
  onOpenDetail,
}: {
  name: string;
  onOpenDetail: ScenarioProps['onOpenDetail'];
}) {
  const [loadedCount, setLoadedCount] = useState(SLOW_LIST_BATCH_SIZE);
  const [loading, setLoading] = useState(false);
  const loadedCountRef = useRef(SLOW_LIST_BATCH_SIZE);
  const loadingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rows = useMemo(() => makeRows(name, loadedCount), [loadedCount, name]);

  useEffect(
    () => () => {
      if (timerRef.current != null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    },
    [],
  );

  const loadNextBatch = useCallback(() => {
    if (loadingRef.current || loadedCountRef.current >= SLOW_LIST_TOTAL) {
      return;
    }
    loadingRef.current = true;
    setLoading(true);
    timerRef.current = setTimeout(() => {
      const nextCount = Math.min(
        SLOW_LIST_TOTAL,
        loadedCountRef.current + SLOW_LIST_BATCH_SIZE,
      );
      loadedCountRef.current = nextCount;
      loadingRef.current = false;
      timerRef.current = null;
      setLoadedCount(nextCount);
      setLoading(false);
    }, SLOW_LIST_DELAY_MS);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: Row }) => (
      <RowCard item={item} onOpenDetail={onOpenDetail} />
    ),
    [onOpenDetail],
  );

  return (
    <CoordinatorFlashList
      data={rows}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View style={styles.slowListPanel}>
          <Text style={styles.slowListEyebrow}>SLOW DATA LAB</Text>
          <Text style={styles.slowListTitle}>20,000 条逻辑数据</Text>
          <Text style={styles.slowListBody}>
            首屏 30 条；触底或点按钮后，下一批固定等待 1.5
            秒。加载期间仍可滚动、切 Tab 和点击已出现的 Item。
          </Text>
          <View style={styles.slowListStatusRow}>
            <Text style={styles.slowListCount} testID="slow-list-count">
              {`${loadedCount.toLocaleString(
                'en-US',
              )} / ${SLOW_LIST_TOTAL.toLocaleString('en-US')}`}
            </Text>
            <Pressable
              disabled={loading}
              onPress={loadNextBatch}
              style={({ pressed }) => [
                styles.slowListButton,
                loading ? styles.slowListButtonDisabled : null,
                pressed ? styles.pressablePressed : null,
              ]}
              testID="slow-list-load-more"
            >
              <Text style={styles.slowListButtonText}>
                {loading ? '加载中…' : '加载下一批'}
              </Text>
            </Pressable>
          </View>
        </View>
      }
      ListFooterComponent={
        loading ? (
          <View style={styles.slowListFooter} testID="slow-list-loading">
            <ActivityIndicator color="#2563EB" />
            <Text style={styles.slowListFooterText}>
              模拟慢网络：等待 1.5 秒
            </Text>
          </View>
        ) : (
          <Text style={styles.slowListReady}>
            {loadedCount >= SLOW_LIST_TOTAL
              ? '20,000 条已全部加载'
              : '继续向下滚动会加载下一批'}
          </Text>
        )
      }
      onEndReached={loadNextBatch}
      onEndReachedThreshold={0.6}
      renderItem={renderItem}
    />
  );
}

function SlowHugeListScenario({ onOpenDetail }: ScenarioProps) {
  const tabs = useMemo(
    () =>
      ['Live 20k', 'Archive 20k'].map(key => ({
        key,
        label: key,
        render: () => (
          <SlowHugeListPage name={key} onOpenDetail={onOpenDetail} />
        ),
      })),
    [onOpenDetail],
  );

  return (
    <CoordinatorTabs
      initialTabKey="Live 20k"
      renderHeader={() => (
        <DemoHeader
          mode={scenarioHeaderModes['slow-huge-list']}
          tabMode="fixed"
          title="20k 慢加载列表"
          detail="延迟分页期间继续验证滚动与 Item 点击"
        />
      )}
      renderTabBar={FixedTabBar}
      style={styles.scenario}
      tabs={tabs}
      testID="demo-slow-huge-list"
    />
  );
}

const headerScenarioRenderers = Object.fromEntries(
  headerDemoCases.map(demoCase => [
    demoCase.id,
    (props: ScenarioProps) => (
      <HeaderLabScenario {...props} demoCase={demoCase} />
    ),
  ]),
) as Record<HeaderScenarioId, (props: ScenarioProps) => React.JSX.Element>;

export const scenarioRenderers = {
  ...headerScenarioRenderers,
  'custom-tab-actions': CustomTabActionsScenario,
  'flash-banner': FlashBannerScenario,
  'flatlist-nested': FlatListNestedScenario,
  'many-tabs': ManyTabsScenario,
  'scrollview-content': ScrollViewContentScenario,
  'slow-huge-list': SlowHugeListScenario,
  'virtual-adapter': VirtualAdapterScenario,
} satisfies Record<ScenarioId, (props: ScenarioProps) => React.JSX.Element>;

const styles = StyleSheet.create({
  activeTabText: { color: '#0F172A', fontSize: 14, fontWeight: '800' },
  badge: {
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    paddingHorizontal: 4,
  },
  badgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '900' },
  bannerBoundary: { height: 142 },
  bannerCard: {
    borderRadius: 16,
    height: 132,
    justifyContent: 'flex-end',
    padding: 18,
  },
  bannerContent: { gap: 12, paddingHorizontal: 16 },
  bannerKicker: {
    color: '#BFDBFE',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  bannerSection: {
    backgroundColor: '#F8FAFC',
    paddingBottom: 16,
    paddingTop: 14,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '900',
    marginTop: 5,
  },
  chevron: { color: '#94A3B8', fontSize: 25 },
  controlActions: { flexDirection: 'row', gap: 10 },
  controlButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  controlButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  controlPanel: { backgroundColor: '#DBEAFE', gap: 14, padding: 18 },
  controlTitle: { color: '#1E3A8A', fontSize: 16, fontWeight: '900' },
  customTab: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  customTabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
  },
  customTabs: { flexDirection: 'row' },
  eyebrow: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  fixedTab: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  fixedTabBar: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    height: 52,
  },
  header: {},
  headerBackdrop: {
    flex: 1,
    overflow: 'hidden',
  },
  headerCollapsed: {
    alignItems: 'center',
    backgroundColor: 'rgba(224, 234, 255, 0.96)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  headerCollapsedBadge: {
    backgroundColor: '#2563EB',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  headerCollapsedBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  headerCollapsedCopy: { flex: 1, gap: 2, paddingRight: 12 },
  headerCollapsedLabel: {
    color: '#2563EB',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerCollapsedTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '900',
  },
  headerForeground: {
    flex: 1,
    gap: 8,
    justifyContent: 'flex-end',
    padding: 20,
  },
  headerContentNote: { color: '#64748B', fontSize: 11 },
  headerDetail: { color: '#475569', fontSize: 14, lineHeight: 20 },
  headerDetailCompact: { fontSize: 12, lineHeight: 17 },
  headerForegroundCompact: { gap: 5, padding: 16 },
  headerLabInstruction: {
    backgroundColor: '#E2E8F0',
    gap: 6,
    padding: 16,
  },
  headerLabInstructionBody: { color: '#475569', fontSize: 12, lineHeight: 18 },
  headerLabInstructionTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '900',
  },
  headerModeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerOutcome: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 9,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  headerOutcomeCompact: { paddingVertical: 5 },
  headerOutcomeText: { fontSize: 11, fontWeight: '900' },
  headerParallaxLabel: {
    fontSize: 13,
    fontWeight: '900',
    position: 'absolute',
    right: 18,
    top: 16,
  },
  headerParallaxLine: {
    borderTopWidth: 1,
    left: 0,
    opacity: 0.34,
    position: 'absolute',
    right: 0,
  },
  headerParallaxLineText: {
    fontSize: 9,
    fontWeight: '900',
    left: 8,
    position: 'absolute',
    top: 2,
  },
  headerParallaxMarker: {
    bottom: 0,
    left: 42,
    opacity: 0.18,
    position: 'absolute',
    top: 0,
    width: 4,
  },
  headerRetainedArea: {
    alignItems: 'center',
    borderTopWidth: 2,
    bottom: 0,
    flexDirection: 'row',
    height: 64,
    justifyContent: 'space-between',
    left: 0,
    paddingHorizontal: 18,
    position: 'absolute',
    right: 0,
  },
  headerRetainedHeight: { fontSize: 18, fontWeight: '900' },
  headerRetainedLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  headerRetainedTitle: { color: '#0F172A', fontSize: 17, fontWeight: '900' },
  headerSpeedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerSpeedText: { fontSize: 9, fontWeight: '900' },
  headerTitle: { color: '#0F172A', fontSize: 28, fontWeight: '900' },
  headerTitleCompact: { fontSize: 22 },
  indicator: {
    backgroundColor: '#2563EB',
    bottom: 0,
    height: 3,
    left: 16,
    position: 'absolute',
    right: 16,
  },
  pillTab: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  pillTabActive: { backgroundColor: '#2563EB' },
  pillTabText: { color: '#475569', fontSize: 13, fontWeight: '700' },
  pillTabTextActive: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  pressablePressed: { opacity: 0.72 },
  row: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 68,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  rowCopy: { flex: 1, gap: 4 },
  rowDetail: { color: '#94A3B8', fontSize: 11 },
  rowTall: { minHeight: 96 },
  rowTitle: { color: '#0F172A', fontSize: 15, fontWeight: '600' },
  scenario: { flex: 1 },
  scrollableTabBar: { backgroundColor: '#FFFFFF', flexGrow: 0 },
  scrollableTabContent: { gap: 8, paddingHorizontal: 12, paddingVertical: 9 },
  scrollPage: { backgroundColor: '#F8FAFC', paddingBottom: 24 },
  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    paddingBottom: 9,
    paddingHorizontal: 16,
  },
  slowListBody: { color: '#1E3A8A', fontSize: 13, lineHeight: 20 },
  slowListButton: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  slowListButtonDisabled: { backgroundColor: '#93C5FD' },
  slowListButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  slowListCount: { color: '#0F172A', fontSize: 15, fontWeight: '900' },
  slowListEyebrow: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  slowListFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 84,
  },
  slowListFooterText: { color: '#475569', fontSize: 13, fontWeight: '700' },
  slowListPanel: { backgroundColor: '#DBEAFE', gap: 10, padding: 18 },
  slowListReady: {
    color: '#64748B',
    fontSize: 13,
    minHeight: 72,
    padding: 24,
    textAlign: 'center',
  },
  slowListStatusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  slowListTitle: { color: '#0F172A', fontSize: 22, fontWeight: '900' },
  tabAction: {
    alignItems: 'center',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    minWidth: 66,
    paddingHorizontal: 12,
  },
  tabActionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  tabText: { color: '#64748B', fontSize: 14, fontWeight: '600' },
});
