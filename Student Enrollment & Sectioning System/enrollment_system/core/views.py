from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db import transaction
from django.core.exceptions import ValidationError

from .models import Student, Subject, Section, Enrollment
from .serializers import (
    StudentSerializer,
    SubjectSerializer,
    SectionSerializer,
    EnrollmentSerializer
)


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class SectionViewSet(viewsets.ModelViewSet):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer

    def create(self, request, *args, **kwargs):
        student_id = request.data.get("student")
        subject_id = request.data.get("subject")

        if not student_id or not subject_id:
            return Response(
                {"error": "Student and subject are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        existing = Enrollment.objects.filter(
            student=student_id,
            subject=subject_id
        ).first()

        # ------------------------------
        # 🔁 REACTIVATE DROPPED ENROLLMENT
        # ------------------------------
        if existing:
            if existing.status == "DROPPED":
                try:
                    with transaction.atomic():
                        assigned_section = existing.assign_section()

                        if assigned_section:
                            assigned_section = Section.objects.select_for_update().get(
                                pk=assigned_section.pk
                            )

                            if assigned_section.current_count < assigned_section.max_capacity:
                                existing.section = assigned_section
                                existing.status = "ENROLLED"
                                assigned_section.current_count += 1
                                assigned_section.save()
                            else:
                                existing.section = None
                                existing.status = "WAITLISTED"
                        else:
                            existing.section = None
                            existing.status = "WAITLISTED"

                        # Validate max units
                        try:
                            existing.full_clean()
                        except ValidationError as e:
                            return Response(
                                {
                                    "error": e.messages[0],
                                    "total_units": existing.student.total_units,
                                    "max_units": existing.student.max_units
                                },
                                status=status.HTTP_400_BAD_REQUEST
                            )

                        existing.save()

                    serializer = self.get_serializer(existing)
                    return Response(serializer.data, status=status.HTTP_200_OK)

                except Exception as e:
                    return Response(
                        {"error": str(e)},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            else:
                return Response(
                    {
                        "error": "Student is already enrolled in this subject.",
                        "total_units": existing.student.total_units,
                        "max_units": existing.student.max_units
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        # ------------------------------
        # 🆕 NEW ENROLLMENT
        # ------------------------------
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            enrollment = serializer.save()
        except ValidationError as e:
            student = Student.objects.get(pk=student_id)
            return Response(
                {
                    "error": e.messages[0],
                    "total_units": student.total_units,
                    "max_units": student.max_units
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            self.get_serializer(enrollment).data,
            status=status.HTTP_201_CREATED
        )