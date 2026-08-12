from django.core.exceptions import PermissionDenied

def admin_required(view_func):
    def wrapper(request, *args, **kwargs):
        if request.user.role != 'admin':
            raise PermissionDenied("Accès réservé aux admins")
        return view_func(request, *args, **kwargs)
    return wrapper


def manager_required(view_func):
    def wrapper(request, *args, **kwargs):
        if request.user.role not in ['admin', 'manager']:
            raise PermissionDenied("Accès réservé aux managers")
        return view_func(request, *args, **kwargs)
    return wrapper