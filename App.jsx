import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Platform,
  Button,
  PermissionsAndroid,
} from 'react-native';
import twrnc from 'tailwind-react-native-classnames';
import RNBluetoothClassic, {
  BluetoothDevice,
} from 'react-native-bluetooth-classic';
import {
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';
import {IconFill, IconOutline} from '@ant-design/icons-react-native';

const App = () => {
  const [availableDevices, setAvailableDevices] = useState([]);
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);

  useEffect(() => {
    // Function to check is Bluetooth is enabled
    const isBluetoothAvailableOnDevice = async () => {
      try {
        return await RNBluetoothClassic.isBluetoothAvailable();
      } catch (err) {
        return Alert.alert(
          "Bluetooth isn't available on this device",
          err.message,
        );
      }
    };
    // Function to request Bluetooth permissions
    const requestBluetoothPermission = async () => {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, // Required for Android 12+
        ]);

        return (
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.error('Error requesting permission:', err.message);
        return false;
      }
    };

    isBluetoothAvailableOnDevice();
    requestBluetoothPermission();
  }, []);

  // Function to scan for paired Bluetooth devices
  const getPairedBluetoothDevices = async () => {
    try {
      const paired = await RNBluetoothClassic.getBondedDevices();
      return paired;
    } catch (err) {
      // Error if Bluetooth is not enabled
      Alert.alert('Error', err.message);
    }
  };

  // Function to get unpaired devices
  const getUnpairedBluetoothDevices = async () => {
    try {
      const unpaired = await RNBluetoothClassic.startDiscovery();
      return unpaired;
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  // Function to scan for available Bluetooth devices
  const fetchBluetoothDevices = async () => {
    try {
      const pairedDevices = await getPairedBluetoothDevices();
      const unpairedDevices = await getUnpairedBluetoothDevices();
      setAvailableDevices([...pairedDevices, ...unpairedDevices]);
    } catch (err) {
      Alert.error('Error fetching Bluetooth devices:', err.message);
    }
  };

  // Function to toggle Bluetooth on and off
  const toggleBluetooth = async () => {
    try {
      if (isBluetoothOn) {
        await PERMISSIONS.ANDROID.BLUETOOTH_CONNECT();
        setIsBluetoothOn(false);
        console.log('Bluetooth turned OFF');
      } else {
        await PERMISSIONS.ANDROID.BLUETOOTH_CONNECT();
        setIsBluetoothOn(true);
        console.log('Bluetooth turned ON');
      }
    } catch (error) {
      console.error('Error toggling Bluetooth:', error.message);
    }
  };

  return (
    <View style={twrnc`flex-1 bg-white p-6`}>
      <Text style={twrnc`text-2xl font-semibold text-gray-800 mb-4`}>
        Bluetooth Device Manager
      </Text>

      <Button title="Scan for Devices" onPress={fetchBluetoothDevices} />
      <Button
        title={isBluetoothOn ? 'Turn Bluetooth Off' : 'Turn Bluetooth On'}
        onPress={toggleBluetooth}
      />

      <Text style={twrnc`text-xl font-semibold text-gray-600 mt-4 mb-2`}>
        Available Devices
      </Text>
      <ScrollView style={twrnc`h-32 border-b border-gray-300 mb-4`}>
        {availableDevices.length > 0 ? (
          availableDevices.map((device, index) => (
            <Text key={index} style={twrnc`text-lg text-gray-800`}>
              {device.name || 'Unknown'} ({device.address})
            </Text>
          ))
        ) : (
          <Text style={twrnc`text-lg text-gray-500`}>
            No paired devices found
          </Text>
        )}
      </ScrollView>
    </View>
  );
};

export default App;
