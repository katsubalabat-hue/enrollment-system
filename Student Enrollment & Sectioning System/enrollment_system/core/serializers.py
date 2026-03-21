from rest_framework import serializers
from .models import Student, Subject, Section, Enrollment

# ------------------------------
# STUDENT
# ------------------------------
class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    total_units = serializers.IntegerField(read_only=True)
    max_units = serializers.IntegerField()

    class Meta:
        model = Student
        fields = '__all__'

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"


# ------------------------------
# SUBJECT
# ------------------------------
class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


# ------------------------------
# SECTION
# ------------------------------
class SectionSerializer(serializers.ModelSerializer):
    subject_code = serializers.CharField(source="subject.subject_code", read_only=True)
    subject_name = serializers.CharField(source="subject.subject_name", read_only=True)

    class Meta:
        model = Section
        fields = '__all__'


# ------------------------------
# ENROLLMENT
# ------------------------------
class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    total_units = serializers.IntegerField(source="student.total_units", read_only=True)
    max_units = serializers.IntegerField(source="student.max_units", read_only=True)
    subject_name = serializers.CharField(source="subject.subject_name", read_only=True)
    section_name = serializers.CharField(source="section.section_name", read_only=True)

    class Meta:
        model = Enrollment
        fields = '__all__'