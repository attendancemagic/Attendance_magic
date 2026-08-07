from django.urls import path
from .views import (
    start_session,
    active_session,
    verify_location,
    mark_attendance,
    attendance_summary,
    attendance_list,
    export_excel,
    faculty_profile,
    session_details,
    end_session,
    register_student,
    get_students,
)

from .auth_views import LoginView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("start-session/", start_session),
    path("active-session/", active_session),
    path("verify-location/", verify_location),
    path("mark-attendance/", mark_attendance),

    path("attendance-summary/", attendance_summary),
    path("attendance-list/", attendance_list),
    path("export-excel/", export_excel),
    path("login/", LoginView.as_view()),

    path(
        "token/refresh/",
        TokenRefreshView.as_view()),
    path(
    "faculty-profile/",
    faculty_profile
    ),
    path(
    "session/<int:session_id>/",
    session_details
     ),
    path(
    "end-session/",
    end_session
    ),
    path("students/register/", register_student),
    path("students/", get_students),
]