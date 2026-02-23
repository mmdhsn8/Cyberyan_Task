import { Platform } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  type Permission,
  type PermissionStatus,
  checkMultiple,
  requestMultiple,
} from 'react-native-permissions';

const isGrantedPermission = (status: PermissionStatus): boolean => {
  return status === RESULTS.GRANTED || status === RESULTS.LIMITED;
};

const resolveMediaAndCameraPermissions = (): Permission[] => {
  const isAndroid13OrAbove =
    Platform.OS === 'android' &&
    typeof Platform.Version === 'number' &&
    Platform.Version >= 33;

  if (Platform.OS === 'ios') {
    return [PERMISSIONS.IOS.CAMERA, PERMISSIONS.IOS.PHOTO_LIBRARY];
  }

  if (isAndroid13OrAbove) {
    return [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.READ_MEDIA_IMAGES];
  }

  return [PERMISSIONS.ANDROID.CAMERA, PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE];
};

const areAllGranted = (
  statuses: Partial<Record<Permission, PermissionStatus>>,
  permissions: Permission[],
): boolean => {
  return permissions.every(permission => {
    const status = statuses[permission];
    return Boolean(status && isGrantedPermission(status));
  });
};

export const checkMediaAndCameraPermissions = async (): Promise<boolean> => {
  const permissions = resolveMediaAndCameraPermissions();
  const statuses = await checkMultiple(permissions);

  return areAllGranted(statuses, permissions);
};

export const ensureMediaAndCameraPermissions = async (): Promise<boolean> => {
  const permissions = resolveMediaAndCameraPermissions();
  const statuses = await checkMultiple(permissions);

  const pendingPermissions = permissions.filter(permission => {
    const status = statuses[permission];
    return !status || !isGrantedPermission(status);
  });

  if (pendingPermissions.length === 0) {
    return true;
  }

  const requestedStatuses = await requestMultiple(pendingPermissions);

  return areAllGranted({ ...statuses, ...requestedStatuses }, permissions);
};
