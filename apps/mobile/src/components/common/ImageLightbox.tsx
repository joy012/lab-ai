import { useState } from "react";
import {
  Modal,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Text,
  StatusBar,
} from "react-native";
import { X, ChevronLeft, ChevronRight } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ImageLightboxProps {
  images: string[];
  visible: boolean;
  initialIndex?: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export function ImageLightbox({
  images,
  visible,
  initialIndex = 0,
  onClose,
}: ImageLightboxProps) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!visible || images.length === 0) return null;

  const goNext = () => {
    if (currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const goPrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {/* Close button */}
        <TouchableOpacity
          style={{
            position: "absolute",
            top: insets.top + 8,
            right: 16,
            zIndex: 10,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.2)",
            alignItems: "center",
            justifyContent: "center",
          }}
          onPress={onClose}
        >
          <X size={22} color="#fff" />
        </TouchableOpacity>

        {/* Image with pinch-to-zoom via ScrollView */}
        <ScrollView
          key={currentIndex}
          contentContainerStyle={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
          maximumZoomScale={5}
          minimumZoomScale={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          bouncesZoom
        >
          <Image
            source={{ uri: images[currentIndex] }}
            style={{
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT * 0.8,
            }}
            resizeMode="contain"
          />
        </ScrollView>

        {/* Navigation arrows for multiple images */}
        {images.length > 1 && (
          <View
            style={{
              position: "absolute",
              bottom: insets.bottom + 60,
              left: 0,
              right: 0,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <TouchableOpacity
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor:
                  currentIndex > 0 ? "rgba(255,255,255,0.25)" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={goPrev}
              disabled={currentIndex === 0}
            >
              {currentIndex > 0 && <ChevronLeft size={24} color="#fff" />}
            </TouchableOpacity>

            <Text
              style={{
                color: "#fff",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {currentIndex + 1} / {images.length}
            </Text>

            <TouchableOpacity
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor:
                  currentIndex < images.length - 1
                    ? "rgba(255,255,255,0.25)"
                    : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
              onPress={goNext}
              disabled={currentIndex === images.length - 1}
            >
              {currentIndex < images.length - 1 && (
                <ChevronRight size={24} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}
