import {StyleSheet} from 'react-native';

const modalViewStyle = StyleSheet.create({
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

const settingsModalViewStyle = StyleSheet.create({
  settingsModalView: {
    width: '90%',
    height: '90%',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
const modalTextStyle = StyleSheet.create({
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});
const centeredViewStyle = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});

export {
  modalViewStyle,
  settingsModalViewStyle,
  modalTextStyle,
  centeredViewStyle,
};
