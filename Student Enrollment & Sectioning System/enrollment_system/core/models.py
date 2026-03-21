from django.db import models, transaction
from django.core.exceptions import ValidationError

# ----------------------
# STUDENT
# ----------------------
class Student(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    enrolled_date = models.DateField(auto_now_add=True)

    # Editable max units
    max_units = models.IntegerField(default=21)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def total_units(self):
        """Sum units of all ENROLLED enrollments for this student"""
        enrollments = self.enrollments.filter(status='ENROLLED')
        return sum(
            e.section.subject.units
            for e in enrollments
            if e.section and e.section.subject
        )


# ----------------------
# SUBJECT
# ----------------------
class Subject(models.Model):
    subject_code = models.CharField(max_length=20, unique=True)
    subject_name = models.CharField(max_length=100)
    units = models.IntegerField()

    def __str__(self):
        return f"{self.subject_code} - {self.subject_name}"


# ----------------------
# SECTION
# ----------------------
class Section(models.Model):
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='sections')
    section_name = models.CharField(max_length=50)
    max_capacity = models.IntegerField()
    current_count = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.subject.subject_code} - {self.section_name}"

    def has_slot(self):
        """Check if the section can take another student"""
        return self.current_count < self.max_capacity


# ----------------------
# ENROLLMENT
# ----------------------
class Enrollment(models.Model):
    STATUS_CHOICES = [
        ('ENROLLED', 'Enrolled'),
        ('DROPPED', 'Dropped'),
        ('WAITLISTED', 'Waitlisted'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='enrollments')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, null=True, blank=True)
    section = models.ForeignKey(Section, on_delete=models.CASCADE, null=True, blank=True)
    enrollment_date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ENROLLED')

    class Meta:
        unique_together = ('student', 'subject')

    def clean(self):
        """Validate unit limits and duplicate enrollment"""
        # Prevent duplicate active enrollment
        existing = Enrollment.objects.filter(student=self.student, subject=self.subject).exclude(pk=self.pk)
        if existing.exists() and existing.first().status != "DROPPED":
            raise ValidationError("Student is already enrolled in this subject.")

        # Enforce max units
        if self.status == 'ENROLLED' and self.subject:
            new_units = self.subject.units
            if self.student.total_units + new_units > self.student.max_units:
                raise ValidationError(
                    f"Cannot exceed {self.student.max_units} total units."
                )

    def assign_section(self):
        """Automatically assign section based on availability"""
        sections = Section.objects.filter(subject=self.subject).order_by('current_count')
        for sec in sections:
            if sec.has_slot():
                return sec
        return None

    def save(self, *args, **kwargs):
        """Custom save to handle section assignment and waitlist logic"""
        is_new = self.pk is None

        with transaction.atomic():
            # Auto-assign section for new enrollments
            if is_new and self.status == "ENROLLED" and self.subject:
                section = self.assign_section()
                if section:
                    section = Section.objects.select_for_update().get(pk=section.pk)
                    if section.has_slot():
                        self.section = section
                        section.current_count += 1
                        section.save()
                    else:
                        self.status = "WAITLISTED"
                        self.section = None
                else:
                    self.status = "WAITLISTED"
                    self.section = None

            # Run validations
            self.full_clean()
            super().save(*args, **kwargs)