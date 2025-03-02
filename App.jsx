import React, {useState} from 'react';
import {View, Text, ScrollView, Alert, Platform, Button} from 'react-native';
import twrnc from 'tailwind-react-native-classnames';
import RNBluetoothClassic, {
  BluetoothEventType,
} from 'react-native-bluetooth-classic';
import {
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

const App = () => {
  const [pairedDevices, setPairedDevices] = useState([]);
  const [availableDevices, setAvailableDevices] = useState([]);
  const [isBluetoothOn, setIsBluetoothOn] = useState(false);

  // Function to request Bluetooth permissions
  const requestBluetoothPermission = async () => {
    try {
      const permission =
        Platform.OS === 'android' && Platform.Version >= 31
          ? PERMISSIONS.ANDROID.BLUETOOTH_CONNECT
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(permission);

      if (result === RESULTS.GRANTED) {
        console.log('Bluetooth permission granted');
        return true;
      } else if (result === RESULTS.DENIED) {
        console.log('Bluetooth permission denied');
        return false;
      } else if (result === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Required',
          'Bluetooth permission is required for scanning devices. Please enable it in Settings.',
          [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Open Settings', onPress: () => openSettings()},
          ],
        );
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  };

  // Function to scan for available Bluetooth devices
  const fetchBluetoothDevices = async () => {
    try {
      if (!RNBluetoothClassic) {
        console.error('RNBluetoothClassic is undefined');
        return;
      }
      const devices = await RNBluetoothClassic.startDiscovery();
      setPairedDevices(devices);
    } catch (error) {
      console.error('Error fetching Bluetooth devices:', error);
    }
  };

  // Function to toggle Bluetooth on and off
  const toggleBluetooth = async () => {
    try {
      if (isBluetoothOn) {
        await RNBluetoothClassic.disable();
        setIsBluetoothOn(false);
        console.log('Bluetooth turned OFF');
      } else {
        await RNBluetoothClassic.enable();
        setIsBluetoothOn(true);
        console.log('Bluetooth turned ON');
      }
    } catch (error) {
      console.error('Error toggling Bluetooth:', error);
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
        Paired Devices
      </Text>
      <ScrollView style={twrnc`h-32 border-b border-gray-300 mb-4`}>
        {pairedDevices.length > 0 ? (
          pairedDevices.map((device, index) => (
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
