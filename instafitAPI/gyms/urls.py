from django.urls import include, path
from rest_framework import routers
from gyms import views

router = routers.DefaultRouter()
router.register(r'gyms', views.GymViewSet)
router.register(r'gymClasses', views.GymClassViewSet)
router.register(r'workoutGroups', views.WorkoutGroupsViewSet)
router.register(r'workouts', views.WorkoutsViewSet)
router.register(r'workoutNames', views.WorkoutNamesViewSet)
router.register(r'workoutCategories', views.WorkoutCategoriesViewSet)
router.register(r'workoutItems', views.WorkoutItemsViewSet)
router.register(r'coaches', views.CoachesViewSet)
router.register(r'classMembers', views.ClassMembersViewSet)
router.register(r'bodyMeasurements', views.BodyMeasurementsViewSet)
router.register(r'profile', views.ProfileViewSet, basename='profile')


# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
    path('', include(router.urls)),

]
