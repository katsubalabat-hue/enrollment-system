# signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings

from .models import Student


# =========================================================
# SYNC STUDENT (ON USER UPDATE)
# =========================================================
@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def sync_student(sender, instance, created, **kwargs):

    # Skip initial user creation
    if created:
        return

    try:
        # Get existing student profile
        student = Student.objects.get(user=instance)

        # Sync fields
        student.first_name = instance.first_name
        student.last_name = instance.last_name
        student.email = instance.email

        student.save()

    except Student.DoesNotExist:

        # Create student only if missing
        Student.objects.create(
            user=instance,
            email=instance.email,
            first_name=instance.first_name,
            last_name=instance.last_name
        )