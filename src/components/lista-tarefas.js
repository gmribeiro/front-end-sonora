import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const ListaDeTarefasSimplesEstudante = () => {
  const [novaTarefa, setNovaTarefa] = useState('');
  const [tarefas, setTarefas] = useState([]);

  const adicionarTarefa = () => {
    if (novaTarefa.trim() !== '') {
      setTarefas([...tarefas, novaTarefa.trim()]);
      setNovaTarefa('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Minhas Tarefas</Text>
      <View style={styles.containerInput}>
        <TextInput
          style={styles.input}
          placeholder="Nova tarefa..."
          value={novaTarefa}
          onChangeText={text => setNovaTarefa(text)}
        />
        <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionarTarefa}>
          <Text style={styles.textoBotaoAdicionar}>Adicionar</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tarefas}
        renderItem={({ item }) => <Text style={styles.itemTarefa}>{item}</Text>}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  containerInput: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'yellow',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  botaoAdicionar: {
    backgroundColor: 'lightblue',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  textoBotaoAdicionar: {
    fontWeight: 'bold',
  },
  itemTarefa: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'red',
  },
});

export default ListaDeTarefasSimplesEstudante;