from allauth.account.forms import LoginForm, SignupForm
from datetime import datetime, time
from pathlib import Path

from django import forms
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone

from .member_accounts import ensure_member_profile
from .models import (
    BlogPost,
    BuildMaterial,
    ClubEvent,
    EVENT_IMAGE_EXTENSIONS,
    EVENT_VIDEO_EXTENSIONS,
    LibraryAsset,
    LibraryFolder,
)


FILE_INPUT_CLASS = 'file-upload__input'


class BlogPostForm(forms.ModelForm):
    clear_featured_image = forms.BooleanField(
        required=False,
        label='Remove featured image',
    )

    class Meta:
        model = BlogPost
        fields = ['title', 'excerpt', 'content', 'featured_image', 'published']
        widgets = {
            'excerpt': forms.TextInput(attrs={'placeholder': 'One-line summary for lists and previews'}),
            'content': forms.Textarea(attrs={'rows': 16}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['featured_image'].widget.attrs.update({
            'class': FILE_INPUT_CLASS,
            'data-file-input': '',
        })

    def save(self, commit=True):
        post = super().save(commit=False)
        if self.cleaned_data.get('clear_featured_image') and post.featured_image:
            post.featured_image.delete(save=False)
            post.featured_image = None
        if commit:
            post.save()
        return post


class BuildMaterialForm(forms.ModelForm):
    class Meta:
        model = BuildMaterial
        fields = [
            'material_type',
            'name',
            'summary',
            'used_for',
            'purchase_url',
            'access',
            'sort_order',
            'published',
        ]
        widgets = {
            'summary': forms.TextInput(attrs={'placeholder': 'Part name, kit, or tool summary'}),
            'used_for': forms.TextInput(attrs={'placeholder': 'What a member needs this for when building'}),
            'purchase_url': forms.URLInput(attrs={'placeholder': 'https://vendor.example/part'}),
            'access': forms.TextInput(attrs={'placeholder': 'Ask avionics lead, Seneca shop, etc.'}),
        }


class LibraryFolderForm(forms.ModelForm):
    class Meta:
        model = LibraryFolder
        fields = ['name', 'sort_order']
        widgets = {
            'name': forms.TextInput(attrs={'placeholder': 'Launch Canada, Field Photos, CAD, etc.'}),
        }


class LibraryAssetForm(forms.ModelForm):
    new_folder = forms.CharField(
        required=False,
        label='Or create new folder',
        widget=forms.TextInput(attrs={'placeholder': 'New folder name'}),
    )
    upload = forms.FileField(
        required=False,
        label='File',
        widget=forms.ClearableFileInput(attrs={
            'class': FILE_INPUT_CLASS,
            'data-file-input': '',
        }),
    )
    clear_upload = forms.BooleanField(required=False, label='Remove current file')

    class Meta:
        model = LibraryAsset
        fields = ['title', 'kind', 'folder', 'description', 'published']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['folder'].queryset = LibraryFolder.objects.all()
        self.fields['folder'].required = False
        self.fields['folder'].empty_label = 'No folder'
        if self.instance.pk and self.instance.has_file:
            self.fields['upload'].label = 'Replace file'

    def clean(self):
        cleaned = super().clean()
        upload = cleaned.get('upload')
        clear_upload = cleaned.get('clear_upload')
        has_existing = self.instance.pk and self.instance.has_file

        if cleaned.get('new_folder') and cleaned.get('folder'):
            raise forms.ValidationError('Choose an existing folder or create a new one, not both.')
        if not upload and not has_existing and not clear_upload:
            raise forms.ValidationError('Choose a file to upload.')
        return cleaned

    def save(self, commit=True):
        asset = super().save(commit=False)
        new_folder = self.cleaned_data.get('new_folder', '').strip()
        if new_folder:
            folder, _ = LibraryFolder.objects.get_or_create(name=new_folder)
            asset.folder = folder
        upload = self.cleaned_data.get('upload')
        clear_upload = self.cleaned_data.get('clear_upload')

        if clear_upload:
            if asset.image:
                asset.image.delete(save=False)
                asset.image = None
            if asset.reference_file:
                asset.reference_file.delete(save=False)
                asset.reference_file = None
            asset.source_path = ''

        if upload:
            if asset.image:
                asset.image.delete(save=False)
                asset.image = None
            if asset.reference_file:
                asset.reference_file.delete(save=False)
                asset.reference_file = None
            asset.source_path = ''

            if asset.kind == LibraryAsset.AssetKind.IMAGE:
                asset.image = upload
            else:
                asset.reference_file = upload

        if commit:
            asset.save()
        return asset


class ClubEventForm(forms.ModelForm):
    start_date = forms.DateField(
        required=False,
        label='Start date',
        widget=forms.DateInput(
            attrs={'type': 'date', 'class': 'datetime-split__input'},
        ),
    )
    start_time = forms.TimeField(
        required=False,
        label='Start time',
        widget=forms.TimeInput(
            attrs={'type': 'time', 'class': 'datetime-split__input', 'step': '60'},
        ),
    )
    clear_image = forms.BooleanField(
        required=False,
        label='Remove image or video',
    )

    class Meta:
        model = ClubEvent
        fields = [
            'title',
            'date_label',
            'summary',
            'description',
            'location',
            'image',
            'published',
        ]
        widgets = {
            'date_label': forms.TextInput(attrs={'placeholder': 'Oct 2025 or Weekly'}),
            'summary': forms.TextInput(attrs={'placeholder': 'Short line for the events list'}),
            'description': forms.Textarea(attrs={'rows': 8}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['image'].label = 'Image or video'
        self.fields['image'].widget.attrs.update({
            'class': FILE_INPUT_CLASS,
            'data-file-input': '',
            'accept': 'image/*,video/mp4,video/quicktime,video/webm',
        })
        if self.instance.pk and self.instance.starts_at:
            local_starts_at = timezone.localtime(self.instance.starts_at)
            self.fields['start_date'].initial = local_starts_at.date()
            self.fields['start_time'].initial = local_starts_at.time().replace(second=0, microsecond=0)

    def clean_image(self):
        upload = self.cleaned_data.get('image')
        if not upload:
            return upload
        suffix = Path(upload.name).suffix.lower()
        allowed = EVENT_IMAGE_EXTENSIONS | EVENT_VIDEO_EXTENSIONS
        if suffix not in allowed:
            raise forms.ValidationError(
                'Upload an image (JPG, PNG, GIF, WebP) or video (MP4, MOV, WebM).',
            )
        return upload

    def save(self, commit=True):
        event = super().save(commit=False)
        start_date = self.cleaned_data.get('start_date')
        start_time = self.cleaned_data.get('start_time')
        if start_date and start_time:
            combined = datetime.combine(start_date, start_time)
            event.starts_at = timezone.make_aware(combined)
        elif start_date:
            event.starts_at = timezone.make_aware(datetime.combine(start_date, time.min))
        else:
            event.starts_at = None
        if self.cleaned_data.get('clear_image') and event.image:
            event.image.delete(save=False)
            event.image = None
        if commit:
            event.save()
        return event


class MemberSignupForm(SignupForm):
    first_name = forms.CharField(max_length=150, label='First name')
    last_name = forms.CharField(max_length=150, label='Last name')

    def save(self, request):
        user = super().save(request)
        user.first_name = self.cleaned_data['first_name']
        user.last_name = self.cleaned_data['last_name']
        user.is_active = False
        user.save(update_fields=['first_name', 'last_name', 'is_active'])
        ensure_member_profile(user)
        return user


class AdminMemberEditForm(forms.ModelForm):
    password = forms.CharField(
        required=False,
        widget=forms.PasswordInput(render_value=False),
        label='New password',
        help_text='Leave blank to keep the current password.',
    )

    class Meta:
        model = get_user_model()
        fields = ['username', 'email', 'first_name', 'last_name']
        widgets = {
            'username': forms.TextInput(attrs={'autocomplete': 'username'}),
            'email': forms.EmailInput(attrs={'autocomplete': 'email'}),
        }

    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get('password')
        if password:
            user.set_password(password)
        if commit:
            user.save()
        return user


class MemberLoginForm(LoginForm):
    def clean(self):
        login = self.data.get('login', '').strip()
        if login:
            from django.contrib.auth import get_user_model

            User = get_user_model()
            matches = User.objects.filter(
                Q(username__iexact=login) | Q(email__iexact=login),
                is_active=False,
            )
            if matches.filter(member_profile__is_banned=True).exists():
                raise forms.ValidationError(
                    'This account has been banned. Contact an administrator if you think this is a mistake.',
                )
            if matches.exists():
                raise forms.ValidationError(
                    'This account is pending admin approval. You can sign in once an administrator activates it.',
                )
        return super().clean()