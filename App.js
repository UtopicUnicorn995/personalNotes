import {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {heightPercentageToDP as hp} from 'react-native-responsive-screen';
import MasonryList from '@react-native-seoul/masonry-list';
import {
  collection,
  query,
  onSnapshot,
  getFirestore,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
} from '@react-native-firebase/firestore';
import FAIcon from 'react-native-vector-icons/FontAwesome';
import FAIcon5 from 'react-native-vector-icons/FontAwesome5';

export default function App() {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);

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

  const addNewNote = async (newNoteTitle, newNoteContent) => {
    const db = getFirestore();
    const noteRef = collection(db, 'Notes');

    const data = {
      title: newNoteTitle,
      content: newNoteContent,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await addDoc(noteRef, data);

    const newNote = {
      title: newNoteTitle,
      content: newNoteContent,
      id: docRef.id,
    };

    setNotes(prev => [...prev, newNote]);
    setSelectedNote(newNote);
  };

  const updateNote = async (updateNoteTitle, updateNoteContent) => {
    const db = getFirestore();
    const noteRef = doc(db, 'Notes', selectedNote.id);

    await setDoc(noteRef, {
      title: updateNoteTitle,
      content: updateNoteContent,
      updatedAt: new Date(),
    });

    const updatedNote = {
      title: updateNoteTitle,
      content: updateNoteContent,
      id: selectedNote.id,
    };

    setNotes(prev =>
      prev.map(note => (note.id === selectedNote.id ? updatedNote : note)),
    );

    setSelectedNote(updatedNote);
  };

  const deleteNote = async () => {
    const db = getFirestore();
    const noteRef = doc(db, 'Notes', selectedNote.id);

    await deleteDoc(noteRef);
    setSelectedNote(null);
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
      if (newNotes.id.trim()) {
        updateNote(newNotes.title, newNotes.content);
      } else {
        addNewNote(newNotes.title, newNotes.content);
      }
    };

    return (
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <TouchableOpacity
            onPress={removeSelectedNote}
            style={{padding: hp('1%')}}>
            <FAIcon5 name="chevron-left" size={hp('3%')} color="#595550" />
          </TouchableOpacity>
          <View>
            <TextInput
              placeholder="Note Title"
              style={{fontSize: hp('3%')}}
              value={newNotes.title}
              onChangeText={text =>
                setNewNotes(prev => ({...prev, title: text}))
              }
            />
          </View>
          <TouchableOpacity style={{padding: hp('1%')}} onPress={deleteNote}>
            <FAIcon name="trash-o" size={hp('3.5%')} color="red" />
          </TouchableOpacity>
        </View>

        <View style={{flex: 1}}>
          <View style={{flex: 1}}>
            <TextInput
              placeholder="Note content..."
              value={newNotes.content}
              onChangeText={text =>
                setNewNotes(prev => ({...prev, content: text}))
              }
              multiline
            />
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
        <MasonryList
          data={notes}
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
