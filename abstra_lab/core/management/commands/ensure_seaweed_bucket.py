from django.conf import settings
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Create the SeaweedFS S3 bucket if it does not exist yet.'

    def handle(self, *args, **options):
        if not settings.USE_SEAWEEDFS:
            raise CommandError('Set SEAWEEDFS_S3_ENDPOINT_URL to enable SeaweedFS storage.')

        try:
            import boto3
            from botocore.exceptions import ClientError
        except ImportError as exc:
            raise CommandError('Install boto3 and django-storages[s3] first.') from exc

        client = boto3.client(
            's3',
            endpoint_url=settings.SEAWEEDFS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.SEAWEEDFS_S3_ACCESS_KEY,
            aws_secret_access_key=settings.SEAWEEDFS_S3_SECRET_KEY,
            region_name=settings.SEAWEEDFS_S3_REGION_NAME,
            use_ssl=settings.SEAWEEDFS_S3_USE_SSL,
            verify=settings.SEAWEEDFS_S3_VERIFY_SSL,
        )
        bucket = settings.SEAWEEDFS_S3_BUCKET_NAME
        try:
            client.head_bucket(Bucket=bucket)
            self.stdout.write(f'Bucket "{bucket}" already exists.')
        except ClientError:
            client.create_bucket(Bucket=bucket)
            self.stdout.write(self.style.SUCCESS(f'Created bucket "{bucket}".'))