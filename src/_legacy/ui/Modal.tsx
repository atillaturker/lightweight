import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { colors, spacing } from "../../theme";

interface ModalComponentProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode; // Alt kısımdaki butonlar için alan
  containerStyle?: ViewStyle;
}

const ModalComponent = ({
  visible,
  onClose,
  title,
  children,
  footer,
  containerStyle,
}: ModalComponentProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent // Android status bar arkasına geçebilmesi için
    >
      {/* 
        TouchableWithoutFeedback ve overlay View:
        Kullanıcı modal'ın dışına (siyah alana) tıkladığında modalı kapatmak için.
      */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* İçerik kısmına tıklayınca kapanmasın diye stopPropagation mantığı */}
        <TouchableWithoutFeedback>
          <View style={[styles.contentContainer, containerStyle]}>
            {/* Header Kısmı (Opsiyonel) */}
            {title && (
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
              </View>
            )}

            {/* Ana İçerik */}
            <View style={styles.body}>{children}</View>

            {/* Footer / Butonlar (Opsiyonel) */}
            {footer && <View style={styles.footer}>{footer}</View>}
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

export default ModalComponent;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Yarı saydam siyah arka plan
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.m,
  },
  contentContainer: {
    width: "90%", // Ekranın %90'ını kaplasın
    maxWidth: 400, // Tabletlerde çok büyümesin
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    padding: spacing.m, // İç boşluk
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10, // Android gölgesi
  },
  header: {
    marginBottom: spacing.m,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.ui.border,
    paddingBottom: spacing.s,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter",
    color: colors.text.primary,
  },
  body: {
    // İçerik alanı esnek olabilir
  },
  footer: {
    marginTop: spacing.m,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.s,
  },
});
