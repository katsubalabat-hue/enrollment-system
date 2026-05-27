"""
URL configuration for enrollment_system project
"""

from django.contrib import admin
from django.urls import path, include

from django.conf import settings
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from core.views import (
    StudentViewSet,
    SubjectViewSet,
    SectionViewSet,
    EnrollmentViewSet,

    profile,
    update_student_profile,
    upload_profile_picture,
    chatbot,
    current_user,

    RegisterView,
    register_user,
)

# =========================================================
# ROUTER
# =========================================================
router = DefaultRouter()

router.register(r'students', StudentViewSet, basename='students')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollments')
router.register(r'subjects', SubjectViewSet, basename='subjects')
router.register(r'sections', SectionViewSet, basename='sections')


# =========================================================
# URL PATTERNS
# =========================================================
urlpatterns = [

    # =====================================================
    # ADMIN
    # =====================================================
    path('admin/', admin.site.urls),

    # =====================================================
    # DRF AUTH
    # =====================================================
    path('api-auth/', include('rest_framework.urls')),

    # =====================================================
    # AUTH ENDPOINTS
    # =====================================================

    # REGISTER (FUNCTION-BASED - MAIN ONE YOU USE)
    path('api/auth/register/', register_user, name='register'),

    # OPTIONAL CLASS-BASED REGISTER (if needed)
    path('api/auth/register-v2/', RegisterView.as_view(), name='register-v2'),

    # LOGIN (JWT)
    path('api/auth/login/', TokenObtainPairView.as_view(), name='login'),

    # CURRENT USER
    path('api/auth/me/', current_user, name='current-user'),

    # REFRESH TOKEN
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # =====================================================
    # API ROUTES (VIEWSETS)
    # =====================================================
    path('api/', include(router.urls)),

    # =====================================================
    # PROFILE ROUTES
    # =====================================================
    path('api/profile/', profile, name='profile'),

    path('api/profile/update/', update_student_profile, name='update-profile'),

    path('api/profile/upload-picture/', upload_profile_picture, name='upload-profile-picture'),

    # =====================================================
    # CHATBOT ROUTE
    # =====================================================
    path('api/chatbot/', chatbot, name='chatbot'),
]


# =========================================================
# MEDIA FILES (DEVELOPMENT ONLY)
# =========================================================
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )
