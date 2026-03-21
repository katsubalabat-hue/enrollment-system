from django.contrib import admin
from .models import Student, Subject, Section, Enrollment


# ----------------------
# STUDENT ADMIN
# ----------------------
@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'email', 'total_units')


# ----------------------
# SUBJECT ADMIN
# ----------------------
@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject_code', 'subject_name', 'units')


# ----------------------
# SECTION ADMIN
# ----------------------
@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('id', 'section_name', 'subject', 'max_capacity', 'current_count')


# ----------------------
# ENROLLMENT ADMIN
# ----------------------
@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'student', 'subject', 'section', 'status', 'enrollment_date')