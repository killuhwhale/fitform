from importlib.metadata import requires
from rest_framework import serializers
from gyms.models import BodyMeasurements, GymClassFavorites, ClassMembers, Coaches, Gyms, GymClasses, GymFavorites, LikedWorkouts, WorkoutCategories, Workouts, WorkoutItems, WorkoutNames, WorkoutGroups


class Gym_ClassSerializer(serializers.ModelSerializer):
    ''' Searilzier gym_class for gym list. Avoid circular dependency'''
    class Meta:
        model = GymClasses
        fields = '__all__'


class GymSerializer(serializers.ModelSerializer):
    # Adding this made me unable to create a gym without add gym_classes
    gym_classes = Gym_ClassSerializer(
        source="gymclasses_set", many=True, required=False)

    class Meta:
        model = Gyms
        fields = '__all__'


class GymSerializerWithoutClasses(serializers.ModelSerializer):
    # Adding this made me unable to create a gym without add gym_classes

    class Meta:
        model = Gyms
        fields = '__all__'


class GymClassSerializer(serializers.ModelSerializer):
    ''' Serialize gym_class for gym_class list.'''
    gym = GymSerializerWithoutClasses(required=False)

    class Meta:
        model = GymClasses
        fields = '__all__'


class GymClassCreateSerializer(serializers.ModelSerializer):
    ''' Serialize gym_class for gym_class list.'''

    class Meta:
        model = GymClasses
        fields = '__all__'


class WorkoutNamesSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutNames
        fields = '__all__'


class WorkoutItemSerializer(serializers.ModelSerializer):
    name = WorkoutNamesSerializer()

    class Meta:
        model = WorkoutItems
        fields = '__all__'


class WorkoutItemCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkoutItems
        fields = '__all__'


# class WorkoutMediaSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = WorkoutMedia
#         fields = '__all__'

class WorkoutCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutCategories
        fields = '__all__'


class WorkoutSerializer(serializers.ModelSerializer):
    workout_items = WorkoutItemSerializer(
        source='workoutitems_set',  many=True, required=False)

    class Meta:
        model = Workouts
        exclude = ('group', )
        depth = 2


class WorkoutGroupsSerializer(serializers.ModelSerializer):
    workouts = WorkoutSerializer(
        source="workouts_set", many=True, required=False)

    class Meta:
        model = WorkoutGroups
        fields = '__all__'
        depth = 2


class WorkoutGroupsCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = WorkoutGroups
        fields = '__all__'


class WorkoutCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Workouts
        fields = '__all__'


class GymClassSerializerWithWorkouts(serializers.ModelSerializer):
    ''' Serialize Class with its workouts.'''
    workout_groups = WorkoutGroupsCreateSerializer(
        source="workoutgroups_set", many=True, required=False)

    class Meta:
        model = GymClasses
        fields = '__all__'


class CoachesSerializer(serializers.ModelSerializer):
    gym_class = GymClassSerializer(required=False)

    class Meta:
        model = Coaches
        fields = '__all__'


class CoachesCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Coaches
        fields = '__all__'


class ClassMembersSerializer(serializers.ModelSerializer):
    gym_class = GymClassSerializer(required=False)

    class Meta:
        model = ClassMembers
        fields = '__all__'


class ClassMembersCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model = ClassMembers
        fields = '__all__'


class GymClassFavoritesSerializer(serializers.ModelSerializer):
    gym_class = GymClassSerializer()

    class Meta:
        model = GymClassFavorites
        fields = '__all__'


class GymFavoritesSerializer(serializers.ModelSerializer):
    gym = GymSerializerWithoutClasses()

    class Meta:
        model = GymFavorites
        fields = '__all__'


class LikedWorkoutsSerializer(serializers.ModelSerializer):
    workout = WorkoutSerializer()

    class Meta:
        model = LikedWorkouts
        fields = '__all__'


class BodyMeasurementsSerializer(serializers.ModelSerializer):

    class Meta:
        model = BodyMeasurements
        fields = '__all__'


class UserSerializer(serializers.Serializer):
    username = serializers.CharField()
    email = serializers.CharField()
    id = serializers.IntegerField()


class ProfileSerializer(serializers.Serializer):
    user = UserSerializer()
    workout_groups = WorkoutGroupsSerializer(many=True, required=False)
    favorite_gyms = GymFavoritesSerializer(many=True, required=False)
    favorite_gym_classes = GymClassFavoritesSerializer(
        many=True, required=False)
    measurements = BodyMeasurementsSerializer(many=True, required=False)
