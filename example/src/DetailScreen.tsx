import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export type ExampleDetail = {
  detail: string;
  id: string;
  kind: 'banner' | 'item';
  title: string;
};

export function DetailScreen({
  detail,
  onBack,
}: {
  detail: ExampleDetail;
  onBack: () => void;
}) {
  return (
    <View style={styles.screen} testID="detail-screen">
      <View style={styles.navigationBar}>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={onBack}
          style={styles.backButton}
          testID="detail-back"
        >
          <Text style={styles.backLabel}>‹ 返回示例</Text>
        </Pressable>
        <Text style={styles.navigationTitle}>二级页面</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kind} testID="detail-kind">
          {detail.kind === 'banner' ? 'BANNER CARD' : 'LIST ITEM'}
        </Text>
        <Text style={styles.title}>{detail.title}</Text>
        <Text style={styles.body}>{detail.detail}</Text>
        <View style={styles.proofCard}>
          <Text style={styles.proofTitle}>点击与手势冲突检查</Text>
          <Text style={styles.proofBody}>
            只有明确的轻点才会进入这里；横向拖
            Banner、纵向拖列表时不应误触跳转。
          </Text>
          <Text style={styles.source}>来源 ID：{detail.id}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    justifyContent: 'center',
    minHeight: 44,
    paddingRight: 12,
  },
  backLabel: { color: '#2563EB', fontSize: 15, fontWeight: '800' },
  body: { color: '#475569', fontSize: 16, lineHeight: 25 },
  content: { gap: 18, padding: 24, paddingBottom: 48 },
  kind: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.4,
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
    fontWeight: '900',
    textAlign: 'right',
  },
  proofBody: { color: '#1E3A8A', fontSize: 14, lineHeight: 22 },
  proofCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 18,
    gap: 10,
    marginTop: 8,
    padding: 20,
  },
  proofTitle: { color: '#1E3A8A', fontSize: 16, fontWeight: '900' },
  screen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
    elevation: 20,
    zIndex: 20,
  },
  source: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  title: { color: '#0F172A', fontSize: 32, fontWeight: '900' },
});
