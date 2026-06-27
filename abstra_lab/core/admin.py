from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from .models import BlogPost, BuildMaterial, ClubEvent, LibraryAsset, LibraryFolder


@admin.action(description='Approve selected accounts (allow sign-in)')
def approve_accounts(modeladmin, request, queryset):
    queryset.update(is_active=True)


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'published', 'created_at']
    list_filter = ['published', 'author']
    search_fields = ['title', 'excerpt', 'content']
    prepopulated_fields = {'slug': ['title']}


@admin.register(LibraryFolder)
class LibraryFolderAdmin(admin.ModelAdmin):
    list_display = ['name', 'sort_order', 'created_at']
    search_fields = ['name']


@admin.register(LibraryAsset)
class LibraryAssetAdmin(admin.ModelAdmin):
    list_display = ['title', 'kind', 'folder', 'published', 'created_at']
    list_filter = ['kind', 'folder', 'published']
    search_fields = ['title', 'description', 'folder']


@admin.register(BuildMaterial)
class BuildMaterialAdmin(admin.ModelAdmin):
    list_display = ['name', 'material_type', 'published', 'sort_order', 'created_at']
    list_filter = ['material_type', 'published']
    search_fields = ['name', 'summary', 'used_for', 'access']


@admin.register(ClubEvent)
class ClubEventAdmin(admin.ModelAdmin):
    list_display = ['title', 'date_label', 'published', 'starts_at', 'created_at']
    list_filter = ['published']
    search_fields = ['title', 'summary', 'description', 'location']
    prepopulated_fields = {'slug': ['title']}


class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'groups', 'date_joined']
    actions = [approve_accounts, *BaseUserAdmin.actions]


admin.site.unregister(User)
admin.site.register(User, UserAdmin)