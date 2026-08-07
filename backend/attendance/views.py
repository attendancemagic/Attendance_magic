from rest_framework.decorators import api_view
from rest_framework.response import Response
from math import radians, sin, cos, sqrt, atan2
from django.utils import timezone
from datetime import timedelta
from django.db.models import Count
from face.models import SessionFace

def cosine_similarity(vec1, vec2):
    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    magnitude1 = sqrt(sum(a * a for a in vec1))
    magnitude2 = sqrt(sum(b * b for b in vec2))
    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0
    return dot_product / (magnitude1 * magnitude2)


from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from face.models import SessionFace
from django.db.models.functions import TruncDate
from .models import AttendanceSession, AttendanceRecord, Student
from .serializers import (
    AttendanceSessionSerializer,
    AttendanceRecordSerializer,
    StudentSerializer
)
import cloudinary.uploader

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def faculty_profile(request):

    return Response({

        "username": request.user.username,

        "email": request.user.email,

        "id": request.user.id

    })
def calculate_distance(lat1, lon1, lat2, lon2):

    R = 6371000

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat1))
        * cos(radians(lat2))
        * sin(dlon / 2) ** 2
    )

    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )

    return R * c


# @api_view(["POST"])
# @permission_classes([IsAuthenticated])
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_session(request):

    data = request.data.copy()

    active_session = AttendanceSession.objects.filter(
        faculty=request.user,
        is_active=True,
        expires_at__gt=timezone.now()
    ).first()

    if active_session:

        return Response(
            {
                "message": "A session is already active. Please end it first."
            },
            status=400
        )

    duration = int(
        data.get("duration_minutes", 2)
    )

    data["expires_at"] = (
        timezone.now() +
        timedelta(minutes=duration)
    )

    serializer = AttendanceSessionSerializer(data=data)

    if serializer.is_valid():

        session = serializer.save(
            faculty=request.user
        )

        attendance_link = (
            f"https://attendance-magic-xi.vercel.app/attendance/{session.id}"
        )

        return Response({

            "message": "Attendance Session Created",

            "session_id": session.id,

            "attendance_link": attendance_link,

            "data": AttendanceSessionSerializer(session).data

        })

    return Response(serializer.errors, status=400)
@api_view(["GET"])
def active_session(request):

    AttendanceSession.objects.filter(
        expires_at__lt=timezone.now(),
        is_active=True
    ).update(
        is_active=False
    )

    session = AttendanceSession.objects.filter(
        is_active=True
    ).first()

    if not session:
        return Response(
            {"message": "No Active Session"},
            status=404
        )

    serializer = AttendanceSessionSerializer(
        session
    )

    return Response(
        serializer.data
    )

@api_view(["GET"])
def session_details(request, session_id):

    try:

        session = AttendanceSession.objects.get(
            id=session_id,
            is_active=True
        )

    except AttendanceSession.DoesNotExist:

        return Response(
            {
                "message": "Session Not Found"
            },
            status=404
        )

    if timezone.now() > session.expires_at:

        session.is_active = False
        session.save()

        return Response(
            {
                "message": "Session Expired"
            },
            status=400
        )

    return Response({

        "id": session.id,

        "department": session.department,

        "section": session.section,

        "faculty": session.faculty.username,

        "radius": session.radius,

        "expires_at": session.expires_at,

        "is_active": session.is_active

    })


@api_view(["POST"])
def verify_location(request):

    session_id = request.data.get("session_id")
    student_lat = request.data.get("latitude")
    student_lon = request.data.get("longitude")
    gps_accuracy = request.data.get("accuracy", 0)

    if not session_id:
        return Response(
            {"message": "Session ID is required"},
            status=400
        )

    try:
        session = AttendanceSession.objects.get(
            id=session_id,
            is_active=True
        )

    except AttendanceSession.DoesNotExist:

        return Response(
            {"message": "Attendance Session Not Found"},
            status=404
        )

    if timezone.now() > session.expires_at:

        session.is_active = False
        session.save()

        return Response(
            {"message": "Attendance Session Expired"},
            status=400
        )

    distance = calculate_distance(
        session.faculty_latitude,
        session.faculty_longitude,
        float(student_lat),
        float(student_lon)
    )

    # GPS accuracy buffer:
    # Consumer GPS is inherently imprecise (3-50+ meters).
    # We add the device's reported accuracy as a buffer,
    # and enforce a minimum effective radius of 50 meters
    # to prevent false rejections from GPS drift.
    MIN_EFFECTIVE_RADIUS = 50
    try:
        accuracy_buffer = float(gps_accuracy)
    except (TypeError, ValueError):
        accuracy_buffer = 0

    effective_radius = max(
        session.radius + accuracy_buffer,
        MIN_EFFECTIVE_RADIUS
    )

    return Response({
        "verified": distance <= effective_radius,
        "distance": round(distance, 2),
        "radius": session.radius,
        "effective_radius": round(effective_radius, 2),
        "department": session.department,
        "section": session.section
    })
@api_view(["POST"])
def mark_attendance(request):

    print("Incoming Data:", request.data)

    session_id = request.data.get("session_id")
    roll_number = request.data.get("roll_number")
    device_id = request.data.get("device_id")
    face_image = request.data.get("face_image")

    # ----------------------------
    # Validate Face Image
    # ----------------------------
    if not face_image:
        return Response(
            {
                "message": "Face image is required."
            },
            status=400
        )

    # ----------------------------
    # Validate Session
    # ----------------------------
    try:
        session = AttendanceSession.objects.get(
            id=session_id,
            is_active=True
        )

    except AttendanceSession.DoesNotExist:

        return Response(
            {
                "message": "Attendance Session Not Found"
            },
            status=404
        )

    # ----------------------------
    # Check Session Expiry
    # ----------------------------
    if timezone.now() > session.expires_at:

        session.is_active = False
        session.save()

        return Response(
            {
                "message": "Attendance Session Expired"
            },
            status=400
        )



    # ----------------------------
    # Roll Number Check
    # ----------------------------
    if AttendanceRecord.objects.filter(
        session=session,
        roll_number=roll_number
    ).exists():

        return Response(
            {
                "message": "Attendance already marked with this Roll Number."
            },
            status=400
        )

    # ----------------------------
    # Device Check
    # ----------------------------
    if AttendanceRecord.objects.filter(
        session=session,
        device_id=device_id
    ).exists():

        return Response(
            {
                "message": "Attendance has already been submitted from this device."
            },
            status=400
        )

    # ----------------------------
    # Save Attendance
    # ----------------------------
    data = request.data.copy()
    data["session"] = session.id

    serializer = AttendanceRecordSerializer(
        data=data
    )

    if serializer.is_valid():

        attendance = serializer.save()

        # ----------------------------
        # Save Face Reference
        # ----------------------------
        SessionFace.objects.create(
            session=session,
            attendance=attendance,
            embedding=[]
        )

        return Response(
            {
                "message": "Attendance Marked Successfully",
                "data": serializer.data
            }
        )

    return Response(
        {
            "errors": serializer.errors
        },
        status=400
    )
# ===== FACULTY DASHBOARD APIs =====




@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attendance_summary(request):

    summary = (

        AttendanceRecord.objects

        .annotate(
            attendance_date=TruncDate("attendance_time")
        )

        .values(
            "attendance_date",
            "department",
            "section"
        )

        .annotate(
            student_count=Count("id")
        )

        .order_by(
            "-attendance_date",
            "department",
            "section"
        )

    )

    return Response(summary)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attendance_list(request):

    department = request.GET.get(
        "department"
    )

    section = request.GET.get(
        "section"
    )

    records = AttendanceRecord.objects.filter(
        department=department,
        section=section
    ).order_by(
        "roll_number"
    )

    serializer = AttendanceRecordSerializer(
        records,
        many=True
    )

    return Response(serializer.data)   

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def export_excel(request):

    department = request.GET.get("department")
    section = request.GET.get("section")

    records = AttendanceRecord.objects.filter(
        department=department,
        section=section
    )

    response = HttpResponse(content_type="text/csv")
    filename = f"{department}_{section}_Attendance.csv"
    response["Content-Disposition"] = f'attachment; filename="{filename}"'

    import csv
    writer = csv.writer(response)
    writer.writerow(["Name", "Roll Number", "Department", "Section", "Attendance Time"])
    
    for record in records:
        writer.writerow([
            record.name,
            record.roll_number,
            record.department,
            record.section,
            record.attendance_time.strftime("%I:%M:%S %p")
        ])

    return response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def end_session(request):

    sessions = AttendanceSession.objects.filter(
        faculty=request.user,
        is_active=True
    )

    for session in sessions:
        SessionFace.objects.filter(
            session=session
        ).delete()

    sessions.update(
        is_active=False
    )

    return Response({
        "message": "Session Ended Successfully"
    })

@api_view(["POST"])
def register_student(request):
    data = request.data
    face_image = data.get("face_image")
    
    if not face_image:
        return Response({"message": "Face image is required"}, status=400)
    
    try:
        upload_data = cloudinary.uploader.upload(face_image, folder="attendance_magic/students")
        face_image_url = upload_data.get("secure_url")
    except Exception as e:
        return Response({"message": f"Cloudinary upload failed: {str(e)}"}, status=500)
    
    student_data = {
        "name": data.get("name"),
        "roll_number": data.get("roll_number"),
        "department": data.get("department"),
        "section": data.get("section"),
        "face_image_url": face_image_url,
        "face_descriptor": data.get("face_descriptor")
    }
    
    serializer = StudentSerializer(data=student_data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Student registered successfully", "data": serializer.data})
    
    return Response(serializer.errors, status=400)

@api_view(["GET"])
def get_students(request):
    roll_number = request.GET.get('roll_number')
    if roll_number:
        students = Student.objects.filter(roll_number__iexact=roll_number)
    else:
        students = Student.objects.all()
    serializer = StudentSerializer(students, many=True)
    return Response(serializer.data)