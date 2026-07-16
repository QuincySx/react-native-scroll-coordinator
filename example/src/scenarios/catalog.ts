export type HeaderMode =
  | 'plain-hide'
  | 'plain-retain'
  | 'plain-switch'
  | 'parallax-hide'
  | 'parallax-retain'
  | 'parallax-switch';
export type HeaderRestingKind = 'hidden' | 'retained' | 'replacement';
export type HeaderScenarioGroup = 'matrix' | 'special';
export type ScenarioGroup = `header-${HeaderScenarioGroup}` | 'integration';
export type TabMode = 'controlled' | 'fixed' | 'scrollable';

export type HeaderModeDefinition = {
  description: string;
  hasCollapsedLayout: boolean;
  hasParallaxBackground: boolean;
  name: string;
  restingKind: HeaderRestingKind;
  restingState: string;
};

export type HeaderDemoCase = {
  collapsedHeight?: number | 'measure';
  collapsedMeasuredHeight?: number;
  description: string;
  group: HeaderScenarioGroup;
  headerHeight?: number;
  id: string;
  minimumHeaderHeight?: number;
  mode: HeaderMode;
  openHeight: number;
  parallaxRate?: number;
  restingState: string;
  showRetainedArea?: boolean;
  snapEnabled?: boolean;
  title: string;
  transitionEnd?: number;
  transitionStart?: number;
};

export const headerModeDefinitions: Record<HeaderMode, HeaderModeDefinition> = {
  'plain-hide': {
    description: '单层内容以正常速度向上移动，没有视差，也没有第二套布局。',
    hasCollapsedLayout: false,
    hasParallaxBackground: false,
    name: '无视差 · Header 全隐藏',
    restingKind: 'hidden',
    restingState: 'Header 高度归零，只保留吸顶 TabBar',
  },
  'plain-retain': {
    description: '单层内容正常移动，收起后裁切并保留原 Header 底部。',
    hasCollapsedLayout: false,
    hasParallaxBackground: false,
    name: '无视差 · 保留原 Header',
    restingKind: 'retained',
    restingState: '保留原布局底部，不创建替代布局',
  },
  'plain-switch': {
    description: '没有视差背景；展开布局淡出并替换成独立小布局。',
    hasCollapsedLayout: true,
    hasParallaxBackground: false,
    name: '无视差 · 替换成小布局',
    restingKind: 'replacement',
    restingState: '显示独立小布局，TabBar 停在其下方',
  },
  'parallax-hide': {
    description: '带刻度的背景慢速移动，前景正常移动，最终全部退出。',
    hasCollapsedLayout: false,
    hasParallaxBackground: true,
    name: '带视差 · Header 全隐藏',
    restingKind: 'hidden',
    restingState: 'Header 高度归零，只保留吸顶 TabBar',
  },
  'parallax-retain': {
    description: '带刻度的背景慢速移动，收起后保留原 Header 底部。',
    hasCollapsedLayout: false,
    hasParallaxBackground: true,
    name: '带视差 · 保留原 Header',
    restingKind: 'retained',
    restingState: '保留原布局底部，不创建替代布局',
  },
  'parallax-switch': {
    description: '带刻度的背景慢速移动，展开布局淡出并替换成独立小布局。',
    hasCollapsedLayout: true,
    hasParallaxBackground: true,
    name: '带视差 · 替换成小布局',
    restingKind: 'replacement',
    restingState: '显示独立小布局，TabBar 停在其下方',
  },
};

export const headerModeNames: Record<HeaderMode, string> = {
  'plain-hide': headerModeDefinitions['plain-hide'].name,
  'plain-retain': headerModeDefinitions['plain-retain'].name,
  'plain-switch': headerModeDefinitions['plain-switch'].name,
  'parallax-hide': headerModeDefinitions['parallax-hide'].name,
  'parallax-retain': headerModeDefinitions['parallax-retain'].name,
  'parallax-switch': headerModeDefinitions['parallax-switch'].name,
};

export const tabModeNames: Record<TabMode, string> = {
  controlled: '受控 Tab + 页面左右滑',
  fixed: '固定 Tab + 页面左右滑',
  scrollable: 'TabBar 横滑 + 页面左右滑',
};

export const headerDemoCases = [
  {
    description: '单层内容以正常速度向上移动，没有视差，也没有第二套布局。',
    group: 'matrix',
    id: 'header-plain-hide',
    mode: 'plain-hide',
    openHeight: 304,
    restingState: 'Header 高度归零，只保留吸顶 TabBar',
    title: '无视差 × 完全隐藏',
  },
  {
    description: '带编号刻度的背景以 0.35 倍速度移动，前景正常移动。',
    group: 'matrix',
    id: 'header-parallax-hide',
    mode: 'parallax-hide',
    openHeight: 304,
    parallaxRate: 0.35,
    restingState: 'Header 高度归零，只保留吸顶 TabBar',
    title: '带视差 × 完全隐藏',
  },
  {
    description: '单层内容正常移动，收起后裁切并保留原 Header 底部。',
    group: 'matrix',
    id: 'header-plain-retain',
    minimumHeaderHeight: 64,
    mode: 'plain-retain',
    openHeight: 304,
    restingState: '保留原布局底部 64 dp，不创建替代布局',
    showRetainedArea: true,
    title: '无视差 × 保留原布局 64',
  },
  {
    description: '背景以 0.35 倍速度移动，收起后保留原 Header 底部。',
    group: 'matrix',
    id: 'header-parallax-retain',
    minimumHeaderHeight: 64,
    mode: 'parallax-retain',
    openHeight: 304,
    parallaxRate: 0.35,
    restingState: '保留原布局底部 64 dp，不创建替代布局',
    showRetainedArea: true,
    title: '带视差 × 保留原布局 64',
  },
  {
    collapsedHeight: 64,
    description: '展开布局淡出，替换成完全独立的 64 dp 小布局。',
    group: 'matrix',
    id: 'header-plain-switch',
    mode: 'plain-switch',
    openHeight: 304,
    restingState: '显示独立 64 dp 小布局，TabBar 停在其下方',
    title: '无视差 × 替代布局 64',
    transitionEnd: 0.86,
    transitionStart: 0.5,
  },
  {
    collapsedHeight: 64,
    description: '背景以 0.35 倍速度移动，同时展开布局切换成独立小布局。',
    group: 'matrix',
    id: 'header-parallax-switch',
    mode: 'parallax-switch',
    openHeight: 304,
    parallaxRate: 0.35,
    restingState: '显示独立 64 dp 小布局，TabBar 停在其下方',
    title: '带视差 × 替代布局 64',
    transitionEnd: 0.86,
    transitionStart: 0.5,
  },
  {
    collapsedHeight: 'measure',
    collapsedMeasuredHeight: 72,
    description: 'Collapsed 不传 height，由小布局自己的 72 dp 内容实测决定。',
    group: 'special',
    id: 'header-switch-measured',
    mode: 'plain-switch',
    openHeight: 304,
    restingState: '自动测量并停在独立小布局的 72 dp 实际高度',
    title: '替代布局高度 · 自动测量 72',
  },
  {
    description: '松手后 AppBar 自动吸附到完全展开或完全收起。',
    group: 'special',
    id: 'header-snap',
    mode: 'plain-hide',
    openHeight: 304,
    restingState: '松手后 Snap 到 Header=304 或 Header=0',
    snapEnabled: true,
    title: '折叠行为 · Snap 开启',
  },
  {
    description: 'minimumHeaderHeight 与展开高度相同，Header 不参与折叠。',
    group: 'special',
    id: 'header-fixed',
    minimumHeaderHeight: 220,
    mode: 'plain-retain',
    openHeight: 220,
    restingState: 'Header 始终固定为 220 dp，TabBar 位于其下方',
    title: '折叠行为 · Header 完全固定',
  },
  {
    description:
      '展开高度为 0，不渲染可见 Header，只验证吸顶 TabBar 和 Pager。',
    group: 'special',
    id: 'header-none',
    mode: 'plain-hide',
    openHeight: 0,
    restingState: '没有 Header，页面从 TabBar 开始',
    title: '折叠行为 · 无 Header',
  },
] as const satisfies readonly HeaderDemoCase[];

export type HeaderScenarioId = (typeof headerDemoCases)[number]['id'];
export const headerScenarioIds = headerDemoCases.map(
  item => item.id,
) as HeaderScenarioId[];

export const scenarioHeaderModes = {
  'custom-tab-actions': 'plain-switch',
  'flash-banner': 'parallax-switch',
  'flatlist-nested': 'parallax-hide',
  'many-tabs': 'parallax-switch',
  'scrollview-content': 'plain-hide',
  'slow-huge-list': 'parallax-switch',
  'virtual-adapter': 'plain-switch',
} as const satisfies Record<string, HeaderMode>;

const headerScenarios = headerDemoCases.map((item: HeaderDemoCase) => ({
  group: `header-${item.group}` as const,
  headerMode: item.mode,
  id: item.id,
  summary: `${item.description} ${item.restingState}。`,
  tabMode: 'fixed' as const,
  tags: [
    headerModeDefinitions[item.mode].hasParallaxBackground
      ? `视差 ${item.parallaxRate ?? 0.35}×`
      : '无视差 1.00×',
    item.snapEnabled
      ? 'Snap'
      : headerModeDefinitions[item.mode].restingKind === 'hidden'
      ? '完全隐藏'
      : headerModeDefinitions[item.mode].restingKind === 'retained'
      ? '保留原布局'
      : '替代小布局',
  ],
  title: item.title,
})) as {
  group: `header-${HeaderScenarioGroup}`;
  headerMode: HeaderMode;
  id: HeaderScenarioId;
  summary: string;
  tabMode: 'fixed';
  tags: string[];
  title: string;
}[];

export const scenarioCatalog = [
  ...headerScenarios,
  {
    group: 'integration',
    headerMode: scenarioHeaderModes['flash-banner'],
    id: 'flash-banner',
    title: 'FlashList + Header Banner',
    summary: '100 行、下拉刷新、可点击 Banner，以及内外横向手势边界。',
    tags: ['FlashList', 'refresh', 'Banner'],
    tabMode: 'fixed',
  },
  {
    group: 'integration',
    headerMode: scenarioHeaderModes['flatlist-nested'],
    id: 'flatlist-nested',
    title: 'FlatList + 多组横向 Carousel',
    summary: '可变高度行，以及位于不同列表位置的两组独立横向内容。',
    tags: ['FlatList', 'deep nesting', 'multiple shelves'],
    tabMode: 'fixed',
  },
  {
    group: 'integration',
    headerMode: scenarioHeaderModes['scrollview-content'],
    id: 'scrollview-content',
    title: 'ScrollView 混合内容',
    summary: '普通按钮、卡片、Banner，以及点击和纵向拖动冲突。',
    tags: ['ScrollView', 'mixed content', 'tap'],
    tabMode: 'fixed',
  },
  {
    group: 'integration',
    headerMode: scenarioHeaderModes['virtual-adapter'],
    id: 'virtual-adapter',
    title: '自定义 VirtualizedList 适配',
    summary: '120 行真实虚拟列表通过通用滚动宿主绑定接入。',
    tags: ['VirtualizedList', 'adapter', '120 rows'],
    tabMode: 'fixed',
  },
  {
    group: 'integration',
    headerMode: scenarioHeaderModes['many-tabs'],
    id: 'many-tabs',
    title: '12 个可横滑 Tab',
    summary: 'TabBar 自己可以横滑，页面也可以左右切换，并支持 lazy。',
    tags: ['12 tabs', 'scrollable tab bar', 'lazy'],
    tabMode: 'scrollable',
  },
  {
    group: 'integration',
    headerMode: scenarioHeaderModes['custom-tab-actions'],
    id: 'custom-tab-actions',
    title: '受控 Tab + 自定义操作',
    summary: '业务控制选中项、Badge 和一个不负责页面跳转的操作按钮。',
    tags: ['controlled', 'custom action', 'badges'],
    tabMode: 'controlled',
  },
  {
    group: 'integration',
    headerMode: scenarioHeaderModes['slow-huge-list'],
    id: 'slow-huge-list',
    title: '20k 慢加载与点击冲突',
    summary: '每批延迟 1.5 秒，验证重列表、详情点击和拖动取消点击。',
    tags: ['20,000 rows', 'slow paging', 'tap conflict'],
    tabMode: 'fixed',
  },
] as const satisfies readonly {
  group: ScenarioGroup;
  headerMode: HeaderMode;
  id: string;
  summary: string;
  tabMode: TabMode;
  tags: readonly string[];
  title: string;
}[];

export type ScenarioId = (typeof scenarioCatalog)[number]['id'];
