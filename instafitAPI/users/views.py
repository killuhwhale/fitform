from django.contrib.auth.models import User, Group
from rest_framework import viewsets
from rest_framework import permissions
from users.serializers import UserCreateSerializer, UserSerializer, GroupSerializer, UserWithoutEmailSerializer
from rest_framework.decorators import action
from gyms.s3 import s3Client
from gyms.views import FILES_KINDS
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.contrib.auth import get_user_model
from users.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
s3_client = s3Client()


# Deprecated since we dont send user info with requests. We have tokens...
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
    queryset = get_user_model().objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = []

    @action(detail=False, methods=['POST'], permission_classes=[permissions.IsAuthenticated])
    def update_username(self, request, pk=None):
        try:
            user_id = request.user.id
            user = get_user_model().objects.get(id=user_id)
            username = request.data.get("username", user.username)
            print("New username: ", username)
            user.username = username
            user.save()
            return Response(UserSerializer(user).data)
        except Exception as e:
            print("Update username error: ", e)
        return Response({'error': 'Unable to update username'})

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def user_info(self, request, pk=None):
        if request.user:
            return Response(UserSerializer(request.user).data)
        return Response({})

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def profile_image(self, request, pk=None):
        try:
            user_id = request.user.id
            file = request.data.getlist("file", [None])[0]
            if file and user_id:
                return Response(s3_client.upload(file, FILES_KINDS[4], user_id, "profile_image"))
            return Response("Failed uploading image, no file given.")
        except Exception as e:
            print("User profile image upload: ", e)
            return Response("Error uploading user profile image")

    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'retrieve':
            return UserWithoutEmailSerializer
        elif self.action == "create":
            return UserCreateSerializer
        return UserSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = []


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer
