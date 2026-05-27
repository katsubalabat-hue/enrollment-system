import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../../components/app-state";
import { api, getListData } from "../../src/api/api";
import { getCurrentUser } from "../../src/api/session";
import { getApiErrorMessage } from "../../src/utils/validation";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  student_number?: string;
  course?: string;
  year_level?: string;
  semester?: string;
  total_units: number;
  max_units: number;
  is_active: boolean;
}

export default function Students() {
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [actingId, setActingId] = useState<number | null>(null);

  const fetchStudents = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const res = await api.get("students/");
      setStudents(getListData<Student>(res.data));
    } catch (err: any) {
      console.log(err?.response?.data);

      const message =
        err?.response?.data?.detail ||
        "Failed to load student names";

      setErrorMessage(message);
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const user = await getCurrentUser();
        setIsAdmin(user.is_staff);

        if (user.is_staff) {
          fetchStudents();
        } else {
          setErrorMessage("Student directory is available to administrators only.");
          setLoading(false);
        }
      } catch (err: any) {
        console.log(err?.response?.data);
        setErrorMessage("Unable to verify admin access.");
        setLoading(false);
      }
    };

    loadData();
  }, [fetchStudents]);

  const handleAccountStatus = async (student: Student) => {
    const actionName = student.is_active ? "deactivate" : "activate";

    try {
      setActingId(student.id);

      const response = await api.post<Student>(
        `students/${student.id}/${actionName}/`
      );

      setStudents((currentStudents) =>
        currentStudents.map((currentStudent) =>
          currentStudent.id === student.id
            ? response.data
            : currentStudent
        )
      );

      Alert.alert(
        "Success",
        `${getStudentName(student)} has been ${actionName}d.`
      );
    } catch (err: any) {
      console.log(err?.response?.data);

      Alert.alert(
        "Error",
        getApiErrorMessage(
          err?.response?.data,
          "Failed to update student account"
        )
      );
    } finally {
      setActingId(null);
    }
  };

  const getInitials = (first?: string, last?: string) => {
    const initials = `${first?.trim()?.[0] || ""}${
      last?.trim()?.[0] || ""
    }`.toUpperCase();

    return initials || "?";
  };

  const getStudentName = (student: Student) => {
    const name = `${student.first_name || ""} ${
      student.last_name || ""
    }`.trim();

    return name || student.email || "Unnamed student";
  };

  if (loading) {
    return <LoadingState label="Loading students..." />;
  }

  if (errorMessage) {
    return (
      <View style={styles.page}>
        <View style={styles.container}>
          <ErrorState
            message={errorMessage}
            onRetry={() => fetchStudents()}
          />
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.page}
      contentContainerStyle={styles.container}
      data={students}
      key={isWide ? "wide" : "narrow"}
      keyExtractor={(student) => String(student.id)}
      numColumns={isWide ? 2 : 1}
      refreshing={refreshing}
      onRefresh={() => fetchStudents(true)}
      ListHeaderComponent={(
        <>
          <Text style={styles.title}>Student Directory</Text>

          <Text style={styles.countText}>
            {students.length} student(s) on record
          </Text>
        </>
      )}
      ListEmptyComponent={(
        <EmptyState
          title="No students available"
          message="Student records will appear here once available."
        />
      )}
      renderItem={({ item: student }) => (
        <View style={[styles.card, isWide && styles.gridCard]}>
          <View style={styles.cardHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {getInitials(student.first_name, student.last_name)}
              </Text>
            </View>

            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>
                {getStudentName(student)}
              </Text>

              <Text style={styles.meta}>
                {student.course || "No course"} /{" "}
                {student.year_level || "No year"} /{" "}
                {student.semester || "No semester"}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                student.is_active ? styles.activeBadge : styles.inactiveBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {student.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          <View style={styles.detailGrid}>
            <Text style={styles.detailText}>
              ID: {student.student_number || "N/A"}
            </Text>
            <Text style={styles.detailText}>
              Units: {student.total_units}/{student.max_units}
            </Text>
            <Text style={styles.detailText}>
              Email: {student.email}
            </Text>
          </View>

          {isAdmin ? (
            <TouchableOpacity
              style={[
                styles.accountButton,
                student.is_active
                  ? styles.deactivateButton
                  : styles.activateButton,
                actingId === student.id && styles.disabledButton,
              ]}
              disabled={actingId === student.id}
              onPress={() => handleAccountStatus(student)}
            >
              <Text style={styles.accountButtonText}>
                {student.is_active ? "Deactivate" : "Activate"}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  container: {
    padding: 16,
    paddingBottom: 84,
    width: "100%",
    maxWidth: 1440,
    alignSelf: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    color: "#0F172A",
  },

  countText: {
    color: "#64748B",
    marginBottom: 16,
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },

  gridCard: {
    marginHorizontal: 6,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#1D4ED8",
    fontWeight: "700",
  },

  studentInfo: {
    flex: 1,
    marginLeft: 10,
  },

  studentName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },

  meta: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  activeBadge: {
    backgroundColor: "#DCFCE7",
  },

  inactiveBadge: {
    backgroundColor: "#FEE2E2",
  },

  statusText: {
    color: "#0F172A",
    fontSize: 12,
    fontWeight: "700",
  },

  detailGrid: {
    marginTop: 12,
    gap: 4,
  },

  detailText: {
    color: "#475569",
    fontSize: 13,
  },

  accountButton: {
    minHeight: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  activateButton: {
    backgroundColor: "#16A34A",
  },

  deactivateButton: {
    backgroundColor: "#DC2626",
  },

  disabledButton: {
    opacity: 0.7,
  },

  accountButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
