import {View, Text, StyleSheet} from 'react-native';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';

export default function App() {
  const Card = () => {
    return (
      <View style={styles.card}>
        <Text>Shit</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Card />
      <Card />
      <Card />
      <Card />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8EEE2',
    padding: hp('2%'),
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: hp('2%'),
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#FFFDFA',
    padding: hp('2%'),
    borderRadius: hp('0.5%'),
    width: '47%',
    marginBottom: hp('1%'),
  },
  text: {
    color: '#595550',
  },
});
