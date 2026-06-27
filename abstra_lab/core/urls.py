from django.urls import path

from . import views

app_name = 'core'

urlpatterns = [
    path('', views.home, name='home'),
    path('robots.txt', views.robots_txt, name='robots_txt'),
    path('sitemap.xml', views.sitemap_xml, name='sitemap_xml'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('dashboard/members/<int:user_id>/edit/', views.member_edit, name='member_edit'),
    path('dashboard/members/<int:user_id>/approve/', views.approve_member, name='approve_member'),
    path('dashboard/members/<int:user_id>/ban/', views.ban_member, name='ban_member'),
    path('dashboard/members/<int:user_id>/unban/', views.unban_member, name='unban_member'),
    path('dashboard/events/new/', views.event_create, name='event_create'),
    path('dashboard/events/<int:event_id>/edit/', views.event_edit, name='event_edit'),
    path('dashboard/events/<int:event_id>/delete/', views.event_delete, name='event_delete'),
    path('dashboard/posts/new/', views.blog_create, name='blog_create'),
    path('dashboard/posts/<slug:slug>/edit/', views.blog_edit, name='blog_edit'),
    path('dashboard/posts/<slug:slug>/delete/', views.blog_delete, name='blog_delete'),
    path('dashboard/materials/new/', views.material_create, name='material_create'),
    path('dashboard/materials/<int:material_id>/edit/', views.material_edit, name='material_edit'),
    path('dashboard/materials/<int:material_id>/delete/', views.material_delete, name='material_delete'),
    path('dashboard/library/folders/new/', views.library_folder_create, name='library_folder_create'),
    path('dashboard/library/new/', views.library_create, name='library_create'),
    path('dashboard/library/<int:asset_id>/edit/', views.library_edit, name='library_edit'),
    path('dashboard/library/<int:asset_id>/delete/', views.library_delete, name='library_delete'),
    path('library/files/<int:asset_id>/', views.library_download, name='library_download'),
    path('about/', views.about, name='about'),
    path('work/', views.work, name='work'),
    path('pioneer/', views.work, name='pioneer'),
    path('members/', views.members, name='members'),
    path('projects/', views.projects, name='projects'),
    path('events/', views.events, name='events'),
    path('posts/', views.posts_list, name='posts_list'),
    path('posts/<slug:slug>/', views.post_detail, name='post_detail'),
    path('join/', views.join, name='join'),
    path('sponsor/', views.sponsor, name='sponsor'),
    path('discord/', views.discord, name='discord'),

]
