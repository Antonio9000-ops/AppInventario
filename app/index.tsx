import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, ListRenderItem, Alert } from 'react-native';
// Importamos nuestra conexión a la nube
import { supabase } from '../lib/supabase';

interface Producto {
  id: any; // En Supabase el ID puede ser número, así que usamos any o number
  nombre: string;
  cantidad: string;
}

export default function App() {
  const [producto, setProducto] = useState<string>('');
  const [cantidad, setCantidad] = useState<string>('');
  const [lista, setLista] = useState<Producto[]>([]);
  const [modoEdicion, setModoEdicion] = useState<any | null>(null);

  // 1. CARGAR DATOS AL INICIAR
  // useEffect se ejecuta una sola vez cuando la app nace
  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    // Pedimos a supabase: "De la tabla 'productos', dame todas las columnas (*)"
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('id', { ascending: false }); // Los nuevos primero

    if (error) {
      Alert.alert('Error cargando', error.message);
    } else {
      setLista(data as Producto[]);
    }
  };

  const agregarProducto = async () => {
    if (producto === '' || cantidad === '') return;

    if (modoEdicion !== null) {
      // --- MODO EDITAR EN LA NUBE ---
      const { error } = await supabase
        .from('productos')
        .update({ nombre: producto, cantidad: cantidad })
        .eq('id', modoEdicion); // "Donde el ID sea igual al que estoy editando"

      if (error) Alert.alert('Error actualizando', error.message);

      setModoEdicion(null);
    } else {
      // --- MODO CREAR EN LA NUBE ---
      // Insertamos y no necesitamos poner ID, Supabase lo crea solo
      const { error } = await supabase
        .from('productos')
        .insert([{ nombre: producto, cantidad: cantidad }]);

      if (error) Alert.alert('Error creando', error.message);
    }

    // Limpiamos y recargamos la lista desde la nube
    setProducto('');
    setCantidad('');
    fetchProductos();
  };

  const borrarProducto = async (id: any) => {
    // --- BORRAR EN LA NUBE ---
    const { error } = await supabase
      .from('productos')
      .delete()
      .eq('id', id);

    if (error) {
      Alert.alert('Error borrando', error.message);
    } else {
      // Si salió bien, recargamos la lista
      fetchProductos();
    }
  };

  const prepararEdicion = (item: Producto) => {
    setProducto(item.nombre);
    setCantidad(item.cantidad); // Ojo: en tu tabla supabase la llamaste 'cantidad' o 'cant'? Revisa eso. Yo puse 'cantidad'.
    setModoEdicion(item.id);
  };

  const renderizarItem: ListRenderItem<Producto> = ({ item }) => (
    <View style={styles.fila}>
      <View style={styles.datosFila}>
        <Text style={styles.textoLista}>{item.nombre}</Text>
        <Text style={styles.textoLista}>{item.cantidad}</Text>
      </View>

      <View style={styles.botonesFila}>
        <TouchableOpacity onPress={() => prepararEdicion(item)} style={styles.botonEditar}>
          <Text style={styles.textoBoton}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => borrarProducto(item.id)} style={styles.botonBorrar}>
          <Text style={styles.textoBoton}>X</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Inventario Nube ☁️</Text>

      <View style={styles.inputContenedor}>
        <TextInput
          placeholder="Producto (ej. Arroz)"
          value={producto}
          onChangeText={setProducto}
          style={styles.input}
        />
        <TextInput
          placeholder="Cantidad (ej. 1kg)"
          value={cantidad}
          onChangeText={setCantidad}
          style={styles.input}
        />
        <Button
          title={modoEdicion ? "Actualizar Nube" : "Enviar a Nube"}
          onPress={agregarProducto}
        />
      </View>

      <View style={styles.cabeceraTabla}>
        <Text style={styles.textoCabecera}>Producto</Text>
        <Text style={styles.textoCabecera}>Cantidad</Text>
        <Text style={styles.textoCabecera}>Acciones</Text>
      </View>

      <FlatList
        data={lista}
        renderItem={renderizarItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 20, backgroundColor: '#fff', marginTop: 30 },
  titulo: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2c3e50' },
  inputContenedor: { marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  cabeceraTabla: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 2, borderBottomColor: '#000', paddingBottom: 5, marginBottom: 10 },
  textoCabecera: { fontWeight: 'bold', flex: 1 },
  fila: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  datosFila: { flexDirection: 'row', flex: 2 },
  textoLista: { flex: 1 },
  botonesFila: { flexDirection: 'row', flex: 1, justifyContent: 'flex-end', gap: 5 },
  botonEditar: { backgroundColor: '#ffc107', padding: 5, borderRadius: 3 },
  botonBorrar: { backgroundColor: '#dc3545', padding: 5, borderRadius: 3 },
  textoBoton: { color: 'white', fontSize: 12 }
});
