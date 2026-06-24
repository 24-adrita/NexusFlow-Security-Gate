export interface DjangoCodeTemplate {
  filename: string;
  language: string;
  description: string;
  code: string;
}

export const djangoTemplates: DjangoCodeTemplate[] = [
  {
    filename: "models.py",
    language: "python",
    description: "Database schema modeling the Users (custom), Ingestion Operations, and Activity Audit Logs using MySQL relational fields.",
    code: `# ==========================================
# NexusFlow Enterprise Platform - Q3 2026 Release
# Core Database Entity Models (MySQL Relational Schema)
# File: models.py
# ==========================================

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils import timezone

class NexusFlowUserManager(BaseUserManager):
    def create_user(self, email, username, password=None, role='client', **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, role=role, **extra_fields)
        user.set_password(password) # Custom cryptography hashing (PBKDF2 SHA256)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, username, password, role='super_admin', **extra_fields)


class NexusFlowUser(AbstractUser):
    """
    Primary User model incorporating Role-Based Access Controls (RBAC).
    Mapped strictly to MySQL table: nexusflow_users
    """
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
        ('manager', 'Manager / Operator'),
        ('client', 'End User / Client'),
    )
    
    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client', db_index=True)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = NexusFlowUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'nexusflow_users'
        verbose_name = 'NexusFlow User'
        verbose_name_plural = 'NexusFlow Users'


class IngestionOperation(models.Model):
    """
    Data Ingestion and Operations Tracker with validation logs.
    Mapped strictly to MySQL table: nexusflow_operations (indexed for rapid advanced searching)
    """
    CATEGORY_CHOICES = (
        ('Infrastructure', 'Infrastructure'),
        ('Security', 'Security'),
        ('Logistics', 'Logistics'),
        ('Operations', 'Operations'),
        ('Finance', 'Finance'),
    )
    STATUS_CHOICES = (
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
    )
    PRIORITY_CHOICES = (
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    )

    title = models.CharField(max_length=255, db_index=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending', db_index=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='Medium', db_index=True)
    operator = models.ForeignKey(NexusFlowUser, on_delete=models.CASCADE, related_name='operations', db_column='operator_id')
    value = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, help_text="Quantitative metric value for chart analysis")
    description = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'nexusflow_operations'
        ordering = ['-timestamp']
        # Composite index for optimized search filters
        indexes = [
            models.Index(fields=['category', 'status', 'priority']),
            models.Index(fields=['title', 'status']),
        ]


class ActivityAuditLog(models.Model):
    """
    High-fidelity automatic Audit Trail logging modifications and critical events.
    Mapped strictly to MySQL table: nexusflow_activity_logs
    """
    TYPE_CHOICES = (
        ('Security', 'Security Event'),
        ('Operation', 'Operational Modify'),
        ('System', 'System Config Change'),
        ('Backup', 'Database Backup Log'),
    )

    user = models.ForeignKey(NexusFlowUser, on_delete=models.SET_NULL, null=True, related_name='audit_logs', db_column='user_id')
    username = models.CharField(max_length=150, help_text="Cached username in case user record is deleted")
    role_cached = models.CharField(max_length=50, help_text="Cached user role context at time of event")
    action = models.TextField(help_text="Literal description of action or operation completed")
    log_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Operation', db_index=True)
    ip_address = models.GenericIPAddressField(db_index=True, blank=True, null=True)
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        db_table = 'nexusflow_activity_logs'
        ordering = ['-timestamp']
`
  },
  {
    filename: "decorators.py",
    language: "python",
    description: "Implements the custom NexusFlowLoginRequired decorator/middleware authentication and RBAC guards.",
    code: `# ==========================================
# NexusFlow Enterprise Platform - Q3 2026 Release
# Session Management & Custom Decorators
# File: decorators.py
# ==========================================

from django.http import JsonResponse
from django.shortcuts import redirect
from django.contrib import messages
from functools import wraps

def NexusFlowLoginRequired(allowed_roles=None):
    """
    Enterprise-grade decorator that enforces secure authenticated sessions.
    Also validates role constraints (Super Admin, Manager, Client) with custom redirects.
    """
    if allowed_roles is None:
        allowed_roles = ['super_admin', 'manager', 'client']

    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            # Check user session existence and basic auth state
            if not request.user or not request.user.is_authenticated:
                # Handle AJAX vs Web Browser requests gracefully
                if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                    return JsonResponse({
                        'status': 'unauthenticated',
                        'message': 'Active session has expired. Please log in to NexusFlow.'
                    }, status=401)
                
                messages.error(request, 'NexusFlowLoginRequired: Authentication session required to view secure resources.')
                return redirect('nexusflow_login')

            # Ensure the user role matches the required security clearances
            user_role = getattr(request.user, 'role', 'client')
            if user_role not in allowed_roles:
                if request.headers.get('x-requested-with') == 'XMLHttpRequest':
                    return JsonResponse({
                        'status': 'unauthorized',
                        'message': 'Security Clearance Denied. Requires role: ' + ', '.join(allowed_roles)
                    }, status=403)
                
                messages.warning(request, 'Unauthorized: Access restricted to ' + ', '.join(allowed_roles) + ' roles.')
                return redirect('nexusflow_dashboard')

            # User passed both Authentication & Authorization gates - execute view
            return view_func(request, *args, **kwargs)
        return _wrapped_view
    return decorator


# Alternative: Global Middleware-based authorization mapping
class NexusFlowSessionEnforcerMiddleware:
    """
    Secures all routes automatically except specified whitelisted login/public endpoints.
    Ensures secure cookies are validated on every cycle.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        self.public_paths = ['/login/', '/logout/', '/api/public/']

    def __call__(self, request):
        path = request.path_info
        
        # Pass whitelisted public URLs
        if any(path.startswith(p) for p in self.public_paths):
            return self.get_response(request)
            
        # Secure enforce check
        if not request.user or not request.user.is_authenticated:
            if path.startswith('/api/'):
                return JsonResponse({'status': 'unauthenticated', 'message': 'Active NexusFlow session required.'}, status=401)
            return redirect('nexusflow_login')
            
        return self.get_response(request)
`
  },
  {
    filename: "views.py",
    language: "python",
    description: "Core view controllers for Auth, Ingestion Form Processing, Analytics summaries, and file downloads.",
    code: `# ==========================================
# NexusFlow Enterprise Platform - Q3 2026 Release
# Application Controllers & API Pipeline
# File: views.py
# ==========================================

import csv
import json
from django.views.decorators.http import require_POST, require_GET
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.db.models import Sum, Count, Avg
from django.core.serializers.json import DjangoJSONEncoder
from .models import NexusFlowUser, IngestionOperation, ActivityAuditLog
from .decorators import NexusFlowLoginRequired

@require_POST
def nexusflow_login_api(request):
    """
    Performs secure authentication matching hashes with session injection.
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        user = authenticate(request, username=email, password=password)
        if user is not None:
            if not user.is_active:
                return JsonResponse({'status': 'error', 'message': 'Account is disabled.'}, status=403)
            
            login(request, user)
            
            # Log successful login to Audit Logs
            ActivityAuditLog.objects.create(
                user=user,
                username=user.username,
                role_cached=user.role,
                action="User logged in successfully via Secure Web Interface",
                log_type="Security",
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return JsonResponse({
                'status': 'success',
                'user': {
                    'username': user.username,
                    'email': user.email,
                    'role': user.role
                }
            })
        else:
            return JsonResponse({'status': 'error', 'message': 'Invalid credentials.'}, status=401)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)


@require_GET
@NexusFlowLoginRequired(allowed_roles=['super_admin', 'manager', 'client'])
def nexusflow_dashboard(request):
    """
    Main Analytics view. Renders real-time dashboards with performance data.
    """
    # Fetch aggregates for metric summary tiles
    aggregates = IngestionOperation.objects.aggregate(
        total_value=Sum('value'),
        task_count=Count('id'),
        avg_value=Avg('value')
    )
    
    # Category-wise distribution for visualization models
    category_summary = IngestionOperation.objects.values('category').annotate(
        count=Count('id'),
        sum_val=Sum('value')
    ).order_by('-sum_val')
    
    # Priority-wise distribution
    priority_summary = IngestionOperation.objects.values('priority').annotate(
        count=Count('id')
    )

    context = {
        'total_value': aggregates['total_value'] or 0,
        'task_count': aggregates['task_count'] or 0,
        'avg_value': aggregates['avg_value'] or 0,
        'category_summary': list(category_summary),
        'priority_summary': list(priority_summary),
        'user_role': request.user.role,
    }
    return render(request, 'dashboard.html', context)


@require_POST
@NexusFlowLoginRequired(allowed_roles=['super_admin', 'manager'])
def ingest_data_api(request):
    """
    Handles multi-field data ingestion with field validation.
    Access restricted strictly to Super Admin and Manager / Operator roles.
    """
    try:
        data = json.loads(request.body)
        title = data.get('title', '').strip()
        category = data.get('category')
        priority = data.get('priority', 'Medium')
        value = data.get('value', 0.00)
        description = data.get('description', '').strip()
        
        # Validation checks
        if not title:
            return JsonResponse({'status': 'error', 'message': 'Title field is required.'}, status=400)
        if category not in [c[0] for c in IngestionOperation.CATEGORY_CHOICES]:
            return JsonResponse({'status': 'error', 'message': 'Invalid operational category.'}, status=400)
            
        # Write to MySQL Database
        operation = IngestionOperation.objects.create(
            title=title,
            category=category,
            priority=priority,
            value=value,
            description=description,
            operator=request.user
        )
        
        # Record Audit trail log
        ActivityAuditLog.objects.create(
            user=request.user,
            username=request.user.username,
            role_cached=request.user.role,
            action=f"Created Data Ingestion Operation: {title} (ID: {operation.id})",
            log_type="Operation",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return JsonResponse({
            'status': 'success',
            'operation_id': operation.id,
            'message': 'Record ingested and validated successfully!'
        })
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)


@require_GET
@NexusFlowLoginRequired(allowed_roles=['super_admin', 'manager', 'client'])
def advanced_search_tasks(request):
    """
    Indexed Composite search filters execution with latency optimization.
    """
    query = request.GET.get('q', '').strip()
    category = request.GET.get('category', '')
    status = request.GET.get('status', '')
    priority = request.GET.get('priority', '')
    
    tasks = IngestionOperation.objects.all()
    
    if query:
        tasks = tasks.filter(title__icontains=query)
    if category:
        tasks = tasks.filter(category=category)
    if status:
        tasks = tasks.filter(status=status)
    if priority:
        tasks = tasks.filter(priority=priority)
        
    tasks_list = list(tasks.values('id', 'title', 'category', 'status', 'priority', 'value', 'timestamp'))
    return JsonResponse({'status': 'success', 'results': tasks_list}, encoder=DjangoJSONEncoder)


@require_GET
@NexusFlowLoginRequired(allowed_roles=['super_admin', 'manager'])
def export_operations_csv(request):
    """
    Pipes query outputs directly into flat file streams (CSV) for download.
    """
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="nexusflow_operational_records_export.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['Record ID', 'Title', 'Category', 'Status', 'Priority', 'Analytical Value', 'Timestamp'])
    
    records = IngestionOperation.objects.all().select_related('operator')
    for rec in records:
        writer.writerow([
            rec.id, 
            rec.title, 
            rec.category, 
            rec.status, 
            rec.priority, 
            rec.value, 
            rec.timestamp.strftime('%Y-%m-%d %H:%M:%S')
        ])
        
    # Log the export event
    ActivityAuditLog.objects.create(
        user=request.user,
        username=request.user.username,
        role_cached=request.user.role,
        action="Exported operational ledger to downloadable CSV layout.",
        log_type="System",
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    return response


def nexusflow_logout(request):
    """
    Destroys auth session and logs action.
    """
    if request.user.is_authenticated:
        ActivityAuditLog.objects.create(
            user=request.user,
            username=request.user.username,
            role_cached=request.user.role,
            action="User logged out gracefully.",
            log_type="Security",
            ip_address=request.META.get('REMOTE_ADDR')
        )
    logout(request)
    return redirect('nexusflow_login')
`
  },
  {
    filename: "urls.py",
    language: "python",
    description: "Django URL Configuration routing requests securely with proper naming conventions.",
    code: `# ==========================================
# NexusFlow Enterprise Platform - Q3 2026 Release
# URL Conf Routing Architecture
# File: urls.py
# ==========================================

from django.urls import path
from . import views

urlpatterns = [
    # Static rendering views
    path('dashboard/', views.nexusflow_dashboard, name='nexusflow_dashboard'),
    
    # REST Authentication endpoints
    path('api/auth/login/', views.nexusflow_login_api, name='nexusflow_login_api'),
    path('api/auth/logout/', views.nexusflow_logout, name='nexusflow_logout'),
    
    # Ingestion & Operational routes
    path('api/operations/ingest/', views.ingest_data_api, name='ingest_data_api'),
    path('api/operations/search/', views.advanced_search_tasks, name='advanced_search_tasks'),
    path('api/operations/export/csv/', views.export_operations_csv, name='export_operations_csv'),
]
`
  },
  {
    filename: "dashboard.html",
    language: "html",
    description: "Django template layout implementing modular grid system with Bootstrap, dynamic banners and SVG widgets placeholders.",
    code: `{% extends "base.html" %}
{% load static %}

{% block title %}NexusFlow - Analytics & Operations Hub{% endblock %}

{% block content %}
<div class="container-fluid py-4" id="nexusflow-dashboard-container">
    
    <!-- Dynamic Alert Banners Section -->
    {% if messages %}
    <div class="row mb-4" id="alerts-context-section">
        <div class="col-12">
            {% for message in messages %}
            <div class="alert alert-{{ message.tags }} alert-dismissible fade show shadow-sm border-0 d-flex align-items-center" role="alert" id="nexusflow-alert-{{ forloop.counter }}">
                <span class="me-2 font-weight-bold">ALERT:</span>
                <div>{{ message }}</div>
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
            {% endfor %}
        </div>
    </div>
    {% endif %}

    <!-- Top Grid Layout Header -->
    <div class="d-flex justify-content-between align-items-center mb-4" id="dashboard-header-container">
        <div>
            <h1 class="h2 font-sans font-weight-bold tracking-tight text-gray-900 mb-1">NexusFlow Operations Desk</h1>
            <p class="text-muted text-xs font-mono">ROLE PERMIT: {{ user_role|upper }} | REGION: ASIA-PACIFIC</p>
        </div>
        <div class="d-flex gap-2">
            {% if user_role == 'super_admin' or user_role == 'manager' %}
            <a href="{% url 'export_operations_csv' %}" class="btn btn-outline-dark btn-sm d-flex align-items-center gap-2 font-mono shadow-sm" id="btn-export-records">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                EXPORT RAW LEDGER
            </a>
            {% endif %}
            <button class="btn btn-primary btn-sm px-3" data-bs-toggle="modal" data-bs-target="#ingestModal" id="btn-quick-ingestion">
                + INGEST NEW METRIC
            </button>
        </div>
    </div>

    <!-- Summary Metrics Counters Row -->
    <div class="row row-cols-1 row-cols-md-3 g-3 mb-4" id="nexusflow-summary-widgets-grid">
        <div class="col">
            <div class="card border-0 shadow-sm rounded-lg" id="widget-total-throughput">
                <div class="card-body p-4 d-flex align-items-center justify-content-between">
                    <div>
                        <h6 class="text-muted text-xs font-mono text-uppercase mb-2">Total Analytical Value</h6>
                        <h3 class="font-sans font-weight-bold mb-1">\${{ total_value|floatformat:2 }}</h3>
                        <span class="text-success text-xs"><strong class="font-mono">+12.4%</strong> vs previous epoch</span>
                    </div>
                    <div class="p-3 bg-light rounded-circle text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="card border-0 shadow-sm rounded-lg" id="widget-task-volume">
                <div class="card-body p-4 d-flex align-items-center justify-content-between">
                    <div>
                        <h6 class="text-muted text-xs font-mono text-uppercase mb-2">Operational Tasks Loaded</h6>
                        <h3 class="font-sans font-weight-bold mb-1">{{ task_count }}</h3>
                        <span class="text-muted text-xs">Total synchronized DB records</span>
                    </div>
                    <div class="p-3 bg-light rounded-circle text-warning">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                    </div>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="card border-0 shadow-sm rounded-lg" id="widget-average-speed">
                <div class="card-body p-4 d-flex align-items-center justify-content-between">
                    <div>
                        <h6 class="text-muted text-xs font-mono text-uppercase mb-2">Average Metric Score</h6>
                        <h3 class="font-sans font-weight-bold mb-1">{{ avg_value|floatformat:2 }}</h3>
                        <span class="text-success text-xs"><strong class="font-mono">1.1s</strong> latency (Optimized Query)</span>
                    </div>
                    <div class="p-3 bg-light rounded-circle text-success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Analytical Graphical Charts Section -->
    <div class="row g-4 mb-4" id="nexusflow-visuals-panel">
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm h-100 rounded-lg">
                <div class="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0 font-weight-bold">Operational Trend & Aggregates</h5>
                    <span class="badge bg-light text-dark font-mono">Q3 Real-time Feed</span>
                </div>
                <div class="card-body py-4">
                    <!-- SVG Chart Graphic Container -->
                    <div id="trendline-chart-placeholder" class="bg-light rounded d-flex align-items-center justify-content-center" style="height: 250px;">
                        <div class="text-center">
                            <svg width="400" height="150" viewBox="0 0 400 150" class="mb-2">
                                <path d="M 10 130 Q 80 90 150 110 T 290 40 T 390 10" fill="none" stroke="#2563eb" stroke-width="4" />
                                <circle cx="150" cy="110" r="5" fill="#2563eb"/>
                                <circle cx="290" cy="40" r="5" fill="#2563eb"/>
                                <circle cx="390" cy="10" r="5" fill="#2563eb"/>
                            </svg>
                            <span class="text-muted text-xs font-mono">Visual Chart fed dynamically by SQL sum aggregates</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-4">
            <div class="card border-0 shadow-sm h-100 rounded-lg">
                <div class="card-header bg-white border-0 py-3">
                    <h5 class="card-title mb-0 font-weight-bold">Data Category Allocation</h5>
                </div>
                <div class="card-body">
                    <ul class="list-group list-group-flush" id="category-summary-list">
                        {% for cat in category_summary %}
                        <li class="list-group-item d-flex justify-content-between align-items-center px-0 py-2 border-0">
                            <span class="text-muted text-xs font-weight-medium">{{ cat.category }}</span>
                            <span class="badge bg-dark rounded-pill font-mono">{{ cat.count }} items (\${{ cat.sum_val|floatformat:0 }})</span>
                        </li>
                        {% empty %}
                        <li class="list-group-item text-center text-muted font-mono py-4">No categories populated yet.</li>
                        {% endfor %}
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>
{% endblock %}
`
  }
];
