/**
 * Guards the startup wiring: App must register the cloud seams when its
 * module is loaded. If this ever regresses, every Firestore write silently
 * stops happening (the exact failure this test exists to prevent).
 */
jest.mock('@/app/providers/cloudSync', () => ({ registerCloudSync: jest.fn() }));
jest.mock('@/app/providers', () => ({ registerDataProviders: jest.fn() }));
jest.mock('@/app/providers/useCloudSync', () => ({ CloudSync: () => null }));
jest.mock('@/app/providers/userScope', () => ({ registerUserScope: jest.fn() }));
jest.mock('@/app/navigation', () => ({ NavigationRoot: () => null }));
jest.mock('react-native-gesture-handler', () => ({ GestureHandlerRootView: () => null }));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaProvider: () => null }));
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(),
  QueryClientProvider: () => null,
}));
jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

import { registerDataProviders } from '@/app/providers';
import { registerCloudSync } from '@/app/providers/cloudSync';
import { registerUserScope } from '@/app/providers/userScope';
// Importing App runs the module-level registration side effects.
import App from '../../../../App';

describe('app startup', () => {
  it('registers user scope, data providers and cloud sync exactly once', () => {
    expect(typeof App).toBe('function');
    expect(registerUserScope).toHaveBeenCalledTimes(1);
    expect(registerDataProviders).toHaveBeenCalledTimes(1);
    expect(registerCloudSync).toHaveBeenCalledTimes(1);
  });
});
