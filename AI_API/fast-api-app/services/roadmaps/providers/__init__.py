from .base import ProviderCourseCandidate
from .coursera import CourseraProviderConnector
from .udacity import UdacityProviderConnector
from .udemy import UdemyProviderConnector

PROVIDER_CONNECTORS = {
    "coursera": CourseraProviderConnector(),
    "udemy": UdemyProviderConnector(),
    "udacity": UdacityProviderConnector(),
}

__all__ = [
    "ProviderCourseCandidate",
    "CourseraProviderConnector",
    "UdemyProviderConnector",
    "UdacityProviderConnector",
    "PROVIDER_CONNECTORS",
]
