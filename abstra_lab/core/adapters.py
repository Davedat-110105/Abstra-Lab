from allauth.account.adapter import DefaultAccountAdapter
from allauth.core.exceptions import ImmediateHttpResponse
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib import messages
from django.shortcuts import redirect


class MemberAccountAdapter(DefaultAccountAdapter):
    def save_user(self, request, user, form, commit=True):
        user = super().save_user(request, user, form, commit=False)
        user.is_active = False
        if commit:
            user.save()
        return user

    def get_signup_redirect_url(self, request):
        return '/accounts/pending/'

    def get_login_redirect_url(self, request):
        return '/dashboard/'


class MemberSocialAccountAdapter(DefaultSocialAccountAdapter):
    def save_user(self, request, sociallogin, form=None):
        user = super().save_user(request, sociallogin, form)
        user.is_active = False
        user.save(update_fields=['is_active'])
        return user

    def get_signup_redirect_url(self, request):
        return '/accounts/pending/'

    def get_login_redirect_url(self, request):
        return '/dashboard/'

    def pre_social_login(self, request, sociallogin):
        user = sociallogin.user
        if user.pk and not user.is_active:
            messages.info(
                request,
                'Your account is pending admin approval.',
            )
            raise ImmediateHttpResponse(redirect('/accounts/pending/'))

    def is_auto_signup_allowed(self, request, sociallogin):
        return True