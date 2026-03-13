import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

function TabIcon({ name, focused }: { name: React.ComponentProps<typeof Ionicons>['name']; focused: boolean }) {
  return (
    <Ionicons
      name={name}
      size={focused ? 26 : 22}
      color={focused ? Colors.tabBarActive : Colors.tabBarInactive}
    />
  );
}

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 12,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.tabBarActive,
        tabBarInactiveTintColor: Colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('nav.home'),
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="speech"
        options={{
          title: t('nav.speech'),
          tabBarIcon: ({ focused }) => <TabIcon name="mic" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="pictures"
        options={{
          title: t('nav.pictures'),
          tabBarIcon: ({ focused }) => <TabIcon name="images" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="cognitive"
        options={{
          title: t('nav.cognitive'),
          tabBarIcon: ({ focused }) => <TabIcon name="grid" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: t('nav.camera'),
          tabBarIcon: ({ focused }) => <TabIcon name="camera" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: t('nav.progress'),
          tabBarIcon: ({ focused }) => <TabIcon name="bar-chart" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('nav.settings'),
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
