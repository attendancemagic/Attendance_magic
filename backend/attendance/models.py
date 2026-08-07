from django.db import models
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth.models import User


class AttendanceSession(models.Model):

    department = models.CharField(
        max_length=100,
        blank=True,
        default=""
    )

    section = models.CharField(
        max_length=20,
        blank=True,
        default=""
    )

    faculty = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="attendance_sessions",
        null=True,
        blank=True
    )

    faculty_latitude = models.FloatField()

    faculty_longitude = models.FloatField()

    radius = models.IntegerField(default=100)

    duration_minutes = models.IntegerField(default=2)

    expires_at = models.DateTimeField()

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session {self.id}"

class AttendanceRecord(models.Model):

    session = models.ForeignKey(
        AttendanceSession,
        on_delete=models.CASCADE
    )

    name = models.CharField(max_length=100)

    roll_number = models.CharField(max_length=30)

    department = models.CharField(max_length=50)

    section = models.CharField(max_length=10)

    attendance_time = models.DateTimeField(
        auto_now_add=True
    )
    device_id = models.CharField(
    max_length=100,
    blank=True,
    null=True
    )

    def __str__(self):
        return self.roll_number

class Student(models.Model):
    name = models.CharField(max_length=100)
    roll_number = models.CharField(max_length=30, unique=True)
    department = models.CharField(max_length=50)
    section = models.CharField(max_length=10)
    face_image_url = models.URLField(null=True, blank=True)
    face_descriptor = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.roll_number