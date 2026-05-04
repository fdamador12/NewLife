import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const COLORS = {
  primary: '#D38A58',
  white: '#FFFFFF',
  gray: '#969696',
  darkGray: '#404040',
  background: '#FAFAFA',
  border: '#E8E8E8',
};


const QUICK_TIMES = [
  '8:00 am',
  '9:00 am',
  '10:00 am',
  '11:00 am',
  '12:00 pm',
  '1:00 pm',
  '2:00 pm',
  '3:00 pm',
  '4:00 pm',
  '5:00 pm',
  '6:00 pm',
  '7:00 pm',
  '8:00 pm',
  '9:00 pm',
];

interface TimePickerModalProps {
  visible: boolean;
  currentTime: string;
  onTimeSelect: (time: string) => void;
  onClose: () => void;
  title?: string;
}

export default function TimePickerModal({
  visible,
  currentTime,
  onTimeSelect,
  onClose,
  title = 'Selecciona hora',
}: TimePickerModalProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customHours, setCustomHours] = useState('08');
  const [customMinutes, setCustomMinutes] = useState('00');
  const [customPeriod, setCustomPeriod] = useState<'am' | 'pm'>('am');

  const hoursScroll = useRef<ScrollView>(null);
  const minutesScroll = useRef<ScrollView>(null);

  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, '0')
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0')
  );

  // 👇 función que centra el item
  const CONTAINER_HEIGHT = 150;
  const ITEM_HEIGHT = 40;

  const scrollToCenter = (
    ref: React.RefObject<ScrollView | null>,
    index: number
  ) => {
    const FINE_ADJUST = 0; // 👈 mueve hacia arriba
    const offset = index * ITEM_HEIGHT - (CONTAINER_HEIGHT / 2 - ITEM_HEIGHT / 2) + FINE_ADJUST;

    ref.current?.scrollTo({
      y: offset < 0 ? 0 : offset,
      animated: true,
    });
  };

  // 👇 centra automáticamente al abrir el custom picker
  useEffect(() => {
    if (showCustom) {
      const hourIndex = hours.indexOf(customHours);
      const minuteIndex = minutes.indexOf(customMinutes);

      setTimeout(() => {
        scrollToCenter(hoursScroll, hourIndex);
        scrollToCenter(minutesScroll, minuteIndex);
      }, 50);
    }
  }, [showCustom]);

  const handleQuickTimeSelect = (time: string) => {
    onTimeSelect(time);
    setShowCustom(false);
    onClose();
  };

  const handleCustomTimeSelect = () => {
    const displayHour = parseInt(customHours);
    const time = `${displayHour}:${customMinutes} ${customPeriod}`;

    onTimeSelect(time);
    setShowCustom(false);
    onClose();
  };

  const handleBackToQuick = () => {
    setShowCustom(false);
  };

  const handleModalClose = () => {
    setShowCustom(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        style={styles.overlay}
        onPress={handleModalClose}
        activeOpacity={1}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          onPress={(e) => e.stopPropagation()}
          activeOpacity={1}
        >
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={handleModalClose}>
                <Feather name="x" size={24} color={COLORS.darkGray} />
              </TouchableOpacity>
            </View>

            {!showCustom ? (
              <>
                <ScrollView
                  contentContainerStyle={styles.quickTimesContainer}
                  showsVerticalScrollIndicator={false}
                >
                  {QUICK_TIMES.map((time) => {
                    const isSelected = currentTime === time;
                    return (
                      <TouchableOpacity
                        key={time}
                        style={[
                          styles.quickTimeButton,
                          isSelected && styles.quickTimeButtonActive,
                        ]}
                        onPress={() => handleQuickTimeSelect(time)}
                      >
                        <Text
                          style={[
                            styles.quickTimeText,
                            isSelected && styles.quickTimeTextActive,
                          ]}
                        >
                          {time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <TouchableOpacity
                  style={styles.customButton}
                  onPress={() => setShowCustom(true)}
                >
                  <Feather name="clock" size={16} color={COLORS.primary} />
                  <Text style={styles.customButtonText}>
                    Hora personalizada
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.customPickerContainer}>
                  <Text style={styles.customLabel}>Ajusta la hora</Text>

                  <View style={styles.wheelContainer}>
                    {/* HOURS */}
                    <View style={styles.wheelColumn}>
                      <Text style={styles.wheelLabel}>Horas</Text>
                      <ScrollView
                        ref={hoursScroll}
                        style={styles.wheel}
                        showsVerticalScrollIndicator={false}
                      >
                        {hours.map((hour) => (
                          <TouchableOpacity
                            key={hour}
                            style={styles.wheelItem}
                            onPress={() => {
                              setCustomHours(hour);
                              const index = hours.indexOf(hour);
                              scrollToCenter(hoursScroll, index);
                            }}
                          >
                            <Text
                              style={[
                                styles.wheelItemText,
                                customHours === hour &&
                                  styles.wheelItemTextActive,
                              ]}
                            >
                              {hour}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    <Text style={styles.separator}>:</Text>

                    {/* MINUTES */}
                    <View style={styles.wheelColumn}>
                      <Text style={styles.wheelLabel}>Minutos</Text>
                      <ScrollView
                        ref={minutesScroll}
                        style={styles.wheel}
                        showsVerticalScrollIndicator={false}
                      >
                        {minutes.map((minute) => (
                          <TouchableOpacity
                            key={minute}
                            style={styles.wheelItem}
                            onPress={() => {
                              setCustomMinutes(minute);
                              const index = minutes.indexOf(minute);
                              scrollToCenter(minutesScroll, index);
                            }}
                          >
                            <Text
                              style={[
                                styles.wheelItemText,
                                customMinutes === minute &&
                                  styles.wheelItemTextActive,
                              ]}
                            >
                              {minute}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>

                    {/* PERIOD */}
                    <View style={styles.periodColumn}>
                      <Text style={styles.wheelLabel}>Período</Text>
                      <View style={styles.periodButtons}>
                        <TouchableOpacity
                          style={[
                            styles.periodButton,
                            customPeriod === 'am' &&
                              styles.periodButtonActive,
                          ]}
                          onPress={() => setCustomPeriod('am')}
                        >
                          <Text
                            style={[
                              styles.periodButtonText,
                              customPeriod === 'am' &&
                                styles.periodButtonTextActive,
                            ]}
                          >
                            AM
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.periodButton,
                            customPeriod === 'pm' &&
                              styles.periodButtonActive,
                          ]}
                          onPress={() => setCustomPeriod('pm')}
                        >
                          <Text
                            style={[
                              styles.periodButtonText,
                              customPeriod === 'pm' &&
                                styles.periodButtonTextActive,
                            ]}
                          >
                            PM
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={styles.previewContainer}>
                    <Text style={styles.previewLabel}>Vista previa:</Text>
                    <Text style={styles.previewTime}>
                      {parseInt(customHours)}:{customMinutes} {customPeriod}
                    </Text>
                  </View>

                  <View style={styles.customButtonsRow}>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={handleBackToQuick}
                    >
                      <Feather
                        name="chevron-left"
                        size={18}
                        color={COLORS.primary}
                      />
                      <Text style={styles.backButtonText}>Atrás</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.confirmButton}
                      onPress={handleCustomTimeSelect}
                    >
                      <Text style={styles.confirmButtonText}>
                        Confirmar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    width: '100%',
  },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.darkGray,
  },
  quickTimesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
  },
  quickTimeButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  quickTimeButtonActive: {
    backgroundColor: `${COLORS.primary}15`,
    borderColor: COLORS.primary,
  },
  quickTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
    textAlign: 'center',
  },
  quickTimeTextActive: {
    color: COLORS.primary,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  customButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  customPickerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  customLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  wheelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  wheelColumn: {
    alignItems: 'center',
    flex: 1,
  },
  wheelLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 8,
  },
  wheel: {
    height: 150,
  },
  wheelItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.gray,
  },
  wheelItemTextActive: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.primary,
  },
  separator: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  periodColumn: {
    alignItems: 'center',
  },
  periodButtons: {
    gap: 8,
  },
  periodButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  periodButtonTextActive: {
    color: COLORS.white,
  },
  previewContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  previewTime: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  customButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  backButton: {
    flex: 0.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    gap: 6,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  confirmButton: {
    flex: 0.6,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
});