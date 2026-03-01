import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { Camera, ImageIcon, Upload, X, FileText } from "lucide-react-native";
import { labReportsService } from "../../src/services/lab-reports.service";
import { AppHeader } from "../../src/components/common/AppHeader";
import { useTheme } from "../../src/theme/ThemeContext";
import { toast } from "../../src/utils/toast";
import { haptics } from "../../src/utils/haptics";

const MAX_FILES = 10;

interface SelectedFile {
  uri: string;
  name: string;
  type: string;
  isPdf: boolean;
}

export default function UploadScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [files, setFiles] = useState<SelectedFile[]>([]);
  const [title, setTitle] = useState("");

  const { mutate: uploadReport, isPending } =
    labReportsService.useUploadLabReport({
      onSuccess: (data: any) => {
        toast.success("Upload Successful", "Your report is being analyzed by AI.");
        setFiles([]);
        setTitle("");
        router.push(`/report/${data.id}`);
      },
      onError: (error: Error) => {
        console.error("[Upload Error]", error.message, error);
        toast.error("Upload Failed", error.message);
      },
    });

  const remaining = MAX_FILES - files.length;

  const pickImages = async () => {
    if (remaining <= 0) {
      toast.error("Limit Reached", `Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.error("Permission needed", "Please grant gallery access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });
    if (!result.canceled) {
      const newFiles = result.assets.map((a) => ({
        uri: a.uri,
        name: a.fileName || "image.jpg",
        type: a.mimeType || "image/jpeg",
        isPdf: false,
      }));
      setFiles((prev) => [...prev, ...newFiles].slice(0, MAX_FILES));
    }
  };

  const takePhoto = async () => {
    if (remaining <= 0) {
      toast.error("Limit Reached", `Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      toast.error("Permission needed", "Please grant camera access.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setFiles((prev) => [
        ...prev,
        {
          uri: a.uri,
          name: a.fileName || "photo.jpg",
          type: a.mimeType || "image/jpeg",
          isPdf: false,
        },
      ].slice(0, MAX_FILES));
    }
  };

  const pickPdfs = async () => {
    if (remaining <= 0) {
      toast.error("Limit Reached", `Maximum ${MAX_FILES} files allowed.`);
      return;
    }
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      multiple: true,
    });
    if (!result.canceled) {
      const newFiles = result.assets.map((a) => ({
        uri: a.uri,
        name: a.name || "document.pdf",
        type: a.mimeType || "application/pdf",
        isPdf: true,
      }));
      setFiles((prev) => [...prev, ...newFiles].slice(0, MAX_FILES));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) {
      toast.error("No Files", "Please select at least one file.");
      return;
    }
    haptics.medium();

    const formData = new FormData();
    files.forEach((f) => {
      formData.append("files", {
        uri: f.uri,
        name: f.name,
        type: f.type,
      } as any);
    });
    if (title) formData.append("title", title);

    uploadReport({ body: formData });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppHeader />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 24 }}>
        <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>
          Upload Lab Report
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 4,
            marginBottom: 24,
          }}
        >
          Upload images or PDFs of your lab report (up to {MAX_FILES} files)
        </Text>

        {/* Source buttons */}
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 14,
              padding: 20,
              alignItems: "center",
              gap: 8,
              borderWidth: 2,
              borderColor: colors.border,
              borderStyle: "dashed",
            }}
            onPress={() => { haptics.light(); takePhoto(); }}
          >
            <Camera size={28} color={colors.primary} />
            <Text style={{ fontSize: 13, fontWeight: "500", color: colors.text }}>
              Camera
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 14,
              padding: 20,
              alignItems: "center",
              gap: 8,
              borderWidth: 2,
              borderColor: colors.border,
              borderStyle: "dashed",
            }}
            onPress={() => { haptics.light(); pickImages(); }}
          >
            <ImageIcon size={28} color={colors.primary} />
            <Text style={{ fontSize: 13, fontWeight: "500", color: colors.text }}>
              Gallery
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: 14,
              padding: 20,
              alignItems: "center",
              gap: 8,
              borderWidth: 2,
              borderColor: colors.border,
              borderStyle: "dashed",
            }}
            onPress={() => { haptics.light(); pickPdfs(); }}
          >
            <FileText size={28} color={colors.primary} />
            <Text style={{ fontSize: 13, fontWeight: "500", color: colors.text }}>
              PDF
            </Text>
          </TouchableOpacity>
        </View>

        {/* File counter */}
        {files.length > 0 && (
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.primary,
              marginBottom: 12,
            }}
          >
            {files.length}/{MAX_FILES} files selected
          </Text>
        )}

        {/* File grid */}
        {files.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 24,
            }}
          >
            {files.map((f, i) => (
              <View
                key={i}
                style={{
                  width: "31%",
                  aspectRatio: 1,
                  borderRadius: 12,
                  overflow: "hidden",
                  backgroundColor: colors.surfaceSecondary,
                }}
              >
                {f.isPdf ? (
                  <View
                    style={{
                      flex: 1,
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                    }}
                  >
                    <FileText size={28} color={colors.primary} />
                    <Text
                      style={{
                        fontSize: 10,
                        color: colors.textSecondary,
                        textAlign: "center",
                        paddingHorizontal: 4,
                      }}
                      numberOfLines={2}
                    >
                      {f.name}
                    </Text>
                  </View>
                ) : (
                  <Image
                    source={{ uri: f.uri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                )}
                <TouchableOpacity
                  onPress={() => removeFile(i)}
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <X size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Title input */}
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: colors.textSecondary,
            marginBottom: 6,
          }}
        >
          Report Title (optional)
        </Text>
        <TextInput
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 10,
            padding: 14,
            fontSize: 16,
            marginBottom: 20,
            backgroundColor: colors.inputBackground,
            color: colors.text,
          }}
          placeholder="Enter a title for this report"
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
        />

        {/* Upload button */}
        <TouchableOpacity
          style={{
            backgroundColor: colors.primary,
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: files.length === 0 || isPending ? 0.5 : 1,
          }}
          onPress={handleUpload}
          disabled={files.length === 0 || isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Upload size={20} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                Upload & Analyze
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Info section */}
        <View
          style={{
            backgroundColor: colors.primaryLight,
            borderRadius: 12,
            padding: 16,
            marginTop: 24,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.primary,
              marginBottom: 8,
            }}
          >
            How it works
          </Text>
          <Text style={{ fontSize: 13, color: colors.primary, marginBottom: 4, opacity: 0.8 }}>
            1. AI extracts all test values from your files
          </Text>
          <Text style={{ fontSize: 13, color: colors.primary, marginBottom: 4, opacity: 0.8 }}>
            2. Each value is compared against reference ranges
          </Text>
          <Text style={{ fontSize: 13, color: colors.primary, marginBottom: 4, opacity: 0.8 }}>
            3. You receive a plain-language interpretation
          </Text>
          <Text style={{ fontSize: 13, color: colors.primary, opacity: 0.8 }}>
            4. A risk score and personalized recommendations are generated
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}
