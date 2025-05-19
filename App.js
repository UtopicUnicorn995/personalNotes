import {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import MasonryList from '@react-native-seoul/masonry-list';
import {
  collection,
  query,
  onSnapshot,
  getFirestore,
  doc,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import FAIcon5 from 'react-native-vector-icons/FontAwesome5';
import SIMPLEIcon from 'react-native-vector-icons/SimpleLineIcons';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isNoteLoading, setIsNoteLoading] = useState(false);

  console.log('noes', notes);

  useEffect(() => {
    const db = getFirestore();
    const q = query(collection(db, 'Notes'));

    const unsubscribe = onSnapshot(q, querySnapshot => {
      const notesArr = [];
      querySnapshot.forEach(doc => {
        notesArr.push({...doc.data(), id: doc.id});
      });
      setNotes(notesArr);
    });

    return () => unsubscribe();
  }, []);

  const sortedNotes = notes => {
    return [...notes].sort((a, b) => {
      const aTime = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
      const bTime = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
      return bTime - aTime;
    });
  };

  const addNewNote = async (newNoteTitle, newNoteContent) => {
    try {
      const db = getFirestore();
      const noteRef = collection(db, 'Notes');

      const data = {
        title: newNoteTitle,
        content: newNoteContent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(noteRef, data);

      const newNote = {
        title: newNoteTitle,
        content: newNoteContent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        id: docRef.id,
      };

      setSelectedNote(newNote);
    } catch (error) {
      console.error('error creating note!', error);
    } finally {
      setIsNoteLoading(false);
    }
  };

  const updateNote = async (updateNoteTitle, updateNoteContent) => {
    try {
      const db = getFirestore();
      const noteRef = doc(db, 'Notes', selectedNote.id);

      console.log('started updating');
      await setDoc(noteRef, {
        title: updateNoteTitle,
        content: updateNoteContent,
        updatedAt: serverTimestamp(),
      });

      const updatedSnap = await getDoc(noteRef);
      const updatedNote = {id: noteRef.id, ...updatedSnap.data()};

      setNotes(prev =>
        prev.map(note => (note.id === selectedNote.id ? updatedNote : note)),
      );
      setSelectedNote(updatedNote);
    } catch (error) {
      console.error('There is an issue upon updating notes', error);
    } finally {
      setIsNoteLoading(false);
    }
  };

  const deleteNote = async () => {
    try {
      const db = getFirestore();
      const noteRef = doc(db, 'Notes', selectedNote.id);

      Alert.alert('Confirm', 'Are you sure to delete note?', [
        {
          text: 'OK',
          onPress: async () => {
            await deleteDoc(noteRef);
            setSelectedNote(null);
          },
        },
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
      ]);
    } catch (error) {
      console.error('error deleting notes', error);
    }
  };

  const Card = ({title, content, id}) => (
    <TouchableOpacity
      onPress={() => setSelectedNote({title, content, id})}
      style={styles.card}>
      <Text style={styles.text}>{title}</Text>
      <Text style={styles.text}>{content}</Text>
    </TouchableOpacity>
  );

  const NoteDetails = () => {
    const [newNotes, setNewNotes] = useState({
      title: selectedNote.title,
      content: selectedNote.content,
      id: selectedNote.id,
    });

    const removeSelectedNote = () => {
      setSelectedNote(null);
    };

    const addOrUpdate = () => {
      setIsNoteLoading(true);
      if (newNotes.id.trim()) {
        updateNote(newNotes.title, newNotes.content);
      } else {
        addNewNote(newNotes.title, newNotes.content);
      }
    };

    const parsedContent = text => {
      const parsedText = text.replace(
        /- (\w)/g,
        (match, p1) => `\u25CF ${p1.toUpperCase()}`,
      );
      console.log('parsed text', parsedText);
      return parsedText;
    };

    return (
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: hp('1%'),
          }}>
          <TouchableOpacity
            onPress={removeSelectedNote}
            style={{padding: hp('1%'), paddingVertical: hp('2%')}}>
            <FAIcon5 name="chevron-left" size={hp('3%')} color="#595550" />
          </TouchableOpacity>
          <View>
            {!isNoteLoading && (
              <TextInput
                placeholder="Note Title"
                placeholderTextColor="#ababab"
                style={{fontSize: hp('2.75%')}}
                value={newNotes.title}
                onChangeText={text =>
                  setNewNotes(prev => ({...prev, title: text}))
                }
              />
            )}
          </View>
          <TouchableOpacity
            style={{padding: hp('1%'), paddingVertical: hp('2%')}}
            onPress={selectedNote.id.trim() ? deleteNote : null}
            disabled={!selectedNote.id.trim()}
            accessibilityLabel="Delete note">
            <FAIcon
              name="trash-o"
              size={hp('3.5%')}
              color={selectedNote.id.trim() ? 'red' : 'transparent'}
            />
          </TouchableOpacity>
        </View>

        <View style={{flex: 1, gap: hp('2%')}}>
          <View style={{flex: 1}}>
            {isNoteLoading ? (
              <ActivityIndicator color="#595550" size="large" />
            ) : (
              <TextInput
                placeholder="Note content..."
                placeholderTextColor="#ababab"
                value={parsedContent(newNotes.content)}
                onChangeText={text =>
                  setNewNotes(prev => ({...prev, content: text}))
                }
                style={{
                  height: '100%',
                  textAlignVertical: 'top',
                  padding: hp('1%'),
                }}
                multiline
              />
            )}
          </View>
          <TouchableOpacity style={styles.AddNewNoteBtn} onPress={addOrUpdate}>
            <Text
              style={{
                fontSize: hp('2.75%'),
                fontWeight: 'bold',
                color: '#373533',
              }}>
              Save
            </Text>
            <FAIcon5 name="save" color="#373533" size={hp('3%')} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const HomeScreen = () => {
    return (
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: hp('2%'),
            marginBottom: hp('2%'),
          }}>
          <Text
            style={{color: '#373533', fontWeight: 'bold', fontSize: hp('3%')}}>
            UtopicUnicorn's notes
          </Text>
          <SIMPLEIcon name="notebook" size={hp('3%')} color="#595550" />
        </View>
        <MasonryList
          refreshControl={false}
          data={sortedNotes(notes)}
          style={{gap: hp('2%')}}
          keyExtractor={(item, index) => item.id || index.toString()}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <Card title={item.title} content={item.content} id={item.id} />
          )}
        />
        <TouchableOpacity
          style={styles.AddNewNoteBtn}
          onPress={() => setSelectedNote({title: '', content: '', id: ''})}>
          <Text
            style={{
              fontSize: hp('2.75%'),
              fontWeight: 'bold',
              color: '#373533',
            }}>
            Write new note
          </Text>
          <FAIcon5 name="pencil-alt" color="#373533" size={hp('3%')} />
        </TouchableOpacity>
      </View>
    );
  };

  return selectedNote ? <NoteDetails /> : <HomeScreen />;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8EEE2',
    padding: hp('2%'),
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFDFA',
    padding: hp('2%'),
    borderRadius: hp('0.75%'),
    marginBottom: hp('2%'),
    width: '100%',
  },
  text: {
    color: '#595550',
  },
  AddNewNoteBtn: {
    elevation: 4,
    backgroundColor: '#F8EEE2',
    borderRadius: hp('1%'),
    padding: hp('2%'),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: hp('2%'),
  },
});
