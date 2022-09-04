from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework import permissions
from users.serializers import UserSerializer, GroupSerializer
from rest_framework.decorators import action
from gyms.s3 import s3Client
from gyms.views import FILES_KINDS
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, SAFE_METHODS
s3_client = s3Client()


class SelfActionPermission(BasePermission):
    message = """Only users can perform actions for themselves."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        if request.method == "POST" and not view.action == "CREATE":
            user_id = view.kwargs['pk']
            return str(user_id) == str(request.user.id)
        return False


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], permission_classes=[SelfActionPermission])
    def user_info(self, request, pk=None):
        if request.user:
            return Response(UserSerializer(request.user).data)
        return Response({})

    @action(detail=True, methods=['post'], permission_classes=[SelfActionPermission])
    def profile_image(self, request, pk=None):
        try:
            user_id = pk
            file = request.data.getlist("file", [None])[0]
            if file:
                return Response(s3_client.upload(file, FILES_KINDS[4], user_id, "profile_image"))
            return Response("Failed uploading image, no file given.")
        except Exception as e:
            print("User profile image upload: ", e)
            return Response("Error uploading user profile image")


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]
