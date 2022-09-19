import base64
import io
import json
import mimetypes
import sys
from typing import List
from rest_framework import viewsets, status
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser, FileUploadParser
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework.response import Response
from gyms.serializers import (UserSerializer, UserWithoutEmailSerializer, WorkoutCategorySerializer, GymSerializerWithoutClasses, BodyMeasurementsSerializer, Gym_ClassSerializer, GymSerializer, GymClassCreateSerializer,
                              GymClassSerializer, GymClassSerializerWithWorkouts, WorkoutSerializer,
                              WorkoutItemSerializer, WorkoutNamesSerializer, CoachesSerializer, ClassMembersSerializer,
                              WorkoutItemCreateSerializer, CoachesCreateSerializer, ClassMembersCreateSerializer,
                              GymClassFavoritesSerializer, GymFavoritesSerializer, LikedWorkoutsSerializer, WorkoutGroupsSerializer, WorkoutCreateSerializer, ProfileSerializer)
from gyms.models import BodyMeasurements, Gyms, GymClasses, WorkoutCategories, Workouts, WorkoutItems, WorkoutNames, Coaches, ClassMembers, GymClassFavorites, GymFavorites, LikedWorkouts, WorkoutGroups
from django.db.models import Q, Exists
import uuid
from .s3 import s3Client
from django.core.files.uploadedfile import InMemoryUploadedFile, TemporaryUploadedFile
from PIL import Image
from django.contrib.auth.models import User

s3_client = s3Client()

FILES_KINDS = ['gyms', 'classes', 'workouts', "names", 'users']


def is_gymclass_member(user, gym_class):
    return user and gym_class and gym_class.classmembers_set.filter(
        user_id=user.id).exists()


def is_gymclass_coach(user, gym_class):
    return user and gym_class and gym_class.coaches_set.filter(
        user_id=user.id).exists()


def is_gym_class_owner(user, gym_class):
    return user and gym_class and str(user.id) == str(gym_class.gym.owner_id)


def is_gym_owner(user, gym_id):
    if not user or not gym_id:
        return False
    try:
        gym = Gyms.objects.get(id=gym_id)
        return str(gym.owner_id) == str(user.id)
    except Exception as e:
        print("Not gym owner: ", e, f'id: {gym_id}')
    return False


def upload_media(files, parent_id, file_kind, start_id=0):
    names = []
    last_idx = start_id
    for file in files:
        tmp_name = f"{last_idx}.{file.name[-3:]}"
        if s3_client.upload(file, file_kind, parent_id, tmp_name):
            # If successful upload, inc index for file
            last_idx += 1
            names.append(tmp_name)
    return names


def delete_media(parent_id, remove_media_ids, file_kind):
    removed = {}
    for id in remove_media_ids:
        if s3_client.remove(file_kind, parent_id, id):
            removed[id] = ""
    return removed


def jbool(val: str) -> bool:
    return True if val == "true" else False


class GymPermission(BasePermission):
    message = "Only Gym owners can create or remove classes"

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            # Check permissions for read-only request
            return True
        elif request.method == "POST":
            return True
        elif request.method == "DELETE":
            print("GymClass perm view: ", )
            gym_id = view.kwargs['pk']
            return is_gym_owner(request.user, gym_id)
        return False


class GymClassPermission(BasePermission):
    message = "Only Gym owners can create or remove classes"

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            # Check permissions for read-only request
            return True
        elif request.method == "POST":
            return is_gym_owner(
                request.user,
                request.data.get("gym")
            )
        elif request.method == "DELETE":
            print("GymClass perm view: ", )
            gym_class_id = view.kwargs['pk']
            return is_gym_class_owner(request.user, GymClasses.objects.get(id=gym_class_id))
        return False


class WorkoutPermission(BasePermission):
    message = """Only users can create workouts for themselves or
                for a class they own or are a coach of."""

    def has_permission(self, request, view):
        # Need to check group id to see if the user has permission to do stuff.

        if request.method in SAFE_METHODS:
            return True
        elif request.method == "POST" and view.action == "create":
            group_id = request.data.get("group", 0)
            if not group_id:
                return Response("Error finding group id")

            workout_group: WorkoutGroups = WorkoutGroups.objects.get(
                id=group_id)
            owner_id = workout_group.owner_id
            print("Checking perm for: ", not workout_group.owned_by_class,
                  type(owner_id), type(request.user.id))

            if workout_group.owned_by_class:
                gym_class = GymClasses.objects.get(id=owner_id)
                return is_gym_owner(request.user, gym_class.gym.id) or is_gymclass_coach(request.user, gym_class)
            return not workout_group.owned_by_class and str(owner_id) == str(request.user.id)
        elif request.method == "DELETE" or request.method == "PATCH":
            workout_id = view.kwargs['pk']
            workout = Workouts.objects.get(id=workout_id)
            workout_group_id = workout.group.id
            workout_group = WorkoutGroups.objects.get(id=workout_group_id)
            owned_by_class = workout_group.owned_by_class

            print("Delete workout ", workout_id, owned_by_class,
                  request.user.id, workout_group.owner_id)
            if owned_by_class:
                gym_class = GymClasses.objects.get(id=workout_group.owner_id)
                return is_gym_owner(request.user, gym_class.gym.id) or is_gymclass_coach(request.user, gym_class)
            else:
                return not owned_by_class and str(request.user.id) == str(workout_group.owner_id)


class WorkoutGroupsPermission(BasePermission):
    message = """Only users can create workouts for themselves or
                for a class they own or are a coach of."""

    def has_permission(self, request, view):

        if request.method in SAFE_METHODS:
            # Check permissions for read-only request
            return True
        elif request.method == "POST":
            if jbool(request.data.get("owned_by_class")):
                # Verify user is owner or coach of class
                gym_class = GymClasses.objects.get(
                    id=request.data.get("owner_id"))
                print("Checking wg perm for class: ", is_gym_owner(
                    request.user, gym_class.gym.id) or is_gymclass_coach(request.user, gym_class))
                return is_gym_owner(request.user, gym_class.gym.id) or is_gymclass_coach(request.user, gym_class)

            return not jbool(request.data.get("owned_by_class"))

        elif request.method == "DELETE" or request.method == "PATCH":
            # If owned_by_class
            workout_group_id = view.kwargs['pk']
            workout_group = WorkoutGroups.objects.get(id=workout_group_id)
            owned_by_class = workout_group.owned_by_class
            if owned_by_class:
                gym_class = GymClasses.objects.get(id=workout_group.owner_id)
                return is_gym_owner(request.user, gym_class.gym.id) or is_gymclass_coach(request.user, gym_class)
            else:
                return not owned_by_class and request.user.id == workout_group.owner_id

        return False


class EditWorkoutMediaPermission(BasePermission):
    message = """Only users can edit workouts for themselves or
                for a class they own or are a coach of."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            # Check permissions for read-only request
            return True
        elif request.method == "POST" or request.method == "DELETE":
            workout_id = view.kwargs['pk']
            workout = Workouts.objects.get(id=workout_id)
            if workout.owned_by_class:
                gym_class = GymClasses.objects.get(id=workout.owner_id)
                return is_gym_class_owner(request.user, gym_class) or is_gymclass_coach(request.user, gym_class)
            else:
                return request.user.id == workout.owner_id

        return False


class CreateWorkoutItemsPermission(BasePermission):
    message = """Only users can create workout Items for themselves or
                for a class they own or are a coach of."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            # Check permissions for read-only request
            return True

        elif request.method == "POST":
            workout_id = request.data.get("workout", "0")
            if not workout_id == "0":
                workout, workout_group = None, None
                try:
                    workout = Workouts.objects.get(id=workout_id)
                    workout_group = WorkoutGroups.objects.get(id)
                except Exception as e:
                    print(e)
                    return Response("Workout not found")
                if not workout or not workout_group:
                    return Response("Failed to get workout information.")

                owner_id = workout_group.owner_id
                owned_by_class = workout_group.owned_by_class
                print("Creating workout items: owner_id, owned_by_class",
                      owner_id, owned_by_class)
                # TODO() microservice hit other service to validate ownership
                if owned_by_class:
                    # Verify user is owner or coach of class.
                    gym_class = GymClasses.objects.get(
                        id=owner_id)
                    print(gym_class, is_gymclass_coach(request.user, gym_class),
                          is_gym_class_owner(request.user, gym_class))
                    return is_gymclass_coach(request.user, gym_class) or is_gym_class_owner(request.user, gym_class)
                else:
                    return request.user.id == owner_id

        return False


class RemoveClassMemberPermission(BasePermission):
    message = """Only coaches and gym owners can remove classmembers."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            # Check permissions for read-only request
            return True

        elif request.method == "DELETE":
            gym_class_id = request.data.get("gym_class", "0")
            gym_class = GymClasses.objects.get(id=gym_class_id)
            return is_gym_class_owner(request.user, gym_class) or is_gymclass_coach(request.user, gym_class)

        return False


class RemoveCoachPermission(BasePermission):
    message = """Only gym owners can remove coaches."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            # Check permissions for read-only request
            return True

        elif request.method == "DELETE":
            gym_class_id = request.data.get("gym_class", "0")
            gym_class: GymClasses = GymClasses.objects.get(id=gym_class_id)
            is_owner = is_gym_class_owner(request.user, gym_class)
            print("User can remove coach /  is owner: ",
                  is_owner, request.user.id, gym_class.gym.owner_id)
            return is_owner

        return False


class SelfActionPermission(BasePermission):
    message = """Only users can perform actions for themselves."""

    def has_permission(self, request, view):
        print("Self perm: ", request.data.get("user_id"), request.user.id)
        return str(request.data.get("user_id")) == str(request.user.id)


def convert_file_to_inmem(file_str, name, type):
    return InMemoryUploadedFile(bytes(file_str, "UTF-8"),
                                'ImageField',
                                name + ".jpeg",
                                type,
                                sys.getsizeof(file_str), None)


class DestroyWithPayloadMixin(object):
    def destroy(self, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        super().destroy(*args, **kwargs)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GymViewSet(DestroyWithPayloadMixin, viewsets.ModelViewSet, GymPermission):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Gyms.objects.all()
    serializer_class = GymSerializer
    permission_classes = [GymPermission]

    parser_classes = [MultiPartParser, FileUploadParser]

    def create(self, request):
        try:
            data = request.data.copy().dict()
            print(request.FILES, request.data)
            main = request.data.get("main")
            logo = request.data.get("logo")

            data['owner_id'] = request.user.id
            del data['main']
            del data['logo']
            print("main", type(main), dir(main))

            gym, newly_created = Gyms.objects.get_or_create(**data)
            if not newly_created:
                return Response("Gym already created. Must delete and reupload w/ media or edit gym.")

            parent_id = gym.id
            if main:
                main_uploaded = s3_client.upload(
                    main, FILES_KINDS[0], parent_id, "main")
                if not main_uploaded:
                    return Response("Failed to upload main image")
            if logo != '':
                logo_uploaded = s3_client.upload(
                    logo, FILES_KINDS[0], parent_id, "logo")
                if not logo_uploaded:
                    return Response("Failed to upload logo")

            return Response(GymSerializer(gym).data)
        except Exception as e:
            print(e)
            return Response("Failed to create workout")

    @action(detail=True, methods=['get'], permission_classes=[])
    def user_favorites(self, request, pk=None):
        try:
            user_id = pk
            return Response(GymFavoritesSerializer(GymFavorites.objects.filter(user_id=user_id), many=True).data)
        except Exception as e:
            print(e)
            return Response("Failed get user's favorite gyms.")

    @action(detail=False, methods=['post'], permission_classes=[])
    def favorite(self, request, pk=None):
        try:
            user_id = request.user.id
            gym_id = request.data.get("gym")

            GymFavorites.objects.create(
                user_id=user_id, gym=Gyms.objects.get(id=gym_id))
            return Response("Favorited!")
        except Exception as e:
            print(e)
            return Response("Failed to favorite")

    @action(detail=False, methods=['DELETE'], permission_classes=[])
    def unfavorite(self, request, pk=None):
        try:
            user_id = request.user.id
            gym_id = request.data.get("gym")
            GymFavorites.objects.get(user_id=user_id, gym=gym_id).delete()
            return Response("Unfavorited!")
        except Exception as e:
            return Response("Failed to unfavorite")

    @action(detail=True, methods=['get'], permission_classes=[])
    def gymsclasses(self, request, pk=None):
        # Choose serilizer per entry if the user should view it or not....
        try:
            gym = self.queryset.get(id=pk)
            '''
                This returns a gym with all classes.... The classes should be able to be viewed but not the workouts or class members....
            '''
            return Response(GymSerializer(gym).data)
        except Exception as e:
            print(e)
        return Response({})

    @action(detail=True, methods=['PATCH'], permission_classes=[])
    def edit_media(self, request, pk=None):
        # try:
        gym_id = pk
        main_file = request.data.get("main", None)
        logo_file = request.data.get("logo", None)

        gym = Gyms.objects.get(id=gym_id)

        parent_id = gym.id
        if main_file:
            s3_client.upload(
                main_file, FILES_KINDS[0], parent_id, "main")
        if logo_file:
            s3_client.upload(
                logo_file, FILES_KINDS[0], parent_id, "logo")

        return Response("Successfully added media to gym.")

        # except Exception as e:
        #     print(e)
        #     return Response("Failed to add media to workout")

    @action(detail=False, methods=['GET'], permission_classes=[])
    def user_gyms(self, request, pk=None):
        user_id = request.user.id
        if not user_id:
            return Response({'error': 'user not found'})

        gyms = Gyms.objects.filter(owner_id=user_id)
        return Response(GymSerializerWithoutClasses(gyms, many=True).data)

    def get_serializer_class(self):
        if self.action == 'list':
            return GymSerializerWithoutClasses
        return GymSerializer


class GymClassViewSet(DestroyWithPayloadMixin, viewsets.ModelViewSet, GymClassPermission):
    permission_classes = [GymClassPermission]
    queryset = GymClasses.objects.all().select_related('gym')

    def create(self, request):
        try:
            data = request.data.copy().dict()
            main = request.data.get("main")
            logo = request.data.get("logo")
            del data['main']
            del data['logo']

            data['private'] = jbool(data['private'])
            gym = Gyms.objects.get(id=data.get('gym'))
            gym_class, newly_created = GymClasses.objects.get_or_create(
                **{**data, "gym": gym})
            if not newly_created:
                return Response("Gym class already created. Must delete and reupload w/ media or edit gym class.")

            parent_id = gym_class.id
            s3_client.upload(main, FILES_KINDS[1], parent_id, "main")
            s3_client.upload(logo, FILES_KINDS[1], parent_id, "logo")

            return Response(GymClassCreateSerializer(gym_class).data)
        except Exception as e:
            print(e)
            return Response("Failed to create gymclass")

    @action(detail=True, methods=['get'], permission_classes=[])
    def user_favorites(self, request, pk=None):
        try:
            user_id = pk
            return Response(GymClassFavoritesSerializer(GymClassFavorites.objects.filter(user_id=user_id), many=True).data)
        except Exception as e:
            print(e)
            return Response("Failed get user's favorite gym classes.")

    @action(detail=False, methods=['post'], permission_classes=[])
    def favorite(self, request, pk=None):
        try:
            user_id = request.user.id
            gym_class_id = request.data.get("gym_class")
            GymClassFavorites.objects.create(
                user_id=user_id, gym_class=GymClasses.objects.get(id=gym_class_id))
            return Response("Favorited!")
        except Exception as e:
            print(e)
            return Response("Failed to favorite")

    @action(detail=False, methods=['DELETE'], permission_classes=[])
    def unfavorite(self, request, pk=None):
        try:
            user_id = request.user.id
            gym_class_id = request.data.get("gym_class")
            GymClassFavorites.objects.get(
                user_id=user_id, gym_class=GymClasses.objects.get(id=gym_class_id)).delete()
            return Response("Unfavorited!")
        except Exception as e:
            return Response("Failed to unfavorite")

    @action(detail=True, methods=['get'], permission_classes=[])
    def workouts(self, request, pk=None):
        '''
            GymClass view, gets all related data for a GymClass.
        '''
        gym_class = None
        try:
            gym_class: GymClasses = self.queryset.get(id=pk)
        except Exception as e:
            print(e)
            return Response("Invalid class")
        workouts = []  # Empty queryset

        print(is_gymclass_member(request.user, gym_class),
              is_gymclass_coach(request.user, gym_class),
              is_gym_owner(request.user, gym_class.gym.id))
        # If user is member or coach, they can see workouts from class...
        if (not gym_class.private or
            is_gymclass_member(request.user, gym_class) or
            is_gymclass_coach(request.user, gym_class) or
                is_gym_owner(request.user, gym_class.gym.id)):
            # Microservice TODO('Make request to workouts service')

            workout_groups = WorkoutGroups.objects.filter(
                owner_id=pk, owned_by_class=True)

        # Return from Microservice

        gym_class.workoutgroups_set = workout_groups
        # TODO add attr userCanEdit?: boolean;
        user_is_gym_owner = is_gym_owner(request.user, gym_class.gym.id)
        user_is_coach = is_gymclass_coach(request.user, gym_class)
        user_can_edit = user_is_gym_owner or user_is_coach

        print(f"User can edit {user_can_edit}")

        return Response({
            **GymClassSerializerWithWorkouts(gym_class).data,
            "user_can_edit": user_can_edit,
            "user_is_gym_owner": user_is_gym_owner,
            "user_is_coach": user_is_coach,
        })

    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'retrieve':
            return GymClassSerializer
        if self.action == 'create':
            return GymClassCreateSerializer
        return GymClassSerializer

    @action(detail=True, methods=['PATCH'], permission_classes=[])
    def edit_media(self, request, pk=None):
        # try:
        gym_class_id = pk
        main_file = request.data.get("main", None)
        logo_file = request.data.get("logo", None)

        gym_class = GymClasses.objects.get(id=gym_class_id)

        parent_id = gym_class.id
        if main_file:
            s3_client.upload(
                main_file, FILES_KINDS[1], parent_id, "main")
        if logo_file:
            s3_client.upload(
                logo_file, FILES_KINDS[1], parent_id, "logo")

        return Response("Successfully added media to gym class.")

        # except Exception as e:
        #     print(e)
        #     return Response("Failed to add media to workout")


class WorkoutGroupsViewSet(DestroyWithPayloadMixin, viewsets.ModelViewSet, WorkoutGroupsPermission):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Workouts.objects.all()
    serializer_class = WorkoutSerializer
    permission_classes = [WorkoutGroupsPermission]

    # TODO Create and manage media/ likes for the Group Workout instead of Workout......
    # User will interat with Group workout and can add multiple workouts to it.

    def create(self, request):
        # try:
        data = {**request.data.dict()}
        files = request.data.getlist("files", [])
        del data['files']

        # Models expects True/ False, coming from json, we get true/ false. Instead we store 0,1 and convert
        data['owned_by_class'] = jbool(data['owned_by_class'])
        if not data['owned_by_class']:
            data['owner_id'] = request.user.id

        workout_group, newly_created = WorkoutGroups.objects.get_or_create(
            **{**data, 'media_ids': []})
        if not newly_created:
            return Response("Workout already create. Must delete and reupload w/ media or edit workout.")

        parent_id = workout_group.id
        uploaded_names = upload_media(files, parent_id, FILES_KINDS[2])
        workout_group.media_ids = json.dumps([n for n in uploaded_names])
        workout_group.save()
        return Response(WorkoutGroupsSerializer(workout_group).data)
        # except Exception as e:
        #     print(e)
        #     return Response("Failed to create workout")

    def last_id_from_media(self, cur_media_ids: List[str]) -> int:
        last_id = 0
        if not cur_media_ids:
            return last_id

        # Items shoudl remain in order but we will ensure by sorting.
        # This should have little impact when limiting each workout to 5-7 posts.
        media_ids = sorted(cur_media_ids, key=lambda p: p.split(".")[0])
        last_media_id = media_ids[-1]
        return int(last_media_id.split(".")[0])

    @action(detail=True, methods=['post'], permission_classes=[EditWorkoutMediaPermission])
    def add_media_to_workout(self, request, pk=None):
        # try:
        workout_group_id = pk
        files = request.data.getlist("files")

        workout_group = WorkoutGroups.objects.get(id=workout_group_id)
        cur_media_ids = sorted(json.loads(workout_group.media_ids))

        last_id = self.last_id_from_media(cur_media_ids)

        print("Last id: ", last_id)
        uploaded_names = upload_media(
            files, workout_group.id, FILES_KINDS[2], start=last_id + 1)
        print("Num uploaded: ", uploaded_names)

        print("Cur media ids: ", cur_media_ids)
        cur_media_ids.extend(uploaded_names)

        print("Updated Cur media ids: ", cur_media_ids)
        workout_group.media_ids = json.dumps(cur_media_ids)
        workout_group.save()
        return Response("Successfully added media to workout")

        # except Exception as e:
        #     print(e)
        #     return Response("Failed to add media to workout")

    @action(detail=True, methods=['delete'], permission_classes=[EditWorkoutMediaPermission])
    def remove_media_from_workout(self, request, pk=None):
        try:
            workout_group_id = pk
            remove_media_ids = json.loads(request.data.get("media_ids"))
            workout_group = Workouts.objects.get(id=workout_group_id)
            cur_media_ids = sorted(json.loads(workout_group.media_ids))
            deleted_ids = delete_media(
                workout_group.id, remove_media_ids, FILES_KINDS[2])

            cur_media_ids = list(
                filter(lambda n: not str(n) in deleted_ids, cur_media_ids))
            print("Filtered Current media ids: ", cur_media_ids)
            workout_group.media_ids = json.dumps(cur_media_ids)
            workout_group.save()
            return Response("Deleted")
        except Exception as e:
            print(e)
            return Response("Failed to remove media")

    @ action(detail=False, methods=['get'], permission_classes=[])
    def user_workouts(self, request, pk=None):
        try:
            owner_id = request.user.id
            workout_groups: WorkoutGroups = WorkoutGroups.objects.get(
                owner_id=owner_id, owned_by_class=False)
            # // Workout group is single group with multiple workouts
            return Response(WorkoutGroupsSerializer(workout_groups).data)
        except Exception as e:
            print(e)
            return Response("Failed get user's workouts.")

    @ action(detail=True, methods=['get'], permission_classes=[])
    def class_workouts(self, request, pk=None):
        ''' Returns all workouts for a gym.
        '''
        try:
            workout_group_id = pk
            return Response(WorkoutGroupsSerializer(WorkoutGroups.objects.get(id=workout_group_id)).data)
        except Exception as e:
            print(e)
            return Response("Failed get Gym class's workouts.")

    @ action(detail=False, methods=['post'], permission_classes=[SelfActionPermission])
    def favorite(self, request, pk=None):
        try:
            user_id = request.data.get("user_id")
            workout_id = request.data.get("workout")
            LikedWorkouts.objects.create(
                user_id=user_id, workout=workout_id)
            return Response("Favorited!")
        except Exception as e:
            return Response("Failed to favorite")

    @ action(detail=False, methods=['DELETE'], permission_classes=[SelfActionPermission])
    def unfavorite(self, request, pk=None):
        try:
            user_id = request.data.get("user_id")
            workout_id = request.data.get("workout")
            LikedWorkouts.objects.get(
                user_id=user_id, workout=workout_id).delete()
            return Response("Unfavorited!")
        except Exception as e:
            return Response("Failed to unfavorite")


class WorkoutsViewSet(viewsets.ModelViewSet, WorkoutPermission):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Workouts.objects.all()
    serializer_class = WorkoutSerializer
    permission_classes = [WorkoutPermission]

    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'retrieve':
            return WorkoutSerializer
        if self.action == 'create':
            return WorkoutCreateSerializer
        return WorkoutSerializer


class WorkoutItemsViewSet(viewsets.ModelViewSet, CreateWorkoutItemsPermission):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = WorkoutItems.objects.all()

    @ action(detail=False, methods=['post'], permission_classes=[CreateWorkoutItemsPermission])
    def items(self, request, pk=None):
        try:
            workout_items = json.loads(request.data.get("items"))
            workout_id = request.data.get("workout")
            workout = Workouts.objects.get(id=workout_id)

            if not workout:
                # TODO() Throw error?
                return Response("Workout not found")

            print('Items', workout_items)
            print('Workout ID:', workout_id)

            items = []
            for w in workout_items:
                del w['id']
                del w['workout']
                items.append(WorkoutItems(
                    **{**w, "workout": Workouts(id=workout_id), "name": WorkoutNames(id=w['name']['id'])}))

            return Response(WorkoutItemSerializer(WorkoutItems.objects.bulk_create(items), many=True).data)
        except Exception as e:
            print(e)
            return Response("Failed to insert")

    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'retrieve':
            return WorkoutItemSerializer
        if self.action == 'create':
            return WorkoutItemCreateSerializer
        return WorkoutItemSerializer


# TODO() add admin only permission.
class WorkoutNamesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = WorkoutNames.objects.all()
    serializer_class = WorkoutNamesSerializer

    def create(self, request):
        # try:
        data = request.data.copy().dict()
        files = request.data.getlist("files", [])
        categories = json.loads(data['categories'])
        primary = data['primary']
        secondary = data['secondary']
        del data['files']
        del data['categories']
        del data['primary']
        del data['secondary']

        # Models expects True/ False, coming from json, we get true/ false. Instead we store 0,1 and convert

        # TODO Add workoutCategories.
        workoutCategories = WorkoutCategories.objects.filter(id__in=categories)
        if primary:
            data['primary'] = WorkoutCategories.objects.get(id=primary)
        if secondary:
            data['secondary'] = WorkoutCategories.objects.get(id=secondary)

        workout_name, newly_created = WorkoutNames.objects.get_or_create(
            **{
                **data,
                'media_ids': [],
            })

        if not newly_created:
            return Response("Workout name already create. Must delete and reupload w/ media or edit workout name.")

        [workout_name.categories.add(c) for c in workoutCategories]
        workout_name.save()

        parent_id = workout_name.id
        uploaded_names = upload_media(files, parent_id, FILES_KINDS[3])
        workout_name.media_ids = json.dumps([n for n in uploaded_names])
        workout_name.save()

        return Response(WorkoutNamesSerializer(workout_name).data)
        # except Exception as e:
        #     print(e)
        #     return Response("Failed to create workout")

    @action(detail=True, methods=['post'], permission_classes=[])
    def add_media_to_workout_name(self, request, pk=None):
        # try:
        workout_id = pk
        files = request.data.getlist("files")

        workout = WorkoutNames.objects.get(id=workout_id)
        cur_media_ids = sorted(json.loads(workout.media_ids))

        last_id = self.last_id_from_media(cur_media_ids)

        print("Last id: ", last_id)
        uploaded_names = upload_media(
            files, workout.id, FILES_KINDS[3], start=last_id + 1)
        print("Num uploaded: ", uploaded_names)

        print("Cur media ids: ", cur_media_ids)
        cur_media_ids.extend(uploaded_names)

        print("Updated Cur media ids: ", cur_media_ids)
        workout.media_ids = json.dumps(cur_media_ids)
        workout.save()
        return Response("Successfully added media to workout")

        # except Exception as e:
        #     print(e)
        #     return Response("Failed to add media to workout")

    @action(detail=True, methods=['delete'], permission_classes=[])
    def remove_media_from_workout_name(self, request, pk=None):
        try:
            workout_id = pk
            remove_media_ids = json.loads(request.data.get("media_ids"))
            workout = WorkoutNames.objects.get(id=workout_id)
            cur_media_ids = sorted(json.loads(workout.media_ids))
            deleted_ids = delete_media(
                workout.id, remove_media_ids, FILES_KINDS[3])

            cur_media_ids = list(
                filter(lambda n: not str(n) in deleted_ids, cur_media_ids))
            print("Filtered Current media ids: ", cur_media_ids)
            workout.media_ids = json.dumps(cur_media_ids)
            workout.save()
            return Response("Deleted")
        except Exception as e:
            print(e)
            return Response("Failed to remove media")


class WorkoutCategoriesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = WorkoutNames.objects.all()
    serializer_class = WorkoutCategorySerializer


class CoachesViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Coaches.objects.all()

    @ action(detail=True, methods=['GET'], permission_classes=[])
    def coaches(self, request, pk=None):
        '''Gets all coaches for a class. '''
        coaches: List[Coaches] = Coaches.objects.filter(gym_class__id=pk)
        ids = [c.user_id for c in coaches]
        print("Coach ids: ", ids)

        users = User.objects.filter(id__in=ids)
        # return Response(CoachesSerializer(coaches, many=True).data)
        return Response(UserWithoutEmailSerializer(users, many=True).data)

    @ action(detail=False, methods=['DELETE'], permission_classes=[RemoveCoachPermission])
    def remove(self, request, pk=None):
        try:
            remove_user_id = request.data.get("user_id", "0")
            gym_class_id = request.data.get("gym_class", "0")
            coach = Coaches.objects.get(
                user_id=remove_user_id, gym_class__id=gym_class_id)
            coach.delete()
        except Exception as e:
            print(e)
            return Response("Failed to remove coach")

        return Response("Testing")

    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'retrieve':
            return CoachesSerializer
        if self.action == 'create':
            return CoachesCreateSerializer
        return CoachesSerializer


class ClassMembersViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    Permissions:

    """
    queryset = ClassMembers.objects.all()

    @ action(detail=True, methods=['GET'], permission_classes=[])
    def members(self, request, pk=None):
        '''Gets all members for a class. '''
        members: List[ClassMembers] = ClassMembers.objects.filter(
            gym_class__id=pk)
        ids = [c.user_id for c in members]
        print("Coach ids: ", ids)

        users = User.objects.filter(id__in=ids)
        # return Response(CoachesSerializer(coaches, many=True).data)
        return Response(UserWithoutEmailSerializer(users, many=True).data)

    @ action(detail=False, methods=['DELETE'], permission_classes=[RemoveClassMemberPermission])
    def remove(self, request, pk=None):
        try:
            remove_user_id = request.data.get("user_id", "0")
            gym_class_id = request.data.get("gym_class", "0")
            class_member = ClassMembers.objects.get(
                user_id=remove_user_id, gym_class__id=gym_class_id)
            class_member.delete()
        except Exception as e:
            print(e)
            return Response("Failed to remove class member")

        return Response("Testing")

    def get_serializer_class(self):
        if self.action == 'list' or self.action == 'retrieve':
            return ClassMembersSerializer
        if self.action == 'create':
            return ClassMembersCreateSerializer
        return ClassMembersSerializer


class BodyMeasurementsViewSet(viewsets.ModelViewSet, SelfActionPermission):
    """
    API endpoint that allows users to be viewed or edited.
    Permissions:

    """
    queryset = BodyMeasurements.objects.all()
    permission_classes = [SelfActionPermission]


class ProfileViewSet(viewsets.ViewSet):

    @ action(detail=False, methods=['GET'], permission_classes=[])
    def profile(self, request, pk=None):
        print(request.user)
        user_id = request.user.id
        # Need to gather
        # User info
        # Workouts created by user, FUTURE workouts completed by user.
        # Summary of workout load
        profile_data = dict()
        workout_groups = WorkoutGroups.objects.filter(
            owner_id=user_id, owned_by_class=False)
        profile_data['user'] = request.user
        profile_data['workout_groups'] = WorkoutGroups.objects.filter(
            owner_id=user_id, owned_by_class=False)
        profile_data['favorite_gyms'] = GymFavorites.objects.filter(
            user_id=user_id)
        profile_data['favorite_gym_classes'] = GymClassFavorites.objects.filter(
            user_id=user_id)
        profile_data['measurements'] = BodyMeasurements.objects.filter(
            user_id=user_id)

        return Response(ProfileSerializer(profile_data).data)
