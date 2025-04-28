import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  StyleSheet,
  Platform,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  ImageBackground,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

// Key untuk penyimpanan data di AsyncStorage
const STORAGE_KEY = '@activity_tasks';

// Colors
const PINK_COLOR = '#ff90bb';
const BLUE_COLOR = '#8accd5';

// Window dimensions for responsive design
const windowWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  // State untuk data formulir
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [activityType, setActivityType] = useState('');
  const [showDateModal, setShowDateModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [formValid, setFormValid] = useState(false);

  // State untuk picker tanggal sederhana
  const [tempDay, setTempDay] = useState(date.getDate());
  const [tempMonth, setTempMonth] = useState(date.getMonth() + 1);
  const [tempYear, setTempYear] = useState(date.getFullYear());

  // State untuk daftar tugas dan filter
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Semua');

  // State untuk mode edit
  const [editMode, setEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);

  // State untuk modal edit
  const [showEditModal, setShowEditModal] = useState(false);

  // Opsi untuk dropdown tipe kegiatan
  const activityTypes = [
    "Kesehatan",
    "Pendidikan",
    "Produktivitas",
    "Hobi",
    "Sosial",
    "Mental atau spiritualitas"
  ];

  // Array untuk pilihan hari, bulan, tahun
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  // useRef untuk menyimpan referensi ke dropdown
  const dropdownRef = useRef(null);

  // Load data dari AsyncStorage saat komponen dimount
  useEffect(() => {
    loadTasks();
  }, []);

  // Filter tasks berdasarkan kategori yang dipilih
  useEffect(() => {
    if (activeFilter === 'Semua') {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter(task => task.activityType === activeFilter);
      setFilteredTasks(filtered);
    }
  }, [tasks, activeFilter]);

  // Load tasks dari AsyncStorage
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedTasks !== null) {
        const parsedTasks = JSON.parse(storedTasks);
        // Convert string dates kembali ke objek Date
        const tasksWithDates = parsedTasks.map(task => ({
          ...task,
          date: new Date(task.date)
        }));
        setTasks(tasksWithDates);
      }
    } catch (e) {
      console.error('Failed to load tasks from AsyncStorage', e);
      Alert.alert('Error', 'Gagal memuat data kegiatan');
    }
  };

  // Save tasks ke AsyncStorage
  const saveTasks = async (updatedTasks) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTasks));
    } catch (e) {
      console.error('Failed to save tasks to AsyncStorage', e);
      Alert.alert('Error', 'Gagal menyimpan data kegiatan');
    }
  };

  // useEffect untuk mendeteksi klik di luar dropdown
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    // Hanya di web, tidak tersedia di React Native
    if (Platform.OS === 'web') {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
      };
    }
  }, []);

  // useEffect untuk validasi form
  useEffect(() => {
    // Validasi: judul minimal 5 karakter dan tipe kegiatan telah dipilih
    if (title.length >= 5 && activityType !== '') {
      setFormValid(true);
    } else {
      setFormValid(false);
    }
  }, [title, activityType]);

  // Handler untuk konfirmasi pemilihan tanggal
  const confirmDateSelection = () => {
    // Validasi tanggal
    const maxDaysInMonth = new Date(tempYear, tempMonth, 0).getDate();
    let validDay = tempDay;
    if (tempDay > maxDaysInMonth) {
      validDay = maxDaysInMonth;
    }

    const newDate = new Date(tempYear, tempMonth - 1, validDay);
    setDate(newDate);
    setShowDateModal(false);
  };

  // Handler untuk membuka modal tanggal
  const openDateModal = () => {
    setTempDay(date.getDate());
    setTempMonth(date.getMonth() + 1);
    setTempYear(date.getFullYear());
    setShowDateModal(true);
  };

  // Handler untuk menyimpan kegiatan
  const handleSubmit = () => {
    if (!formValid) {
      Alert.alert('Validasi Gagal', 'Pastikan judul minimal 5 karakter dan tipe kegiatan sudah dipilih.');
      return;
    }

    if (editMode) {
      // Dialog konfirmasi sebelum simpan perubahan
      Alert.alert(
        'Konfirmasi Perubahan',
        'Apakah Anda yakin ingin menyimpan perubahan pada kegiatan ini?',
        [
          {
            text: 'Batal',
            style: 'cancel'
          },
          {
            text: 'Simpan',
            onPress: () => {
              // Edit tugas yang sudah ada
              const updatedTasks = tasks.map(task => {
                if (task.id === editTaskId) {
                  return {
                    ...task,
                    title,
                    date,
                    activityType,
                  };
                }
                return task;
              });

              setTasks(updatedTasks);
              saveTasks(updatedTasks); // Simpan ke AsyncStorage
              setEditMode(false);
              setEditTaskId(null);
              setShowEditModal(false);
              resetForm();
              Alert.alert('Sukses', 'Kegiatan berhasil diperbarui!');
            }
          }
        ]
      );
    } else {
      // Tambah tugas baru
      const newTask = {
        id: Date.now().toString(),
        title,
        date,
        activityType,
        completed: false
      };

      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      saveTasks(updatedTasks); // Simpan ke AsyncStorage
      resetForm();
      Alert.alert('Sukses', 'Kegiatan berhasil ditambahkan!');
    }
  };

  // Handler untuk menghapus tugas
  const handleDelete = (id) => {
    // Dialog konfirmasi sebelum hapus
    Alert.alert(
      'Konfirmasi Hapus',
      'Apakah Anda yakin ingin menghapus kegiatan ini?',
      [
        {
          text: 'Batal',
          style: 'cancel'
        },
        {
          text: 'Hapus',
          onPress: () => {
            const updatedTasks = tasks.filter(task => task.id !== id);
            setTasks(updatedTasks);
            saveTasks(updatedTasks); // Simpan ke AsyncStorage
            Alert.alert('Sukses', 'Kegiatan berhasil dihapus!');
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Handler untuk mengedit tugas (buka modal edit)
  const handleEdit = (id) => {
    const taskToEdit = tasks.find(task => task.id === id);
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDate(new Date(taskToEdit.date));
      setActivityType(taskToEdit.activityType);
      setEditMode(true);
      setEditTaskId(id);
      setShowEditModal(true);
    }
  };

  // Handler untuk toggle status completed
  const toggleCompleted = (id) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === id) {
        return {
          ...task,
          completed: !task.completed
        };
      }
      return task;
    });

    setTasks(updatedTasks);
    saveTasks(updatedTasks); // Simpan ke AsyncStorage
  };

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDate(new Date());
    setActivityType('');
    setEditMode(false);
    setEditTaskId(null);
  };

  // Handler untuk batalkan edit
  const handleCancelEdit = () => {
    Alert.alert(
      'Batalkan Perubahan',
      'Apakah Anda yakin ingin membatalkan perubahan?',
      [
        {
          text: 'Tidak',
          style: 'cancel'
        },
        {
          text: 'Ya, Batalkan',
          onPress: () => {
            resetForm();
            setShowEditModal(false);
          }
        }
      ]
    );
  };

  // Format tanggal untuk ditampilkan
  const formatDate = (date) => {
    if (date instanceof Date) {
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
    const dateObj = new Date(date);
    return `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
  };

  // Komponen picker sederhana
  const renderPicker = (options, value, onChange, label) => (
    <View style={tw`flex-1 mx-1`}>
      <Text style={tw`text-center mb-2 text-gray-700`}>{label}</Text>
      <ScrollView style={tw`h-32 border border-gray-300 rounded-lg bg-white`}>
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            style={tw`py-2 px-4 ${value === option ? `bg-${PINK_COLOR}/20` : ''}`}
            onPress={() => onChange(option)}
          >
            <Text style={[
              tw`text-center`,
              value === option ? { fontWeight: 'bold', color: PINK_COLOR } : {}
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render item untuk FlatList
  const renderTaskItem = ({ item }) => (
    <LinearGradient
      colors={[item.completed ? '#f0f0f0' : '#ffffff', item.completed ? '#f8f8f8' : '#f0f8ff']}
      style={tw`rounded-xl shadow-md mb-3 overflow-hidden`}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={tw`p-4`}>
        <View style={tw`flex-row items-start`}>
          <TouchableOpacity
            style={tw`mt-1 mr-3`}
            onPress={() => toggleCompleted(item.id)}
          >
            <View style={[
              tw`w-6 h-6 rounded-full items-center justify-center`,
              { borderWidth: 2, borderColor: PINK_COLOR }
            ]}>
              {item.completed && (
                <View style={[tw`w-4 h-4 rounded-full`, { backgroundColor: PINK_COLOR }]} />
              )}
            </View>
          </TouchableOpacity>

          <View style={tw`flex-1`}>
            <Text
              style={[
                tw`text-lg font-medium ${item.completed ? 'line-through text-gray-500' : ''}`,
                !item.completed ? { color: '#333' } : {}
              ]}
            >
              {item.title}
            </Text>

            <View style={tw`flex-row mt-1`}>
              <View style={tw`mr-4 bg-${BLUE_COLOR}/20 px-2 py-1 rounded-full`}>
                <Text style={{ color: BLUE_COLOR, fontSize: 12 }}>{item.activityType}</Text>
              </View>

              <View style={tw`bg-${PINK_COLOR}/20 px-2 py-1 rounded-full`}>
                <Text style={{ color: PINK_COLOR, fontSize: 12 }}>{formatDate(item.date)}</Text>
              </View>
            </View>
          </View>

          <View style={tw`flex-row`}>
            <TouchableOpacity
              style={tw`p-2 mr-1 bg-${BLUE_COLOR}/20 rounded-full`}
              onPress={() => handleEdit(item.id)}
            >
              <Ionicons name="create-outline" size={18} color={BLUE_COLOR} />
            </TouchableOpacity>

            <TouchableOpacity
              style={tw`p-2 bg-${PINK_COLOR}/20 rounded-full`}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color={PINK_COLOR} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  // Render filter chips
  const renderFilterChips = () => {
    const filters = ['Semua', ...activityTypes];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={tw`py-2`}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setActiveFilter(filter)}
            style={[
              tw`px-4 py-2 mr-2 rounded-full`,
              activeFilter === filter
                ? { backgroundColor: PINK_COLOR }
                : { backgroundColor: `${BLUE_COLOR}40` }
            ]}
          >
            <Text
              style={[
                activeFilter === filter
                  ? tw`text-white font-bold`
                  : { color: BLUE_COLOR, fontWeight: '500' }
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={tw`flex-1`}>
      <LinearGradient
        colors={['#ffffff', `${BLUE_COLOR}30`, `${PINK_COLOR}20`]}
        style={tw`flex-1`}
      >
        <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-6`}>
          {/* Header Section with Gradient */}
          <LinearGradient
            colors={[BLUE_COLOR, PINK_COLOR]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={tw`px-4 pt-6 pb-10 rounded-b-3xl`}
          >
            <View style={tw`flex-row items-center justify-between mb-6`}>
              <View style={tw`flex-row items-center`}>
                <Image
                  source={require('../assets/images/Asset3.png')}
                  style={tw`w-50 h-15 bottom-4 right-3  `}
                />
                
              </View>
              <TouchableOpacity style={tw`p-2 bg-white/30 rounded-full`}>
                <Ionicons name="notifications-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Search Bar with Rounded Corners */}
            <View style={tw`bg-white/20 flex-row items-center px-3 py-2 rounded-xl mb-2`}>
              <Ionicons name="search-outline" size={20} color="white" />
              <TextInput
                placeholder="Cari kegiatan..."
                placeholderTextColor="rgba(255,255,255,0.8)"
                style={tw`ml-2 flex-1 text-white`}
              />
            </View>
          </LinearGradient>

          {/* Form Card */}
          <View style={tw`px-4 -mt-6`}>
            <View style={tw`bg-white rounded-xl shadow-lg p-4 mb-6`}>
              <Text style={[tw`text-xl font-bold mb-3`, { color: PINK_COLOR }]}>Tambah Kegiatan</Text>

              {/* Form Input Kegiatan */}
              {!editMode && (
                <>
                  {/* Input Judul Kegiatan */}
                  <View style={tw`mb-4`}>
                    <Text style={[tw`font-medium mb-2`, { color: BLUE_COLOR }]}>Judul Kegiatan</Text>
                    <TextInput
                      style={tw`border border-gray-200 rounded-xl p-3 bg-gray-50`}
                      placeholder="Masukkan judul kegiatan (min. 5 karakter)"
                      value={title}
                      onChangeText={setTitle}
                    />
                    {title.length > 0 && title.length < 5 && (
                      <Text style={{ color: PINK_COLOR, marginTop: 4, fontSize: 12 }}>Judul minimal 5 karakter</Text>
                    )}
                  </View>

                  {/* Date Picker (Custom) */}
                  <View style={tw`mb-4`}>
                    <Text style={[tw`font-medium mb-2`, { color: BLUE_COLOR }]}>Tanggal Kegiatan</Text>
                    <TouchableOpacity
                      style={tw`border border-gray-200 rounded-xl p-3 bg-gray-50 flex-row justify-between items-center`}
                      onPress={openDateModal}
                    >
                      <Text>{formatDate(date)}</Text>
                      <Ionicons name="calendar-outline" size={20} color={BLUE_COLOR} />
                    </TouchableOpacity>
                  </View>

                  {/* Dropdown Tipe Kegiatan */}
                  <View style={tw`mb-6`} ref={dropdownRef}>
                    <Text style={[tw`font-medium mb-2`, { color: BLUE_COLOR }]}>Tipe Kegiatan</Text>
                    <TouchableOpacity
                      style={tw`border border-gray-200 rounded-xl p-3 bg-gray-50 flex-row justify-between items-center`}
                      onPress={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <Text>{activityType || 'Pilih tipe kegiatan'}</Text>
                      <Ionicons
                        name={dropdownOpen ? "chevron-up-outline" : "chevron-down-outline"}
                        size={20}
                        color={BLUE_COLOR}
                      />
                    </TouchableOpacity>

                    {dropdownOpen && (
                      <View style={tw`border border-gray-200 rounded-xl mt-1 bg-white shadow-md`}>
                        {activityTypes.map((type, index) => (
                          <TouchableOpacity
                            key={index}
                            style={tw`p-3 border-b border-gray-100 ${index === activityTypes.length - 1 ? 'border-b-0' : ''}`}
                            onPress={() => {
                              setActivityType(type);
                              setDropdownOpen(false);
                            }}
                          >
                            <Text style={activityType === type ? { color: PINK_COLOR } : {}}>{type}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {activityType === '' && (
                      <Text style={{ color: PINK_COLOR, marginTop: 4, fontSize: 12 }}>Tipe kegiatan harus dipilih</Text>
                    )}
                  </View>

                  {/* Tombol Submit */}
                  <TouchableOpacity
                    style={[
                      tw`py-3 px-6 rounded-xl flex-row justify-center items-center`,
                      formValid
                        ? { backgroundColor: PINK_COLOR }
                        : tw`bg-gray-300`
                    ]}
                    onPress={handleSubmit}
                    disabled={!formValid}
                  >
                    <Ionicons name="add-circle-outline" size={20} color="white" style={tw`mr-2`} />
                    <Text style={tw`text-white text-center font-bold`}>
                      Simpan Kegiatan
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Daftar Kegiatan dengan Filter */}
          <View style={tw`px-4 mt-2`}>
            <Text style={[tw`text-xl font-bold mb-2`, { color: BLUE_COLOR }]}>Daftar Kegiatan</Text>

            {/* Filter Kategori */}
            {renderFilterChips()}

            {/* Daftar Kegiatan */}
            <View style={tw`mt-2`}>
              {filteredTasks.length === 0 ? (
                <LinearGradient
                  colors={[`${BLUE_COLOR}20`, `${PINK_COLOR}10`]}
                  style={tw`py-8 items-center rounded-xl mt-2`}
                >
                  <Ionicons name="list" size={48} color={BLUE_COLOR} />
                  <Text style={[tw`mt-2 text-center`, { color: BLUE_COLOR }]}>
                    {activeFilter === 'Semua'
                      ? 'Belum ada kegiatan. Tambahkan kegiatan baru!'
                      : `Belum ada kegiatan kategori "${activeFilter}"`}
                  </Text>
                </LinearGradient>
              ) : (
                <FlatList
                  data={filteredTasks}
                  renderItem={renderTaskItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={tw`pt-2`}
                />
              )}
            </View>
          </View>
        </ScrollView>

        {/* Modal Date Picker */}
        <Modal
          visible={showDateModal}
          transparent={true}
          animationType="slide"
        >
          <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
            <LinearGradient
              colors={['#ffffff', `${BLUE_COLOR}20`]}
              style={tw`p-4 rounded-2xl w-80 shadow-lg`}
            >
              <Text style={[tw`text-xl font-bold mb-4 text-center`, { color: PINK_COLOR }]}>Pilih Tanggal</Text>

              <View style={tw`flex-row justify-between mb-4`}>
                {renderPicker(days, tempDay, setTempDay, 'Tanggal')}
                {renderPicker(months, tempMonth, setTempMonth, 'Bulan')}
                {renderPicker(years, tempYear, setTempYear, 'Tahun')}
              </View>

              <View style={tw`flex-row justify-end`}>
                <TouchableOpacity
                  style={tw`py-2 px-4 mr-2`}
                  onPress={() => setShowDateModal(false)}
                >
                  <Text style={{ color: BLUE_COLOR }}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[tw`py-2 px-4 rounded-lg`, { backgroundColor: PINK_COLOR }]}
                  onPress={confirmDateSelection}
                >
                  <Text style={tw`text-white font-bold`}>Pilih</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Modal>

        {/* Modal Edit */}
        <Modal
          visible={showEditModal}
          transparent={true}
          animationType="slide"
        >
          <View style={tw`flex-1 justify-center items-center bg-black bg-opacity-50`}>
            <LinearGradient
              colors={['#ffffff', `${PINK_COLOR}10`]}
              style={tw`p-4 rounded-xl w-5/6 max-w-lg shadow-lg`}
            >
              <Text style={[tw`text-xl font-bold mb-4 text-center`, { color: BLUE_COLOR }]}>Edit Kegiatan</Text>

              {/* Form Edit */}
              <View style={tw`mb-4`}>
                <Text style={[tw`font-medium mb-2`, { color: PINK_COLOR }]}>Judul Kegiatan</Text>
                <TextInput
                  style={tw`border border-gray-200 rounded-xl p-3 bg-gray-50`}
                  placeholder="Masukkan judul kegiatan (min. 5 karakter)"
                  value={title}
                  onChangeText={setTitle}
                />
                {title.length > 0 && title.length < 5 && (
                  <Text style={{ color: PINK_COLOR, marginTop: 4, fontSize: 12 }}>Judul minimal 5 karakter</Text>
                )}
              </View>

              <View style={tw`mb-4`}>
                <Text style={[tw`font-medium mb-2`, { color: PINK_COLOR }]}>Tanggal Kegiatan</Text>
                <TouchableOpacity
                  style={tw`border border-gray-200 rounded-xl p-3 bg-gray-50 flex-row justify-between items-center`}
                  onPress={openDateModal}
                >
                  <Text>{formatDate(date)}</Text>
                  <Ionicons name="calendar-outline" size={20} color={PINK_COLOR} />
                </TouchableOpacity>
              </View>

              <View style={tw`mb-6`}>
                <Text style={[tw`font-medium mb-2`, { color: PINK_COLOR }]}>Tipe Kegiatan</Text>
                <TouchableOpacity
                  style={tw`border border-gray-200 rounded-xl p-3 bg-gray-50 flex-row justify-between items-center`}
                  onPress={() => setDropdownOpen(!dropdownOpen)}
                >
                  <Text>{activityType || 'Pilih tipe kegiatan'}</Text>
                  <Ionicons
                    name={dropdownOpen ? "chevron-up-outline" : "chevron-down-outline"}
                    size={20}
                    color={PINK_COLOR}
                  />
                </TouchableOpacity>

                {dropdownOpen && (
                  <View style={tw`border border-gray-200 rounded-xl mt-1 bg-white shadow-md`}>
                    {activityTypes.map((type, index) => (
                      <TouchableOpacity
                        key={index}
                        style={tw`p-3 border-b border-gray-100 ${index === activityTypes.length - 1 ? 'border-b-0' : ''}`}
                        onPress={() => {
                          setActivityType(type);
                          setDropdownOpen(false);
                        }}
                      >
                        <Text style={activityType === type ? { color: BLUE_COLOR } : {}}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={tw`flex-row justify-end`}>
                <TouchableOpacity
                  style={[tw`py-2 px-4 mr-2 rounded-lg`, { backgroundColor: BLUE_COLOR + '40' }]}
                  onPress={handleCancelEdit}
                >
                  <Text style={{ color: BLUE_COLOR, fontWeight: 'bold' }}>Batal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    tw`py-2 px-4 rounded-lg`,
                    formValid ? { backgroundColor: PINK_COLOR } : tw`opacity-50 bg-gray-400`
                  ]}
                  onPress={handleSubmit}
                  disabled={!formValid}
                >
                  <Text style={[
                    tw`py-2 px-4 rounded-lg`,
                    formValid ? { backgroundColor: PINK_COLOR } : tw`opacity-50 bg-gray-400`
                  ]}
                    onPress={handleSubmit}
                    disabled={!formValid}
                  ></Text>
                    <Text style={tw`text-white font-bold`}>Simpan Perubahan</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Modal>

        {/* Bottom Navigation Bar */}
        {/* <View style={tw`bg-white border-t border-gray-200 py-2`}>
          <View style={tw`flex-row justify-around`}>
            <TouchableOpacity style={tw`items-center px-4`}>
              <Ionicons name="home" size={24} color={PINK_COLOR} />
              <Text style={{ color: PINK_COLOR, fontSize: 12 }}>Beranda</Text>
            </TouchableOpacity>

            <TouchableOpacity style={tw`items-center px-4`}>
              <Ionicons name="calendar-outline" size={24} color="#888" />
              <Text style={{ color: '#888', fontSize: 12 }}>Kalender</Text>
            </TouchableOpacity>

            <TouchableOpacity style={tw`items-center px-4`}>
              <View style={[tw`w-12 h-12 rounded-full items-center justify-center -mt-6`, { backgroundColor: BLUE_COLOR }]}>
                <Ionicons name="add" size={26} color="white" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={tw`items-center px-4`}>
              <Ionicons name="stats-chart-outline" size={24} color="#888" />
              <Text style={{ color: '#888', fontSize: 12 }}>Statistik</Text>
            </TouchableOpacity>

            <TouchableOpacity style={tw`items-center px-4`}>
              <Ionicons name="person-outline" size={24} color="#888" />
              <Text style={{ color: '#888', fontSize: 12 }}>Profil</Text>
            </TouchableOpacity>
          </View>
        </View> */}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});