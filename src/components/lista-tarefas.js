import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const ListaDeTarefasSimples = () => {
  const [novaTarefa, setNovaTarefa] = useState('');
  const [tarefas, setTarefas] = useState([]);

  const adicionarTarefa = () => {
    if (novaTarefa.trim() !== '') {
      setTarefas([...tarefas, novaTarefa.trim()]);
      setNovaTarefa(''); // Limpa o input após adicionar
    }
  };

  const removerTarefa = (index) => {
    const novaListaTarefas = [...tarefas];
    novaListaTarefas.splice(index, 1);
    setTarefas(novaListaTarefas);
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.itemTarefa}>
      <Text>{item}</Text>
      <TouchableOpacity onPress={() => removerTarefa(index)}>
        <Text style={styles.botaoRemover}>Remover</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Lista de Tarefas</Text>
      <View style={styles.containerInput}>
        <TextInput
          style={styles.input}
          placeholder="Adicionar nova tarefa"
          value={novaTarefa}
          onChangeText={text => setNovaTarefa(text)}
        />
        <TouchableOpacity style={styles.botaoAdicionar} onPress={adicionarTarefa}>
          <Text style={styles.textoBotaoAdicionar}>Adicionar</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={tarefas}
        renderItem={renderItem}
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
    fontSize: 20,
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
    borderColor: '#ccc',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  botaoRemover: {
    color: 'red',
    fontWeight: 'bold',
  },
});

export default ListaDeTarefasSimples;