"""
URL configuration for enrollment_system project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from core.views import StudentViewSet, SubjectViewSet, SectionViewSet, EnrollmentViewSet

# ----------------------
# DRF ROUTER
# ----------------------
router = routers.DefaultRouter()
router.register(r'students', StudentViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'enrollments', EnrollmentViewSet)

# ----------------------
# URLPATTERNS
# ----------------------
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # API routes
]