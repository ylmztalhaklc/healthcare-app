import { createNavigationContainerRef } from '@react-navigation/native';

/**
 * NavigationContainer dışından (örn. NotificationToast) navigate etmek için
 * kullanılan global navigation ref.
 *
 * Kullanım:
 *   navigationRef.current?.navigate('ChatScreen', { contactId, contactName });
 */
export const navigationRef = createNavigationContainerRef();
