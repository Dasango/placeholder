import { useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  FlatList, StyleSheet, Text, View,
} from 'react-native';

const RELAY_URL = 'ws://localhost:3001';

const EVENT_ICONS = {
  push: '\u{1F504}',
  watch: '\u{2B50}',
  issues: '\u{1F41B}',
  pull_request: '\u{1F500}',
  fork: '\u{2442}',
};

function formatTime(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export default function App() {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    function connect() {
      ws.current = new WebSocket(RELAY_URL);

      ws.current.onopen = () => setConnected(true);

      ws.current.onmessage = (msg) => {
        const event = JSON.parse(msg.data);
        setEvents((prev) => [event, ...prev]);
      };

      ws.current.onclose = () => {
        setConnected(false);
        setTimeout(connect, 3000);
      };
    }

    connect();
    return () => ws.current?.close();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GitHub Activity</Text>
        <View style={[styles.dot, connected ? styles.online : styles.offline]} />
      </View>

      <FlatList
        data={events}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.icon}>
              {EVENT_ICONS[item.event] || '\u{1F4E1}'}
            </Text>
            <View style={styles.cardBody}>
              <Text style={styles.repo}>{item.repo}</Text>
              <Text style={styles.actor}>{item.actor}</Text>
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {connected ? 'Waiting for events...' : 'Connecting...'}
          </Text>
        }
        contentContainerStyle={events.length === 0 && styles.emptyContainer}
      />

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    color: '#e6edf3',
    fontSize: 22,
    fontWeight: '700',
    marginRight: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  online: { backgroundColor: '#3fb950' },
  offline: { backgroundColor: '#f85149' },
  card: {
    flexDirection: 'row',
    padding: 14,
    marginHorizontal: 12,
    marginVertical: 4,
    backgroundColor: '#161b22',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  icon: { fontSize: 24, marginRight: 12, marginTop: 2 },
  cardBody: { flex: 1 },
  repo: { color: '#e6edf3', fontSize: 15, fontWeight: '600' },
  actor: { color: '#8b949e', fontSize: 13, marginTop: 2 },
  time: { color: '#6e7681', fontSize: 11, marginTop: 4 },
  empty: { color: '#8b949e', fontSize: 15 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
