// Settings Screen - App preferences

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius, getTeamColor } from '../theme';

// All NBA Teams
const NBA_TEAMS = [
  { id: '1', name: 'Boston Celtics', abbreviation: 'BOS', conference: 'East' },
  { id: '2', name: 'Brooklyn Nets', abbreviation: 'BKN', conference: 'East' },
  { id: '3', name: 'New York Knicks', abbreviation: 'NYK', conference: 'East' },
  { id: '4', name: 'Philadelphia 76ers', abbreviation: 'PHI', conference: 'East' },
  { id: '5', name: 'Toronto Raptors', abbreviation: 'TOR', conference: 'East' },
  { id: '6', name: 'Chicago Bulls', abbreviation: 'CHI', conference: 'East' },
  { id: '7', name: 'Cleveland Cavaliers', abbreviation: 'CLE', conference: 'East' },
  { id: '8', name: 'Detroit Pistons', abbreviation: 'DET', conference: 'East' },
  { id: '9', name: 'Indiana Pacers', abbreviation: 'IND', conference: 'East' },
  { id: '10', name: 'Milwaukee Bucks', abbreviation: 'MIL', conference: 'East' },
  { id: '11', name: 'Atlanta Hawks', abbreviation: 'ATL', conference: 'East' },
  { id: '12', name: 'Charlotte Hornets', abbreviation: 'CHA', conference: 'East' },
  { id: '13', name: 'Miami Heat', abbreviation: 'MIA', conference: 'East' },
  { id: '14', name: 'Orlando Magic', abbreviation: 'ORL', conference: 'East' },
  { id: '15', name: 'Washington Wizards', abbreviation: 'WAS', conference: 'East' },
  { id: '16', name: 'Denver Nuggets', abbreviation: 'DEN', conference: 'West' },
  { id: '17', name: 'Minnesota Timberwolves', abbreviation: 'MIN', conference: 'West' },
  { id: '18', name: 'Oklahoma City Thunder', abbreviation: 'OKC', conference: 'West' },
  { id: '19', name: 'Portland Trail Blazers', abbreviation: 'POR', conference: 'West' },
  { id: '20', name: 'Utah Jazz', abbreviation: 'UTA', conference: 'West' },
  { id: '21', name: 'Golden State Warriors', abbreviation: 'GSW', conference: 'West' },
  { id: '22', name: 'Los Angeles Clippers', abbreviation: 'LAC', conference: 'West' },
  { id: '23', name: 'Los Angeles Lakers', abbreviation: 'LAL', conference: 'West' },
  { id: '24', name: 'Phoenix Suns', abbreviation: 'PHX', conference: 'West' },
  { id: '25', name: 'Sacramento Kings', abbreviation: 'SAC', conference: 'West' },
  { id: '26', name: 'Dallas Mavericks', abbreviation: 'DAL', conference: 'West' },
  { id: '27', name: 'Houston Rockets', abbreviation: 'HOU', conference: 'West' },
  { id: '28', name: 'Memphis Grizzlies', abbreviation: 'MEM', conference: 'West' },
  { id: '29', name: 'New Orleans Pelicans', abbreviation: 'NOP', conference: 'West' },
  { id: '30', name: 'San Antonio Spurs', abbreviation: 'SAS', conference: 'West' },
];

const STORAGE_KEY = '@hoophub_settings';

const SettingsScreen = () => {
  const [favoriteTeam, setFavoriteTeam] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showTeamPicker, setShowTeamPicker] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEY);
      if (settings) {
        const { favoriteTeamId, notifications } = JSON.parse(settings);
        if (favoriteTeamId) {
          const team = NBA_TEAMS.find((t) => t.id === favoriteTeamId);
          setFavoriteTeam(team);
        }
        setNotificationsEnabled(notifications || false);
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const saveSettings = async (teamId, notifications) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ favoriteTeamId: teamId, notifications })
      );
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  };

  const handleTeamSelect = (team) => {
    Haptics.selectionAsync();
    setFavoriteTeam(team);
    saveSettings(team?.id, notificationsEnabled);
    setShowTeamPicker(false);
  };

  const handleNotificationsToggle = (value) => {
    Haptics.selectionAsync();
    setNotificationsEnabled(value);
    saveSettings(favoriteTeam?.id, value);
  };

  const teamColor = favoriteTeam ? getTeamColor(favoriteTeam.abbreviation) : null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowTeamPicker(true)}>
            <View style={styles.settingLeft}>
              <Ionicons name="heart" size={22} color={colors.secondary} />
              <Text style={styles.settingLabel}>Favorite Team</Text>
            </View>
            <View style={styles.settingRight}>
              {favoriteTeam ? (
                <View style={styles.teamBadge}>
                  <View style={[styles.teamDot, { backgroundColor: teamColor.primary }]} />
                  <Text style={[styles.teamAbbr, { color: teamColor.primary }]}>
                    {favoriteTeam.abbreviation}
                  </Text>
                </View>
              ) : (
                <Text style={styles.selectText}>Select</Text>
              )}
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={22} color={colors.secondary} />
              <Text style={styles.settingLabel}>Game Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: colors.surfaceElevated, true: colors.secondary }}
              thumbColor={colors.textPrimary}
            />
          </View>
          <Text style={styles.sectionFooter}>Get notified when your favorite team plays</Text>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle" size={22} color={colors.textSecondary} />
              <Text style={styles.settingLabel}>Version</Text>
            </View>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
        </View>

        {/* Data Sources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Sources</Text>
          <View style={styles.dataSourceCard}>
            <Text style={styles.dataSourceLabel}>Data provided by:</Text>
            <View style={styles.dataSourceRow}>
              <Text style={styles.dataSourceName}>ESPN</Text>
              <Text style={styles.dataSourceName}>BallDontLie</Text>
            </View>
          </View>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>

      {/* Team Picker Modal */}
      <Modal visible={showTeamPicker} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Team</Text>
            <TouchableOpacity onPress={() => setShowTeamPicker(false)}>
              <Text style={styles.modalDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={[{ id: null, name: 'No Favorite Team' }, ...NBA_TEAMS]}
            keyExtractor={(item) => item.id || 'none'}
            renderItem={({ item }) => {
              const isSelected = favoriteTeam?.id === item.id;
              const itemColor = item.id ? getTeamColor(item.abbreviation) : null;
              return (
                <TouchableOpacity
                  style={styles.teamRow}
                  onPress={() => handleTeamSelect(item.id ? item : null)}
                >
                  {item.id && (
                    <View style={[styles.teamColorDot, { backgroundColor: itemColor.primary }]} />
                  )}
                  <Text style={styles.teamName}>{item.name}</Text>
                  {isSelected && <Ionicons name="checkmark" size={22} color={colors.secondary} />}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.m, paddingTop: spacing.xl, paddingBottom: spacing.s },
  title: { ...typography.largeTitle, color: colors.textPrimary },
  section: { marginTop: spacing.l, paddingHorizontal: spacing.m },
  sectionTitle: { ...typography.caption1, fontWeight: '600', color: colors.textTertiary, textTransform: 'uppercase', marginBottom: spacing.s, marginLeft: spacing.s },
  sectionFooter: { ...typography.caption1, color: colors.textTertiary, marginTop: spacing.s, marginLeft: spacing.s },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: spacing.m, borderRadius: borderRadius.m, marginBottom: 1 },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingLabel: { ...typography.body, color: colors.textPrimary, marginLeft: spacing.m },
  settingRight: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { ...typography.body, color: colors.textSecondary },
  selectText: { ...typography.body, color: colors.textSecondary, marginRight: spacing.xs },
  teamBadge: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.xs },
  teamDot: { width: 12, height: 12, borderRadius: 6, marginRight: spacing.xs },
  teamAbbr: { ...typography.headline },
  dataSourceCard: { backgroundColor: colors.surface, padding: spacing.m, borderRadius: borderRadius.m },
  dataSourceLabel: { ...typography.caption1, color: colors.textSecondary, marginBottom: spacing.s },
  dataSourceRow: { flexDirection: 'row' },
  dataSourceName: { ...typography.headline, color: colors.textPrimary, marginRight: spacing.l },
  modalContainer: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.m, borderBottomWidth: 1, borderBottomColor: colors.border },
  modalTitle: { ...typography.headline, color: colors.textPrimary },
  modalDone: { ...typography.body, color: colors.secondary, fontWeight: '600' },
  teamRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.m },
  teamColorDot: { width: 24, height: 24, borderRadius: 12, marginRight: spacing.m },
  teamName: { ...typography.body, color: colors.textPrimary, flex: 1 },
  separator: { height: 1, backgroundColor: colors.border, marginLeft: spacing.m },
});

export default SettingsScreen;
